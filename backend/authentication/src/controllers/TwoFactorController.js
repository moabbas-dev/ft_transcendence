const Session = require('../models/Session');
const User = require('../models/User');
const { generateTokens } = require('../utils/jwtUtils');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class TwoFactorCodeController {

	static async validateLoginCode(request, reply) {
		const { sessionUUID } = request.params;
		const { code } = request.body;
		try {
			const session = await Session.getByUUID(sessionUUID);
			if (!session)
				return reply.code(404).send({ key: "session", message: "Session not found!" });

			const userId = session.user_id;
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ key: "user", message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			// Retrieve the secret key from the user's database
			const secret = user.two_factor_secret;
			// Verify the TOTP code
			const verified = speakeasy.totp.verify({
				secret: secret,
				encoding: 'base32',
				token: code,
			});
			if (!verified)
				return reply.code(400).send({ key: "wrong", message: "Invalid code!" });

			// Generate tokens and update session
			const { accessToken, refreshToken } = await generateTokens(user, reply.server);
			await Session.updateAccessAndRefresh(session.id, { refreshToken, accessToken });
			await User.updateUserStatus(userId, { status: "online" });

			reply.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
				path: '/',
				domain: undefined
			});
	
			return reply.code(200).send({
				accessToken
			});
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
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			const secret = speakeasy.generateSecret({ length: 20 });
			await User.update2faSecret(userId, { twoFASecret: secret.base32 });
			const otpauthUrl = secret.otpauth_url; // URL for the QR code
			const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
			return reply.code(200).send({
				message: "Scan the QR code with Google Authenticator to enable 2FA",
				qrCodeDataUrl, // Send this to the frontend to display the QR code
				secret: secret.base32 // For debugging purposes (optional)
			});
		} catch (err) {
			return reply.code(500).send({ message: "Error while enabling 2fa!", error: err.message });
		}
	}

	static async validateEnableCode(request, reply) {
		const { userId } = request.params;
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
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ key: "user", message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			const secret = user.two_factor_secret;
			const verified = speakeasy.totp.verify({
				secret: secret,
				encoding: 'base32',
				token: code,
				// window: 1 // Allow a 30-second window for time drift
			});
			if (!verified)
				return reply.code(400).send({ key: "wrong", message: "Invalid code!" });
			await User.update2fa(userId, { value: 1 });
			return reply.code(200).send({ message: "Two factor authentication successfully enabled!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error activating 2fa!", error: err.message });
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
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			await User.update2fa(userId, { value: 0 });
			await User.update2faSecret(userId, { twoFASecret: null });
			return reply.code(200).send({ message: "Two Factor Authentication for user has been disabled!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error disabling the 2fa!", error: err.message });
		}
	}
}

module.exports = TwoFactorCodeController;