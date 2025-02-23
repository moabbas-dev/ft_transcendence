const FriendService = require('../services/FriendService');
const UserService = require('../services/UserService');
const SECRET_KEY = process.env.JWT_SECRET_KEY

class FriendController {

	static async createFriendRequest(request, reply) {
		const { userId, friendId } = request.body;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			const friend = await UserService.getUserById(friendId);
			if (!user || !friend)
				return reply.code(404).send({ message: "User or friend user not exists!" });
			const newFriendId = await FriendService.createFriendRequest({ userId, friendId });
			reply.code(201).send({ newFriendId });
		} catch (err) {
			reply.code(500).send({ message: 'Error creating Friend!', error: err.message });
		}
	}

	static async getAllUserFriends(request, reply) {
		const { userId } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			}
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			}
			catch (err) {
				if (err.message.includes('expired')) {
					return reply.code(401).send({ message: "Access token expired!" });
				}
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			if (!user)
				reply.code(404).send({ message: 'User not found!' });
			if (user && !user.is_active)
				return reply.code(403).send({ message: "User not active!" });
			else {
				const friends = await FriendService.getAllUserFriends(userId);
				reply.code(200).send(friends);
			}
		} catch (err) {
			reply.code(500).send({ message: "Error getting all the user friends!", error: err.message });
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
		const { id } = request.params;
		try {
			const friend = await FriendService.getFriendRequestById(id);
			if (!friend) reply.code(404).send({ message: 'Friend not found!' });
			else reply.code(200).send(friend);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting the friend by id!', error: err.message });
		}
	}

	static async updateFriendStatus(request, reply) {
		const { id } = request.params;
		const { status } = request.body;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.message.includes('expired'))
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			const friend = await FriendService.getFriendRequestById(id);
			if (!friend)
				return reply.code(404).send({ message: "Friend request not found!" });
			if (decoded.userId != friend.friend_id)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			await FriendService.updateFriendStatus(id, { status });
			return reply.code(200).send({ message: "Friend updated successfully!" });
		} catch (err) {
			return reply.code(500).send({ message: 'Error updating the friend!', error: err.message });
		}
	}

	static async deleteFriend(request, reply) {
		const { id } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.message.includes('expired'))
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			const friend = await FriendService.getFriendRequestById(id);
			if (!friend)
				return reply.code(404).send({ message: "Friend not found!" });
			if (decoded.userId !== friend.user_id || decoded.userId !== friend.friend_id)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			await FriendService.deleteFriend(id);
			return reply.code(200).send({ message: 'Friend deleted successfully!' });
		} catch (err) {
			return reply.code(500).send({ message: 'Error deleting the friend!', error: err.message });
		}
	}
}

module.exports = FriendController;