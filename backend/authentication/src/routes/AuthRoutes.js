const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
	fastify.post('/auth/login', AuthController.login);
	fastify.post('/auth/logout/:sessionId', AuthController.logout);
	fastify.post('/auth/resetPassword/email', AuthController.verifyResetEmail);
	fastify.post('/auth/resetPassword/reset/:uuid', AuthController.validateResetPassword);
	fastify.get('/auth/activate/:token', AuthController.activateUser);
	fastify.get('/auth/google/callback', AuthController.googleRemoteAuthenticate);
	fastify.get('/auth/google/signIn', AuthController.googlesignIn);
};