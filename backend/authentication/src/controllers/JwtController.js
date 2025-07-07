const User = require('../models/User');
const Session = require('../models/Session');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const { generateNewAccessToken } = require('../utils/jwtUtils');

class JwtController {

	static async refresh(request, reply) {
        const { sessionId } = request.params;
		const refreshToken = request.cookies.refreshToken;

		if (!refreshToken) {
			return reply.code(401).send({ message: "No refresh token provided!" });
		}

		try {
			let decoded;
			try {
				decoded = request.server.jwt.verify(refreshToken, SECRET_KEY);
			} catch (error) {
				reply.clearCookie('refreshToken');
				if (error.message.includes('expired'))
					return reply.code(401).send({ message: "No refresh token provided!" });
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

	static async refreshFromCookie(request, reply) {
		try {
			console.log('refreshFromCookie called');
			console.log('All cookies:', request.cookies);
			
			const refreshToken = request.cookies.refreshToken;
			console.log('Refresh token from cookie:', refreshToken ? 'exists' : 'missing');
			
			if (!refreshToken) {
				console.log('No refresh token in cookies');
				return reply.code(401).send({ message: "No refresh token provided!" });
			}
	
			let decoded;
			try {
				decoded = request.server.jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
				console.log('Token decoded successfully for user:', decoded.userId);
			} catch (error) {
				console.log('Token verification failed:', error.message);
				reply.clearCookie('refreshToken', { path: '/' });
				if (error.message.includes('expired'))
					return reply.code(401).send({ message: "No refresh token provided!" });
				return reply.code(401).send({ message: "Invalid refresh token!" });
			}
	
			const userId = decoded.userId;
			const user = await User.findById(userId);
			if (!user) {
				console.log('User not found:', userId);
				reply.clearCookie('refreshToken', { path: '/' });
				return reply.code(404).send({ message: "User not found!" });
			}
			if (user && !user.is_active) {
				console.log('User not active:', userId);
				reply.clearCookie('refreshToken', { path: '/' });
				return reply.code(403).send({ message: "User not active!" });
			}
	
			const newAccessToken = await generateNewAccessToken(user, reply.server);
			console.log('New access token generated for user:', user.nickname);
			
			return reply.code(200).send({ accessToken: newAccessToken });
		} catch (err) {
			console.error('Error in refreshFromCookie:', err);
			return reply.code(500).send({ message: "Error refreshing the token!", error: err.message });
		}
	}

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
			const id = Number(userId);
            if (decoded.userId !== id)
                return reply.code(403).send({ message: "Token does not belong to this user!" });
            return reply.code(200).send({ message: "The token is valid!" });
        } catch (err) {
            return reply.code(500).send({ message: "Error validating the access token!", error: err.message });
        }
    }
}

module.exports = JwtController;