const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
	fastify.post('/auth/login', AuthController.login);
	fastify.get('/auth/logout/:sessionId', AuthController.logout);
	fastify.post('/auth/resetPassword/email', AuthController.verifyResetEmail);
	fastify.post('/auth/resetPassword/reset/:id', AuthController.validateResetPassword);
	fastify.get('/auth/activate/:activationToken', AuthController.activateUser);
	fastify.get('/auth/google/callback', AuthController.googleRemoteAuthenticate);
};
