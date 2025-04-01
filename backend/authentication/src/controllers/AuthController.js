const { db } = require('../db/initDb');
const bcrypt = require('bcrypt');
const Session = require('../models/Session');
const User = require('../models/User');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const { generateTokens } = require('../utils/jwtUtils');
const UserToken = require('../models/UserToken');
const axios = require('axios');
const { validatePassword, validateNickname, capitalizeFullName } = require('../utils/validationUtils');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const authenticateUser = async (email, password) => {
	const query = `SELECT * FROM Users WHERE email = ?`;

	return new Promise((resolve, reject) => {
		db.get(query, [email], async (err, user) => {
			if (err) {
				reject(new Error("Database error"));
				return;
			}
			if (!user) {
				reject(new Error("Incorrect email"));
				return;
			}
			if (user && !user.is_active) {
				reject(new Error("User not active"));
				return;
			}
			if (user && !user.password) {
				reject(new Error("Invalid password"));
				return;
			}
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid) {
				reject(new Error("Invalid password"));
				return;
			}

			resolve(user);
		});
	});
};

async function verifyGoogleToken(idToken) {
	const ticket = await client.verifyIdToken({
		idToken: idToken,
		audience: process.env.CLIENT_ID, // Must match your Google OAuth2 client ID
	});
	return ticket.getPayload();
}

const generateNickname = async (userId) => {
	const randomString = Math.random().toString(36).substring(2, 7); // Generates a 5-letter string
	const nickname = `user${userId}${randomString}`;

	// Ensure it passes validation and is unique
	if (!validateNickname(nickname) || await User.findByNickname(nickname)) {
		return generateNickname(userId); // Retry if invalid or not unique
	}
	return nickname;
};

class AuthController {

	// Login a user
	static async login(request, reply) {
		const { email, password } = request.body;
		try {
			const user = await authenticateUser(email, password);
			const userId = user.id;
			if (!user.is_2fa_enabled) {
				const { accessToken, refreshToken } = await generateTokens(user, reply.server);
				const sessId = await Session.create({ userId, accessToken, refreshToken });
				await User.updateUserStatus(userId, { status: "online" });
				return reply.code(200).send({
					require2FA: false, sessionId: sessId, accessToken: accessToken, refreshToken: refreshToken,
					// userId: user.id, email: user.email, nickname: user.nickname, fullName: user.full_name,
					// avatarUrl: user.avatar_url
				});
			} else {
				const sessId = await Session.create({ userId, accessToken: null, refreshToken: null });
				reply.server.log.info(`sessId: ${sessId}`);
				return reply.code(200).send({ require2FA: true, sessionId: sessId });
			}
		} catch (err) {
			// Handle specific error messages
			if (err.message === "Incorrect email" || err.message === "Invalid password") {
				return reply.code(404).send({ message: err.message });
			}
			if (err.message === "User not active")
				return reply.code(403).send({ message: `${err.message}! check your inbox and activate your account` });
			// Default to 500 for any other server-side error
			return reply.code(500).send({ message: 'Error with login from the server!', error: err.message });
		}
	}

	// Logout a user
	static async logout(request, reply) {
		const { sessionId } = request.params;
		try {
			const session = await Session.getById(sessionId);
			if (!session)
				return reply.code(404).send({ message: "Session not found!" });
			else {
				await Session.deleteById(session.id);
				await User.updateUserStatus(session.user_id, { status: "offline" });
				return reply.code(200).send({ message: "User logged out successfully!" });
			}
		} catch (err) {
			return reply.code(500).send({ message: "Error with logout from the server!", error: err.message });
		}
	}

	static async verifyResetEmail(request, reply) {
		const { email } = request.body;
		const passwordResetEmailMessage = (fullName, uuid) => {
			return `
				<div>
					<p>Dear ${fullName}, </p>
					<p>Please follow the below link to reset your password. </p>
					<p>${process.env.FRONTEND_DOMAIN}/reset_password/${uuid} </p>
					<p>Have a nice day! </p>
				</div>
			`;
		}
		try {
			const user = await User.findByEmail(email);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			const userId = user.id;
			const uuid = crypto.randomUUID();
			try {
				await axios.post(`https://localhost:8000/notifications/email/${userId}`, {
					email: user.email,
					subject: "Reset password email",
					body: passwordResetEmailMessage(user.full_name, uuid),
				});
				await UserToken.create({ userId, activationToken: uuid, tokenType: "reset_password" });
				return reply.code(200).send({ message: "Email sent successfully!" });
			} catch (err) {
				return reply.code(500).send({ message: "Error sending email request!", error: err.message });
			}
		} catch (err) {
			return reply.code(500).send({ message: "Error verifying the email for the password reset!", error: err.message });
		}
	}

	static async validateResetPassword(request, reply) {
		const { uuid } = request.params;
		const { password, verifyPassword } = request.body;
		try {
			const tokenRecord = await UserToken.getByToken(uuid);
			if (!tokenRecord)
				return reply.code(404).send({ message: "Token not found!" });
			if (tokenRecord.token_type !== "reset_password")
				return reply.code(403).send({ message: "Token is not for reset password!" });
			// Check if the token has expired (24 hours expiration)
			const expiresAt = tokenRecord.expires_at;
			const userId = tokenRecord.user_id;
			const tokenExpirationTime = new Date(expiresAt).getTime(); // Get the expiration time in milliseconds
			const currentTime = new Date().getTime(); // Get the current time in milliseconds

			// Check if the token has expired (24 hours expiration)
			if (currentTime > tokenExpirationTime) {
				await UserToken.deleteByToken(UserToken); // Delete expired token
				return reply.code(400).send({ message: "Token has expired!" });
			}
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			if (!validatePassword(password) || !validatePassword(verifyPassword))
				return reply.code(400).send({ message: "Incorrect password format!" });
			if (password !== verifyPassword)
				return reply.code(400).send({ message: "passwords didn't match!" });
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.updateUserPassword(userId, { password: hashedPassword });
			await UserToken.deleteByToken(uuid);
			return reply.code(200).send({ message: "password changed successfully!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error resetting password!", error: err.message });
		}
	}

	static async activateUser(request, reply) {
		const { token } = request.params;
		try {
			const tokenRecord = await UserToken.getByToken(token);
			if (!tokenRecord)
				return reply.code(404).send({ message: "Token not found!" });
			if (tokenRecord.token_type !== "account_activation")
				return reply.code(403).send({ message: "Token is not for account activation!" });
			// Check if the token has expired (24 hours expiration)
			const expiresAt = tokenRecord.expires_at;
			const userId = tokenRecord.user_id;
			const tokenExpirationTime = new Date(expiresAt).getTime(); // Get the expiration time in milliseconds
			const currentTime = new Date().getTime(); // Get the current time in milliseconds

			// Check if the token has expired (24 hours expiration)
			if (currentTime > tokenExpirationTime) {
				await UserToken.deleteByToken(UserToken); // Delete expired token
				await User.delete(userId);
				return reply.code(400).send({ message: "Token has expired!" });
			}
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			await User.activateUser(userId);
			await UserToken.deleteByToken(UserToken); // Delete expired token
			// return reply.code(200).send({ message: "Account activation complete!" });
			return reply.redirect(`${process.env.FRONTEND_DOMAIN}/`);
		} catch (err) {
			return reply.code(500).send({ message: "Error activating the account!", error: err.message });
		}
	}

	static async googleRemoteAuthenticate(request, reply) {
		try {
			const token = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			const googleUser = await verifyGoogleToken(token.token.id_token);  // Verifies authenticity

			if (!googleUser.email_verified) {
				return reply.code(400).send({ message: "Google email is not verified" });
			}
			// Fetch user info from Google
			const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${token.token.access_token}`,
				},
			});

			const userInfo = await userInfoResponse.json();

			// Send response with user info
			let user = await User.findByEmail(userInfo.email);
			const hashedGoogleId = await bcrypt.hash(userInfo.id, 10);
			if (!user) {
				const userData = {
					email: userInfo.email,
					password: null,
					nickname: null,
					full_name: capitalizeFullName(userInfo.name),
					age: null,
					country: null,
					google_id: hashedGoogleId
				}
				const newUserId = await User.create(userData);
				if (!newUserId) {
					throw new Error("Failed to create user");
				}
				const nickname = await generateNickname(newUserId);
				await User.updateUserNickname(newUserId, { nickname: nickname });
				user = await User.findById(newUserId);
			}
			const userId = user.id;
			if (!user.googleId)
				await User.updateUserGoogleID(userId, { googleId: hashedGoogleId });
			if (!user.is_active)
				await User.activateUser(userId);
			let sessId;
			if (!user.is_2fa_enabled) {
				const { accessToken, refreshToken } = await generateTokens(user, request.server);
				sessId = await Session.create({ userId, accessToken, refreshToken });
				await User.updateUserStatus(userId, { status: "online" });
			} else
				sessId = await Session.create({ userId, accessToken: null, refreshToken: null });
			reply.setCookie('sessionId', sessId, {
				httpOnly: true,  // Prevents client-side JS access
				secure: false,    // Ensures cookie is sent over HTTPS only
				sameSite: 'Strict',  // Prevents cross-site request forgery (CSRF)
				path: '/',       // Cookie accessible across the entire site
				maxAge: 60 * 60 * 24 // Expires in 24 hours
			});
			if (!user.is_2fa_enabled)
				return reply.redirect(`${process.env.FRONTEND_DOMAIN}/play`);
			else
				return reply.redirect(`${process.env.FRONTEND_DOMAIN}/register/twofactor`);
		} catch (err) {
			request.log.error(err);
			return reply.code(500).send({ message: 'Authentication failed', error: err.message });
		}
	}

	static async googlesignIn(request, reply) {
		try {
			console.log("Received cookies:", request.cookies);
			const sessionId = request.cookies.sessionId;
			if (!sessionId)
				return reply.code(401).send({ key: "cookie", message: "No session ID found. Please log in." });
			const session = await Session.getById(sessionId);
			if (!session)
				return reply.code(401).send({ key: "not-found", message: "Invalid session id! please login again" });
			if (!session.access_token && !session.refresh_token)
				return reply.code(200).send({ sessionId });
			else
				return reply.code(200).send({ sessionId, accessToken: session.access_token, refreshToken: session.refresh_token });
		} catch (err) {
			return reply.code(500).send({ message: "Error with google sign in!", error: err.message });
		}
	}
}

module.exports = AuthController;