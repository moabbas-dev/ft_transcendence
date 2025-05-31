const JwtController = require('../controllers/JwtController');

module.exports = async (fastify) => {
    fastify.post('/auth/jwt/refresh/session', JwtController.refreshFromCookie);
    fastify.post('/auth/jwt/verify/:userId', JwtController.validateAccessToken);
}