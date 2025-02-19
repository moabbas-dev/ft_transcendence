const TwoFactorCodeController = require('../controllers/TwoFactorCodeController');

module.exports = async (fastify) => {
	fastify.post('/twoFactorCodes/login/:sessionId', TwoFactorCodeController.validateLoginCode);
	fastify.put('/twoFactorCodes/enable/:userId', TwoFactorCodeController.enable2faForUser);
	fastify.post('/twoFactorCodes/enable/validate/:userId', TwoFactorCodeController.validateEnableCode);
	fastify.put('/twoFactorCodes/disable/:userId', TwoFactorCodeController.disable2faForUser);
};