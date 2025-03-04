const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/emailUtils');
const Session = require('../models/Session');
const saltRounds = 10;
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const fs = require('fs');
const path = require('path');
const { validateEmail, validatePassword } = require('../utils/validationUtils');

const saveAvatarFile = async (fileData) => {
	// Define the directory where avatars will be stored
	const uploadDir = path.join(__dirname, 'uploads', 'avatars');

	// Create the directory if it doesn't exist
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	// Generate a unique filename for the uploaded file
	const fileName = `${Date.now()}-${fileData.filename}`;
	const filePath = path.join(uploadDir, fileName);

	// Write the file to the uploads directory
	await new Promise((resolve, reject) => {
		fileData.file.pipe(fs.createWriteStream(filePath))
			.on('error', reject)
			.on('finish', resolve);
	});

	// Return the URI for the uploaded file
	return `/uploads/avatars/${fileName}`;
};

class UserController {

	static async createUser(request, reply) {
		const { email, password, nickname, full_name, google_id } = request.body;
		const activationEmailHtml = (userId, full_name) => {
			return `
				<div>
					<h1>Welcome ${full_name} to our website!</h1>
					<p>Please click on the link below to activate your account</p>
					<p>${process.env.BACKEND_DOMAIN}/auth/activate/${userId}</p>
					<p>Have a nice day!</p>
				</div>
			`;
		}
		try {
			if (!validateEmail(email))
				return reply.code(400).send({ message: "Invalid email address!" });
			if (!validatePassword(password))
				return reply.code(400).send({ message: "Invalid password!" });
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

	// static async updateUser(request, reply) {
	// 	const { id } = request.params;
	// 	const { nickname, full_name, avatar_url } = request.body;
	// 	const authHeader = request.headers.authorization;
	// 	try {
	// 		if (!authHeader || !authHeader.startsWith('Bearer '))
	// 			return reply.status(401).send({ error: 'Unauthorized: No token provided' });
	// 		const accessToken = authHeader.split(' ')[1];
	// 		let decoded;
	// 		try {
	// 			decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
	// 		} catch (err) {
	// 			if (err.name === 'TokenExpiredError')
	// 				return reply.code(401).send({ message: "Access token expired!" });
	// 			return reply.code(401).send({ message: "Invalid access token" });
	// 		}
	// 		if (decoded.userId != id)
	// 			return reply.code(403).send({ message: "Token does not belong to this user!" });
	// 		const changes = await User.update(id, { nickname, full_name, avatar_url });
	// 		if (changes == 0) reply.code(404).send({ message: 'User not found!' });
	// 		else reply.code(200).send({ message: 'User updated successfully!' });
	// 	} catch (err) {
	// 		if (err.message.includes('Users.nickname'))
	// 			return reply.code(409).send({ key: "nickname", message: "Nickname is already in use!", error: err.message });
	// 		reply.code(500).send({ key: "database", message: 'Error updating the user', error: err.message });
	// 	}
	// }

	static async updateUser(request, reply) {
		const { id } = request.params;
		const authHeader = request.headers.authorization;

		try {
			// Check if the authorization header is valid
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			}

			// Extract the access token
			const accessToken = authHeader.split(' ')[1];

			// Verify the access token
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError') {
					return reply.code(401).send({ message: "Access token expired!" });
				}
				return reply.code(401).send({ message: "Invalid access token" });
			}

			// Check if the token belongs to the user
			if (decoded.userId != id) {
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			}

			// Parse the multipart form data
			const parts = await request.parts();
			let nickname, full_name, avatar_url = null;
			let fileData = null;

			// Iterate through the form data parts
			for await (const part of parts) {
				if (part.type === 'file') {
					// Handle file upload
					fileData = part;
				} else {
					// Handle text fields
					if (part.fieldname === 'nickname') nickname = part.value;
					if (part.fieldname === 'full_name') full_name = part.value;
					if (part.fieldname === 'avatar_url') avatar_url = part.value;
				}
			}

			// If a file was uploaded, save it and generate a URI
			if (fileData) {
				avatar_url = await saveAvatarFile(fileData);
			}

			// Update the user in the database
			const changes = await User.update(id, { nickname, full_name, avatar_url });

			// Handle the response
			if (changes == 0) {
				return reply.code(404).send({ message: 'User not found!' });
			} else {
				return reply.code(200).send({ message: 'User updated successfully!' });
			}
		} catch (err) {
			console.error("Update user error:", err.message);

			// Handle unique constraint errors (e.g., duplicate nickname)
			if (err.message.includes('Users.nickname')) {
				return reply.code(409).send({ key: "nickname", message: "Nickname is already in use!", error: err.message });
			}

			// Handle other errors
			return reply.code(500).send({ key: "database", message: 'Error updating the user', error: err.message });
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