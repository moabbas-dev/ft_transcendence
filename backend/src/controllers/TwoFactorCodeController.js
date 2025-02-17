const SessionService = require('../services/SessionService');
const TwoFactorCodeService = require('../services/TwoFactorCodeService');
const UserService = require('../services/UserService');
const { generate2FACode } = require('../utils/codeUtils');
const { sendEmail, TwoFactorCodehtmlContent } = require('../utils/emailUtils');
const { generateTokens } = require('../utils/jwtUtils');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

class TwoFactorCodeController {

	static async getAllCodes(request, reply) {
		try {
			const codes = await TwoFactorCodeService.getAllCodes();
			reply.code(200).send(codes);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting all the codes!', error: err.message });
		}
	}

	static async getCodeById(request, reply) {
		const { id } = request.params;
		try {
			const code = await TwoFactorCodeService.getCodeById(id);
			if (!code) reply.code(404).send({ message: 'Code not found!' });
			else reply.code(200).send(code);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting the code!', error: err.message });
		}
	}

	static async deleteCode(request, reply) {
		const { id } = request.params;
		try {
			const changes = await TwoFactorCodeService.deleteCode(id);
			if (changes == 0) reply.code(404).send({ message: 'Code not found!' });
			else reply.code(200).send({ message: 'Code deleted successfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the code!', error: err.message });
		}
	}

	static async regenerateLoginCode(request, reply) {
		const { sessionId } = request.params;
		try {
			const code = generate2FACode();
			const session = await SessionService.getSessionById(sessionId);
			if (!session)
				return reply.code(404).send({ key: "session", message: "session not found!" });
			const userId = session.user_id;
			const user = await UserService.getUserById(userId);
			if (!user)
				reply.code(404).send({ key: "user", message: "User not found!" });
			const tfCodeId = await TwoFactorCodeService.createTwoFactorCode({ userId, code });
			try {
				sendEmail(user.email, "Generating new two factor code for login", null, TwoFactorCodehtmlContent(user, code));
			} catch (err) {
				return reply.code(500).send({ message: "Error sending the email!", error: err.message });
			}
			return reply.code(201).send(tfCodeId);
		} catch (err) {
			return reply.code(500).send({ message: "Error regenerating the code!", error: err.message });
		}
	}

	static async validateLoginCode(request, reply) {
		const { sessionId, codeId } = request.params;
		const { code } = request.body;
		try {
			const tfCode = await TwoFactorCodeService.getCodeById(codeId);
			if (!tfCode)
				return reply.code(404).send({ key: "tfCode", message: "Two factor code not found!" });
			const expiresAt = new Date(tfCode.expires_at).getTime();
			if (Date.now() >= expiresAt) {
				await TwoFactorCodeService.deleteCode(codeId);
				return reply.code(400).send({ key: "expired", message: "Code was expired!" });
			}
			if (code !== tfCode.code)
				return reply.code(400).send({ key: "wrong", message: "Wrong code!" });
			const user = await UserService.getUserById(tfCode.user_id);
			if (!user)
				return reply.code(404).send({ key: "user", message: "User not found!" });
			await TwoFactorCodeService.deleteCode(codeId);
			const { accessToken, refreshToken } = await generateTokens(user, reply.server);
			await SessionService.updateAccessAndRefresh(sessionId, { refreshToken, accessToken });
			await UserService.updateUserStatus(tfCode.user_id, { status: "online" });
			return reply.code(200).send({ sessionId: sessionId, accessToken: accessToken, refreshToken: refreshToken });
		} catch (err) {
			return reply.code(500).send({ message: "Error validating the code!", error: err.message });
		}
	}

	static async enable2faForUser(request, reply) {
		const { userId } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			const code = generate2FACode();
			const tfCodeId = await TwoFactorCodeService.createTwoFactorCode({ userId, code });
			try {
				sendEmail(user.email, "Activating two factor authentication", null, TwoFactorCodehtmlContent(user, code));
			} catch (err) {
				return reply.code(500).send({ message: "Error sending email!", error: err.message });
			}
			return reply.code(200).send({ tfCodeId });
		} catch (err) {
			return reply.code(500).send({ message: "Error while enabling 2fa!", error: err.message });
		}
	}

	static async validateEnableCode(request, reply) {
		const { userId, codeId } = request.params;
		const { code } = request.body;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			if (!user)
				return reply.code(404).send({ key: "user", message: "User not found!" });
			const tfCode = await TwoFactorCodeService.getCodeById(codeId);
			if (!tfCode)
				return reply.code(404).send({ key: "code", message: "Two factor code not found!" });
			const expiresAt = new Date(tfCode.expires_at).getTime();
			if (Date.now() >= expiresAt) {
				await TwoFactorCodeService.deleteCode(codeId);
				return reply.code(400).send({ key: "expired", message: "Code was expired!" });
			}
			if (code !== tfCode.code)
				return reply.code(400).send({ key: "wrong", message: "Wrong code!" });
			await UserService.update2fa(userId, { value: 1 });
			await TwoFactorCodeService.deleteCode(codeId);
			return reply.code(200).send({ message: "Two factor authentication successfully enabled!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error activating 2fa!", error: err.message });
		}
	}

	static async regenerateEnableCode(request, reply) {
		const { userId } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const code = generate2FACode();
			const user = await UserService.getUserById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			const tfCodeId = await TwoFactorCodeService.createTwoFactorCode({ userId, code });
			try {
				sendEmail(user.email, "Generating new two factor code for enabling 2fa", null, TwoFactorCodehtmlContent(user, code));
			} catch (err) {
				return reply.code(500).send({ message: "Error sending the email!", error: err.message });
			}
			return reply.code(201).send(tfCodeId);
		} catch (err) {
			return reply.code(500).send({ message: "Error regenerating the code for enabling 2fa!", error: err.message });
		}
	}

	static async disable2faForUser(request, reply) {
		const { userId } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			await UserService.update2fa(userId, { value: 0 });
			return reply.code(200).send({ message: "Two Factor Authentication for user has been disabled!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error disabling the 2fa!", error: err.message });
		}
	}
}

module.exports = TwoFactorCodeController;