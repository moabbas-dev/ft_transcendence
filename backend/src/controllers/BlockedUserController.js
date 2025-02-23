const BlockedUserService = require('../services/BlockedUserService');
const UserService = require('../services/UserService');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

class BlockedUserController {

	static async createBlockedUser(request, reply) {
		const { userId, blockedUserId } = request.body;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.message.includes('expired'))
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != userId)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await UserService.getUserById(userId);
			const blockedUser = await UserService.getUserById(blockedUserId);
			if (!user || !blockedUser)
				return reply.code(404).send({ message: "User or blocked user not found!" });
			const newblockId = await BlockedUserService.createBlockedUser({ userId, blockedUserId });
			reply.code(201).send(newblockId);
		} catch (err) {
			reply.code(500).send({ message: 'Error creating the blocked user!', error: err.message });
		}
	}

	static async getAllUserBlocks(request, reply) {
		const { userId } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.message.includes('expired'))
					return reply.code(401).send({ message: "Access token expired!" });
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
				const blocks = await BlockedUserService.getAllUserBlocks(userId);
				reply.code(200).send(blocks);
			}
		} catch (err) {
			reply.code(500).send({ message: 'Error getting all the user blocks!', error: err.message });
		}
	}

	static async getAllBlocks(request, reply) {
		try {
			const blocks = await BlockedUserService.getAllBlocks();
			reply.code(200).send(blocks);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting all the blocks!', error: err.message });
		}
	}

	static async getBlockById(request, reply) {
		const { id } = request.params;
		try {
			const block = await BlockedUserService.getBlockById(id);
			if (!block) reply.code(404).send({ message: 'Block not found!' });
			else reply.code(200).send(block);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting the block!', error: err.message });
		}
	}

	static async deleteBlock(request, reply) {
		const { id } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer '))
				return reply.code(401).send({ message: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.message.includes('expired'))
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			const block = await BlockedUserService.getBlockById(id);
			if (!block)
				return reply.code(404).send({ message: 'Block not found!' });
			if (decoded.userId != block.user_id)
				return reply.code(403).send({ message: 'Token does not belong to this user!' });
			await BlockedUserService.deleteBlock(id);
			return reply.code(200).send({ message: 'Block deleted successfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the block!', error: err.message });
		}
	}
}

module.exports = BlockedUserController;