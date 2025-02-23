const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
	fastify.post('/login', AuthController.login);
	fastify.get('/logout/:sessionId', AuthController.logout);
	fastify.post('/refresh', AuthController.refresh);
	fastify.post('/resetPassword/email', AuthController.verifyResetEmail);
	fastify.post('/resetPassword/reset/:id', AuthController.validateResetPassword);
	fastify.get('/activate/:id', AuthController.activateUser);
	fastify.get('/auth/google/callback', AuthController.googleRemoteAuthenticate);
};
