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

	static async updateAccessAndRefresh(id, { refreshToken, accessToken }) {
		return await Session.updateAccessAndRefresh(id, { refreshToken, accessToken });
	}

	static async updateAccessToken(userId, { refreshToken, newAccessToken }) {
		return await Session.updateAccess(userId, { refreshToken, newAccessToken });
	}

	static async deleteSessionById(id) {
		return await Session.deleteById(id);
	}

	static async deleteUserSessions(userId) {
		return await Session.deleteUserSessions(userId);
	}
}

module.exports = SessionService;