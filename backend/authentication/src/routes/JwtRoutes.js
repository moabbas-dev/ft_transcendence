const JwtController = require('../controllers/JwtController');

module.exports = async (fastify) => {
    fastify.post('/auth/jwt/refresh/:sessionId', JwtController.refresh);
    fastify.post('/auth/jwt/verify/:userId', JwtController.validateAccessToken);
}