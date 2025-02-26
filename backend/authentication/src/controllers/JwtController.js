const User = require('../models/User');
const Session = require('../models/Session');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const { generateNewAccessToken } = require('../utils/jwtUtils');

class JwtController {

    // refresh an expired access token
	static async refresh(request, reply) {
        const { sessionId } = request.params;
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
			const session = await Session.getById(sessionId);
			if (!session)
				return reply.code(404).send({ message: "No session found!" });
			const user = await User.findById(userId);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			const newAccessToken = await generateNewAccessToken(user, reply.server);
			await Session.updateAccess(session.id, { newAccessToken });
			return reply.code(200).send({ accessToken: newAccessToken });
		} catch (err) {
			return reply.code(500).send({ message: "Error refreshing the token!", error: err.message });
		}
	}

    // validate an access token
    static async validateAccessToken(request, reply) {
        const { userId } = request.params;
        const { accessToken } = request.body;
        try {
            let decoded;
            try {
                decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
            } catch (err) {
                if (err.name === 'TokenExpiredError')
                    return reply.code(401).send({ message: "Access token expired!" });
                return reply.code(401).send({ message: "Invalid access token!" });
            }
            if (decoded.userId !== userId)
                return reply.code(403).send({ message: "Token does not belong to this user!" });
            return reply.code(200).send({ message: "The token is valid!" });
        } catch (err) {
            return reply.code(500).send({ message: "Error validating the access token!", error: err.message });
        }
    }
}

module.exports = JwtController;