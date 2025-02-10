const TwoFactorCodeController = require('../controllers/TwoFactorCodeController');

module.exports = async(fastify) => {
    fastify.get('/twoFactorCodes', TwoFactorCodeController.getAllCodes);
    fastify.get('/twoFactorCodes/:id', TwoFactorCodeController.getCodeById);
    fastify.delete('/twoFactorCodes/:id', TwoFactorCodeController.deleteCode);
};