const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
	fastify.post('/login', AuthController.login);
	fastify.post('/logout', AuthController.logout);
	fastify.post('/refresh', AuthController.refresh);
};
