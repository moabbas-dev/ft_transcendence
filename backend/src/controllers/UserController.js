const UserService = require('../services/UserService');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserController {

	static async createUser(request, reply) {
		const { email, password, nickname, full_name, google_id } = request.body;
		try {
			const passwordHash = await bcrypt.hash(password, saltRounds);
			const userId = await UserService.createUser({ email, password: passwordHash, nickname, full_name, google_id });
			reply.code(201).send({ userId });
		} catch (err) {
			reply.code(500).send({ message: 'Error creating user', error: err.message });
		}
	}

	static async getAllUsers(request, reply) {
		try {
			const users = await UserService.getAllUsers();
			reply.code(200).send(users);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting users', error: err.message });
		}
	}

	static async getUserByEmail(request, reply) {
		const { email } = request.params;
		try {
			const user = await UserService.getUserByEmail(email);
			if (!user) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send(user);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting user by email', error: err.message });
		}
	}

	static async getUserById(request, reply) {
		const { id } = request.params;
		try {
			const user = await UserService.getUserById(id);
			if (!user) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send(user);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting user by id', error: err.message });
		}
	}

	static async updateUser(request, reply) {
		const { id } = request.params;
		const { nickname, full_name, avatar_url } = request.body;
		try {
			const changes = await UserService.updateUser(id, { nickname, full_name, avatar_url });
			if (changes == 0) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send({ message: 'User updated successfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error updating the user', error: err.message });
		}
	}

	static async deleteUser(request, reply) {
		const { id } = request.params;
		try {
			const changes = await UserService.deleteUser(id);
			if (changes == 0) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send({ message: 'User deleted successfully!' });
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the user', error: err.message });
		}
	}
}

module.exports = UserController;