const UploadController = require('../controllers/UploadController');
const Session = require('../models/Session');
const User = require('../models/User');

module.exports = async (fastify) => {
    fastify.get('/auth/uploads/:id/:dirname', UploadController.getImageUrlsRoute);
    fastify.post('/auth/uploads/:id', UploadController.uploadHandler);
    // fastify.get('/png;base64,*', async (req, reply) => {
    //     try {
    //         const base64String = req.params['*']; // Capture everything after "/png;base64,"
    //         const buffer = Buffer.from(base64String, 'base64');

    //         reply
    //             .header('Content-Type', 'image/png')
    //             .send(buffer);
    //     } catch (error) {
    //         reply.status(400).send({ message: 'Invalid Base64 string' });
    //     }
    // });
    fastify.get('/png/base64/*', async (req, reply) => {
        try {
            const base64String = req.params['*']; // everything after /png/base64/
            const buffer = Buffer.from(base64String, 'base64');
            reply
                .code(200)
                .header('Content-Type', 'image/png')
                .send(buffer);
        } catch {
            reply.code(400).send({ message: 'Invalid Base64 string' });
        }
    });
    fastify.post('/auth/google_upload/:sessionUUID', async (req, reply) => {
        try {
            const { sessionUUID } = req.params;
            // const authHeader = request.headers.authorization;
            // if (!authHeader || !authHeader.startsWith('Bearer '))
            // 	return reply.status(401).send({ error: 'Unauthorized: No token provided' });
            const session = await Session.getByUUID(sessionUUID);
            if (!session)
                return reply.code(404).send({ message: "Session not found!" });
            const user = await User.findById(session.user_id);
            if (!user)
                return reply.code(404).send({ message: "User not found!" });
            const photo = req.query.photo;
            const id = user.id;
            const changes = await User.updateProfile(id, { avatar_url: photo.split('=')[0] });
            if (changes == 0)
                reply.code(404).send({ message: 'User not found!' });
            else
                reply.code(200).send({ message: 'User Profile updated successfully!' });
        } catch (error) {
            reply.status(500).send({ message: 'Internal Server Error' });
        }
    });
};