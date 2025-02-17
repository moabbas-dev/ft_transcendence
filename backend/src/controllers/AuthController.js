const { db } = require('../../index');
const bcrypt = require('bcrypt');
const SessionService = require('../services/SessionService');
const UserService = require('../services/UserService');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const { generateTokens, generateNewAccessToken } = require('../utils/jwtUtils');
const TwoFactorCodeService = require('../services/TwoFactorCodeService');
const { sendEmail, TwoFactorCodehtmlContent} = require('../utils/emailUtils');
const { generate2FACode } = require('../utils/codeUtils');

const authenticateUser = async (email, password) => {
	const query = `SELECT * FROM Users WHERE email = ?`;

	return new Promise((resolve, reject) => {
		db.get(query, [email], async (err, user) => {
			if (err) {
				reject(new Error("Database error"));
				return;
			}
			if (!user) {
				reject(new Error("User not found"));
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
				return reply.code(200).send({ sessionId: sessId, accessToken: accessToken, refreshToken: refreshToken });
			} else {
				const sessId = await SessionService.createSession({ userId, accessToken: null, refreshToken: null });
				reply.server.log.info(`sessId: ${sessId}`);
				const tfaCode = generate2FACode();
				const tfCodeId = await TwoFactorCodeService.createTwoFactorCode({ userId, code: tfaCode });
				try {
					await sendEmail(user.email, "Two Factor code for login", null, TwoFactorCodehtmlContent(user, tfaCode));
				} catch (err) {
					return reply.code(500).send({ error: err.message });
				}
				return reply.code(200).send({ sessionId: sessId, twoFactorCodeId: tfCodeId });
			}
		} catch (err) {
			// Handle specific error messages
			if (err.message === "User not found" || err.message === "Invalid password") {
				return reply.code(404).send({ message: err.message });
			}
			// Default to 500 for any other server-side error
			return reply.code(500).send({ message: 'Error with login from the server!', error: err.message });
		}
	}

	// Logout a user
	static async logout(request, reply) {
		const { id, refreshToken } = request.body;
		try {
			const user = await UserService.getUserById(id);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			else {
				const session = await SessionService.getSessionByUserIdAndRefreshToken(user.id, refreshToken);
				if (!session)
					return reply.code(404).send({ message: "No session found for this user!" });
				else {
					await SessionService.deleteSessionByUserId(user.id, refreshToken);
					await UserService.updateUserStatus(user.id, { status: "offline" });
					return reply.code(200).send({ message: "User logged out successfully!" });
				}
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
			const newAccessToken = await generateNewAccessToken(user, reply.server);
			await SessionService.updateAccessToken(user.id, { refreshToken, newAccessToken });
			return reply.code(200).send({ accessToken: newAccessToken });
		} catch (err) {
			return reply.code(500).send({ message: "Error refreshing the token!", error: err.message });
		}
	}
}

module.exports = AuthController;