const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const User = require('../models/User');
const UserController = require('./UserController');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

class UploadController {
	static async uploadHandler(request, reply) {
		const { id } = request.params;
		const authHeader = request.headers.authorization;
		try {
			if (!authHeader || !authHeader.startsWith('Bearer'))
				return reply.status(401).send({ error: 'Unauthorized: No token provided' });
			const accessToken = authHeader.split(' ')[1];
			let decoded;
			try {
				decoded = request.server.jwt.verify(accessToken, SECRET_KEY);
			} catch (err) {
				if (err.name === 'TokenExpiredError')
					return reply.code(401).send({ message: "Access token expired!" });
				return reply.code(401).send({ message: "Invalid access token", error: err.message });
			}
			if (decoded.userId != id)
				return reply.code(403).send({ message: "Token does not belong to this user!" });
			const user = await User.findById(id);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			if (!request.isMultipart()) {
				return reply.code(400).send({ message: 'Request must be multipart' });
			}

			const file = await request.file();
			if (!file || file.fieldname !== 'avatar') {
				if (!file)
					return reply.code(400).send({ message: 'No file received!' });
				return reply.code(400).send({ message: 'File field "avatar" is required' });
			}

			if (!file.mimetype.startsWith('image/')) {
				return reply.code(400).send({ message: 'Invalid file type. Only image files are allowed.' });
			}

			const userDir = path.join(UPLOADS_DIR, `user${id}`);
			if (fs.existsSync(userDir)) {
				fs.rmSync(userDir, { recursive: true, force: true });
			}
			fs.mkdirSync(userDir, { recursive: true });

			const filename = `${Date.now()}-${file.filename}`;
			const filePath = path.join(userDir, filename);

			await pipeline(file.file, fs.createWriteStream(filePath));

			const url = `/authentication/uploads/user${id}/${filename}`;
			const changes = await User.updateProfile(id, { avatar_url: url });
			if (changes == 0)
				reply.code(404).send({ message: 'User not found!' });
			return reply.code(200).send({ url, message: "File uploaded!" });
		} catch (err) {
			return reply.code(500).send({ message: "Error uploading the image!", error: err.message });
		}
	}

	static async getImageUrlsRoute(request, reply) {
		const { id, dirname } = request.params;
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
			const user = await User.findById(id);
			if (!user)
				return reply.code(404).send({ message: "User not found!" });
			const directoryPath = path.join(UPLOADS_DIR, dirname);

			if (!fs.existsSync(directoryPath)) {
				return reply.code(404).send({ message: 'Directory not found' });
			}

			const files = await fs.promises.readdir(directoryPath);

			const baseUrl = `/authentication/uploads/${dirname}`;

			const imageUrls = files.map(file => `${baseUrl}/${file}`);

			return reply.code(200).send(imageUrls);
		} catch (err) {
			console.error('Error reading image URLs:', err);
			return reply.code(500).send({ message: "Error getting the urls!", error: err.message });
		}
	}
}

module.exports = UploadController;