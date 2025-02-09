const BlockedUserController = require('../controllers/BlockedUserController');

module.exports = async(fastify) => {
    fastify.post('/blockedUsers', BlockedUserController.createBlockedUser);
    fastify.get('/blockedUsers/userId/:userId', BlockedUserController.getAllUserBlocks);
    fastify.get('/blockedUsers', BlockedUserController.getAllBlocks);
    fastify.get('/blockedUsers/:id', BlockedUserController.getBlockById);
    fastify.delete('/blockedUsers/:id', BlockedUserController.deleteBlock);
};