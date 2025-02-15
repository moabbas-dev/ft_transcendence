const BlockedUser = require('../models/BlockedUser');

class BlockedUserService {

	static async createBlockedUser({ userId, blockedUserId }) {
		return await BlockedUser.create({ userId, blockedUserId });
	}

	static async getAllUserBlocks(userId) {
		return await BlockedUser.getUserBlocks(userId);
	}

	static async getAllBlocks() {
		return await BlockedUser.getAll();
	}

	static async getBlockById(id) {
		return await BlockedUser.getById(id);
	}

	static async deleteBlock(id) {
		return await BlockedUser.delete(id);
	}
}

module.exports = BlockedUserService;