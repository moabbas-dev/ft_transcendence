const FriendController = require('../controllers/FriendController');

module.exports = async(fastify) => {
    fastify.post('/friends', FriendController.createFriendRequest);
    fastify.get('/friends/userId/:userId',FriendController.getAllUserFriends);
    fastify.get('/friends/:id', FriendController.getFriendRequestById);
    fastify.get('/friends', FriendController.getAllFriends);
    fastify.put('/friends/:id', FriendController.updateFriendStatus);
    fastify.delete('/friends/:id', FriendController.deleteFriend);
};