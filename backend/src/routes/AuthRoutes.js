const AuthController = require('../controllers/AuthController');

module.exports = async (fastify) => {
  fastify.post('/signup', AuthController.signup);
  fastify.post('/login', AuthController.login);
};