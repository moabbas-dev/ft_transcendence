const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const User = require('../models/User');
const SECRET_KEY = process.env.JWT_SECRET_KEY;


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
			// Ensure the request is multipart
			if (!request.isMultipart()) {
				return reply.code(400).send({ message: 'Request must be multipart' });
			}

			// Retrieve the file (assumes the field name is "avatar")
			const file = await request.file();
			if (!file || file.fieldname !== 'avatar') {
				if (!file)
					return reply.code(400).send({ message: 'No file received!' });
				return reply.code(400).send({ message: 'File field "avatar" is required' });
			}

			// Validate file type: only allow image files
			if (!file.mimetype.startsWith('image/')) {
				return reply.code(400).send({ message: 'Invalid file type. Only image files are allowed.' });
			}

			// Ensure the uploads/user{id} folder exists
			const userDir = path.join(__dirname, `../../uploads/user${id}`);
			// Remove old content if the directory exists
			if (fs.existsSync(userDir)) {
				fs.rmSync(userDir, { recursive: true, force: true });
			}
			// Recreate the directory
			fs.mkdirSync(userDir, { recursive: true });

			// Create a unique filename
			const filename = `${Date.now()}-${file.filename}`;
			const filePath = path.join(userDir, filename);

			// Pipe the file stream to disk
			await pipeline(file.file, fs.createWriteStream(filePath));

			// Return the URL that points to the static route for uploads
			const url = `${process.env.BACKEND_DOMAIN}/uploads/user${id}/${filename}`;
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
			// Construct the full path of the directory inside the uploads folder
			const directoryPath = path.join(__dirname, '../../uploads', dirname);

			// Check if the directory exists using fs.existsSync
			if (!fs.existsSync(directoryPath)) {
				return reply.code(404).send({ message: 'Directory not found' });
			}

			// Read all files in the directory using the promise API
			const files = await fs.promises.readdir(directoryPath);

			// Construct the base URL for static files
			const baseUrl = `${process.env.BACKEND_DOMAIN}/uploads/${dirname}`;

			// Map each file to its URL (assuming all files are images)
			const imageUrls = files.map(file => `${baseUrl}/${file}`);

			// Send the array of image URLs as the response
			return reply.code(200).send(imageUrls);
		} catch (err) {
			console.error('Error reading image URLs:', err);
			return reply.code(500).send({ message: "Error getting the urls!", error: err.message });
		}
	}
}

module.exports = UploadController;