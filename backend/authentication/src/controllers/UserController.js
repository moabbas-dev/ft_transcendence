const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/emailUtils');
const Session = require('../models/Session');
const saltRounds = 10;
const SECRET_KEY = process.env.JWT_SECRET_KEY;

class UserController {

	static async createUser(request, reply) {
		const { email, password, nickname, full_name, google_id } = request.body;
		const activationEmailHtml = (userId, full_name) => {
			return `
				<div>
					<h1>Welcome ${full_name} to our website!</h1>
					<p>Please click on the link below to activate your account</p>
					<p>${process.env.BACKEND_DOMAIN}/activate/${userId}</p>
					<p>Have a nice day!</p>
				</div>
			`;
		}
		try {
			const passwordHash = await bcrypt.hash(password, saltRounds);
			const userId = await User.create({ email, password: passwordHash, nickname, full_name, google_id });
			try {
				await sendEmail(email, "New account is here!", null, activationEmailHtml(userId, full_name));
			} catch (error) {
				return reply.code(500).send({ error: error.message });
			}
			return reply.code(201).send({ userId });
		} catch (err) {
			if (err.message.includes('Users.nickname'))
				return reply.code(409).send({ key: "nickname", message: "Nickname is already in use!", error: err.message });
			if (err.message.includes('Users.email'))
				return reply.code(409).send({ key: "email", message: "Email is already in use!", error: err.message });
			return reply.code(500).send({ key: "database", message: 'Error creating user', error: err.message });
		}
	}

	static async getAllUsers(request, reply) {
		try {
			const users = await User.getAll();
			reply.code(200).send(users);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting users', error: err.message });
		}
	}

	static async getUserByEmail(request, reply) {
		const { email } = request.params;
		try {
			const user = await User.findByEmail(email);
			if (!user) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send(user);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting user by email', error: err.message });
		}
	}

	static async getUserById(request, reply) {
		const { id } = request.params;
		try {
			const user = await User.findById(id);
			if (!user) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send(user);
		} catch (err) {
			reply.code(500).send({ message: 'Error getting user by id', error: err.message });
		}
	}

	static async getUserByNickname(request, reply) {
		const { nickname } = request.params;
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
			const user = await User.findByNickname(nickname);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			return reply.code(200).send(user);
		} catch (err) {
			return reply.code(500).send({ message: "Error getting user by nickname!", error: err.message });
		}
	}

	static async updateUser(request, reply) {
		const { id } = request.params;
		const { nickname, full_name, avatar_url } = request.body;
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
			if (decoded.userId != id)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const changes = await User.update(id, { nickname, full_name, avatar_url });
			if (changes == 0) reply.code(404).send({ message: 'User not found!' });
			else reply.code(200).send({ message: 'User updated successfully!' });
		} catch (err) {
			if (err.message.includes('Users.nickname'))
				return reply.code(409).send({ key: "nickname", message: "Nickname is already in use!", error: err.message });
			reply.code(500).send({ key: "database", message: 'Error updating the user', error: err.message });
		}
	}

	static async deleteUser(request, reply) {
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
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token" });
			}
			if (decoded.userId != id)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const changes = await User.delete(id);
			if (changes == 0) reply.code(404).send({ message: 'User not found!' });
			else {
				await Session.deleteUserSessions(id);
				reply.code(200).send({ message: 'User deleted successfully!' });
			}
		} catch (err) {
			reply.code(500).send({ message: 'Error deleting the user', error: err.message });
		}
	}
}

module.exports = UserController;