const { db } = require('../db/initDb');
const bcrypt = require('bcrypt');
const SessionService = require('../services/SessionService');
const UserService = require('../services/UserService');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const { generateTokens, generateNewAccessToken } = require('../utils/jwtUtils');
const speakeasy = require('speakeasy');
const { sendEmail } = require('../utils/emailUtils');

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
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid) {
				reject(new Error("Invalid password"));
				return;
			}

			resolve(user);
		});
	});
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
				const sessId = await SessionService.createSession({ userId, accessToken, refreshToken });
				await UserService.updateUserStatus(userId, { status: "online" });
				return reply.code(200).send({ require2FA: false, sessionId: sessId, accessToken: accessToken, refreshToken: refreshToken });
			} else {
				const sessId = await SessionService.createSession({ userId, accessToken: null, refreshToken: null });
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
			const session = await SessionService.getSessionById(sessionId);
			if (!session)
				return reply.code(404).send({ message: "Session not found!" });
			else {
				await SessionService.deleteSessionById(session.id);
				await UserService.updateUserStatus(session.user_id, { status: "offline" });
				return reply.code(200).send({ message: "User logged out successfully!" });
			}
		} catch (err) {
			return reply.code(500).send({ message: "Error with logout from the server!", error: err.message });
		}
	}

	// refresh an expired access token
	static async refresh(request, reply) {
		const { refreshToken } = request.body;
		try {
			let decoded;
			try {
				decoded = request.server.jwt.verify(refreshToken, SECRET_KEY);
			} catch (error) {
				if (error.message.includes('expired'))
					return reply.code(401).send({ message: "Refresh token expired!" });
				return reply.code(401).send({ message: "Invalid refresh token!" });
			}
			const userId = decoded.userId;
			const session = await SessionService.getSessionByUserIdAndRefreshToken(userId, refreshToken);
			if (!session)
				return reply.code(404).send({ message: "No session found!" });
			const user = await UserService.getUserById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			const newAccessToken = await generateNewAccessToken(user, reply.server);
			await SessionService.updateAccessToken(user.id, { refreshToken, newAccessToken });
			return reply.code(200).send({ accessToken: newAccessToken });
		} catch (err) {
			return reply.code(500).send({ message: "Error refreshing the token!", error: err.message });
		}
	}

	static async verifyResetEmail(request, reply) {
		const { email } = request.body;
		const passwordResetEmailMessage = (user) => {
			return `
				<div>
					<p>Dear ${user.full_name}, </p>
					<p>Please follow the below link to reset your password. </p>
					<p>${process.env.FRONTEND_DOMAIN}/reset_password/${user.id} </p>
					<p>Have a nice day! </p>
				</div>
			`;
		}
		try {
			const user = await UserService.getUserByEmail(email);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			try {
				await sendEmail(user.email, "Reset password email", null, passwordResetEmailMessage(user));
			} catch (err) {
				return reply.code(500).send({ error: err.message });
			}
			return reply.code(200).send({ message: "Email sent successfully!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error verifying the email for the password reset!", error: err.message });
		}
	}

	static async validateResetPassword(request, reply) {
		const { id } = request.params;
		const { password, verifyPassword } = request.body;
		try {
			const user = await UserService.getUserById(id);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			if (password !== verifyPassword)
				return reply.code(400).send({ message: "passwords didn't match!" });
			const hashedPassword = await bcrypt.hash(password, 10);
			await UserService.updateUserPassword(id, { password: hashedPassword });
			return reply.code(200).send({ message: "password changed successfully!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error resetting password!", error: err.message });
		}
	}

	static async activateUser(request, reply) {
		const { id } = request.params;
		try {
			const user = await UserService.getUserById(id);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			await UserService.activateUser(id);
			return reply.code(200).send({ message: "Account activation complete!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error activating the account!", error: err.message });
		}
	}

	static async googleRemoteAuthenticate(request, reply) {
		try {
			const token = await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

			// Fetch user info from Google
			const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${token.token.access_token}`,
				},
			});

			const userInfo = await userInfoResponse.json();

			// Send response with user info
			let user = await UserService.getUserByEmail(userInfo.email);
			if (!user) {
				const userData = {
					email: userInfo.email,
					password: null,
					nickname: null,
					full_name: userInfo.name,
					google_id: userInfo.id
				}
				const newUserId = await UserService.createUser(userData);
				if (!newUserId) {
					throw new Error("Failed to create user");
				}
				const nickname = `user${newUserId}`;
				await UserService.updateUserNickname(newUserId, { nickname: nickname });
				user = await UserService.getUserById(newUserId);
			}
			const userId = user.id;
			await UserService.activateUser(userId);
			if (!user.is_2fa_enabled) {
				const { accessToken, refreshToken } = await generateTokens(user, request.server);
				const sessId = await SessionService.createSession({ userId, accessToken, refreshToken });
				await UserService.updateUserStatus(userId, { status: "online" });
				return reply.code(200).send({ require2FA: false, sessionId: sessId, accessToken, refreshToken });
			} else {
				const sessId = await SessionService.createSession({ userId, accessToken: null, refreshToken: null });
				return reply.code(200).send({ require2FA: true, sessionId: sessId });
			}
		} catch (err) {
			request.log.error(err);
			return reply.code(500).send({ message: 'Authentication failed', error: err.message });
		}
	}
}

module.exports = AuthController;