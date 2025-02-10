const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
	fastify.post('/login', AuthController.login);
};