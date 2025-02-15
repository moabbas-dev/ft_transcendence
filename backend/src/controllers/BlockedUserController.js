const BlockedUserService = require('../services/BlockedUserService');
const UserService = require('../services/UserService');

class BlockedUserController {

	static async createBlockedUser(request, reply) {
		const { userId, blockedUserId } = request.body;
		try {
			const newblockId = await BlockedUserService.createBlockedUser({ userId, blockedUserId });
			reply.code(201).send(newblockId);
		} catch (err) {
			reply.code(500).send({ message: 'Error creating the blocked user!', error: err.message });
		}
	}

	static async getAllUserBlocks(request, reply) {
		const { userId } = request.params;
		try {
			const user = await UserService.getUserById(userId);
			if (!user)
				reply.code(404).send({ message: 'User not found!' });
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
		try {
			const changes = await BlockedUserService.deleteBlock(id);
			if (changes == 0) reply.code(404).send({ message: 'Block not found!' });
			else reply.code(200).send({ message: 'Block deleted successfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the block!', error: err.message });
		}
	}
}

module.exports = BlockedUserController;