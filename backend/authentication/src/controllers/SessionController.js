const Session = require('../models/Session');

class SessionController {

	static async getAllSessions(request, reply) {
		try {
			const sessions = await Session.getAll();
			reply.code(200).send(sessions);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting all the sessions', error: err.message });
		}
	}

	static async getSessionById(request, reply) {
		const { id } = request.params;
		try {
			const session = await Session.getById(id);
			if (!session) reply.code(404).send({ message: 'Session not found!' });
			else reply.code(200).send(session);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting the session', error: err.message });
		}
	}

	static async deleteSession(request, reply) {
		const { id } = request.params;
		try {
			const changes = await Session.deleteById(id);
			if (changes == 0) reply.code(404).send({ message: 'Session not found!' });
			else reply.code(200).send({ message: 'Session deleted succesfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the session', error: err.message });
		}
	}
}

module.exports = SessionController;