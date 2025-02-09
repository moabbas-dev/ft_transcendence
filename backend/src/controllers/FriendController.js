const FriendService = require('../services/FriendService');
const UserService = require('../services/UserService');

class FriendController {

    static async createFriendRequest(request, reply) {
        const  { userId, friendId } = request.body;
        try {
            const newFriendId = await FriendService.createFriendRequest({ userId, friendId });
            reply.code(201).send({ newFriendId });
        } catch (err) {
            reply.code(500).send({ message: 'Error creating Friend!', error: err.message });
        }
    }

    static async getAllUserFriends(request, reply) {
        const { userId } = request.params;
        try {
            const user = await UserService.getUserById(userId);
            if (!user)
                reply.code(404).send({ message: 'User not found!' });
            else {
                const friends = await FriendService.getAllUserFriends(userId);
                reply.code(200).send(friends);
            }
        } catch (err) {
            reply.code(500).send({ message: 'Error getting all the user friends!', error: err.message });
        }
    }

    static async getAllFriends(request, reply) {
        try {
            const friends = await FriendService.getAllFriends();
            reply.code(200).send(friends);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting all the friends data!', error: err.message });
        }
    }

    static async getFriendRequestById(request, reply) {
        const  { id } = request.params;
        try {
            const friend = await FriendService.getFriendRequestById(id);
            if (!friend) reply.code(404).send({ message : 'Friend not found!' });
            else reply.code(200).send(friend);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting the friend by id!', error: err.message });
        }
    }

    static async updateFriendStatus(request, reply) {
        const { id } = request.params;
        const { status } = request.body;
        try {
            const changes = await FriendService.updateFriendStatus(id, { status });
            if (changes == 0) reply.code(404).send({ message: 'Friend not found!' });
            else reply.code(200).send({ message: "Friend updated successfully!" });
        } catch (err) {
            reply.code(500).send({ message: 'Error updating the friend!', error: err.message });
        }
    }

    static async deleteFriend(request, reply) {
        const  { id } = request.params;
        try {
            const changes = await FriendService.deleteFriend(id);
            if (changes == 0) reply.code(404).send({ message: 'Friend not found!' });
            else reply.code(200).send({ message: 'Friend deleted successfully!' });
        } catch (err) {
            reply.code(500).send({ message: 'Error deleting the friend!', error: err.message });
        }
    }
}

module.exports = FriendController;