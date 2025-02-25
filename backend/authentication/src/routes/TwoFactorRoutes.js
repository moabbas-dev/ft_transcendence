const TwoFactorController = require('../controllers/TwoFactorController');

module.exports = async (fastify) => {
	fastify.post('/auth/twoFactor/login/:sessionId', TwoFactorController.validateLoginCode);
	fastify.put('/auth/twoFactor/enable/:userId', TwoFactorController.enable2faForUser);
	fastify.post('/auth/twoFactor/enable/validate/:userId', TwoFactorController.validateEnableCode);
	fastify.put('/auth/twoFactor/disable/:userId', TwoFactorController.disable2faForUser);
};