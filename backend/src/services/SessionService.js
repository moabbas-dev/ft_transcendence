const Session = require('../models/Session');

class SessionService {

	static async createSession({ userId, accessToken, refreshToken }) {
		return await Session.create({ userId, accessToken, refreshToken });
	}

	static async getAllSessions() {
		return await Session.getAll();
	}

	static async getSessionById(id) {
		return await Session.getById(id);
	}

	static async getSessionByUserIdAndRefreshToken(userId, refreshToken) {
		return await Session.getByUserIdAndRefresh(userId, refreshToken);
	}

	static async updateAccessToken(userId, { refreshToken, newAccessToken }) {
		return await Session.updateAccess(userId, { refreshToken, newAccessToken });
	}

	static async deleteSessionByUserId(userId, refresh_token) {
		return await Session.deletebyUserId(userId, refresh_token);
	}

	static async deleteSessionById(id) {
		return await Session.deleteById(id);
	}
}

module.exports = SessionService;