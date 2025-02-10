const SessionController = require('../controllers/SessionController');

module.exports = async (fastify) => {
    fastify.get('/sessions', SessionController.getAllSessions);
    fastify.get('/sessions/:id', SessionController.getSessionById);
    fastify.delete('/sessions/:id', SessionController.deleteSession);
};