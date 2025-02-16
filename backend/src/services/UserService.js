const User = require('../models/User');

class UserService {

	static async createUser({ email, password, nickname, full_name, google_id }) {
		return await User.create({ email, password, nickname, full_name, google_id });
	}

	static async getAllUsers() {
		return await User.getAll();
	}

	static async getUserByEmail(email) {
		return await User.findByEmail(email);
	}

	static async getUserById(id) {
		return await User.findById(id);
	}

	static async getUserByNickname(nickname) {
		return await User.findByNickname(nickname);
	}

	static async updateUser(id, { nickname, full_name, avatar_url }) {
		return await User.update(id, { nickname, full_name, avatar_url });
	}

	static async update2fa(id, { value }) {
		return await User.update2fa(id, { value });
	}

	static async updateUserStatus(id, { status }) {
		return await User.updateUserStatus(id, { status });
	}

	static async deleteUser(id) {
		return await User.delete(id);
	}
}

module.exports = UserService;