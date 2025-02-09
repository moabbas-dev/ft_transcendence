const Friend = require('../models/Friend');

class FriendService {

    static async createFriendRequest({ userId, friendId }) {
        return await Friend.create({ userId, friendId });
    }

    static async getAllUserFriends(userId) {
        return await Friend.getUserFriends(userId);
    }

    static async getAllFriends() {
        return await Friend.getAll();
    }

    static async getFriendRequestById(id) {
        return await Friend.getById(id);
    }

    static async updateFriendStatus(id, { status }) {
        return await Friend.update(id, { status });
    }

    static async deleteFriend(id) {
        return await Friend.delete(id);
    }
}

module.exports = FriendService;