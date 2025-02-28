const SessionController = require('../controllers/SessionController');

module.exports = async (fastify) => {
	fastify.get('/auth/sessions', SessionController.getAllSessions);
	fastify.get('/auth/sessions/:id', SessionController.getSessionById);
	fastify.delete('/auth/sessions/:id', SessionController.deleteSession);
};