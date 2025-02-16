const TwoFactorCodeController = require('../controllers/TwoFactorCodeController');

module.exports = async (fastify) => {
	fastify.get('/twoFactorCodes', TwoFactorCodeController.getAllCodes);
	fastify.get('/twoFactorCodes/:id', TwoFactorCodeController.getCodeById);
	fastify.delete('/twoFactorCodes/:id', TwoFactorCodeController.deleteCode);
	fastify.post('/twoFactorCodes/login/:sessionId/:codeId', TwoFactorCodeController.validateLoginCode);
	fastify.post('/twoFactorCodes/login/regenerate/:sessionId', TwoFactorCodeController.regenerateLoginCode);
	fastify.put('/twoFactorCodes/enable/:userId', TwoFactorCodeController.enable2faForUser);
	fastify.post('/twoFactorCodes/enable/validate/:userId/:codeId', TwoFactorCodeController.validateEnableCode);
	fastify.post('/twoFactorCodes/enable/regenerate/:userId', TwoFactorCodeController.regenerateEnableCode);
	fastify.put('/twoFactorCodes/disable/:userId', TwoFactorCodeController.disable2faForUser);
};