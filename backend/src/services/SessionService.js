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

    static async deleteSession(id) {
        return await Session.delete(id);
    }
}

module.exports = SessionService;