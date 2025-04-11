const UploadController = require('../controllers/UploadController');

module.exports = async (fastify) => {
    fastify.get('/auth/uploads/:id/:dirname', UploadController.getImageUrlsRoute);
    fastify.post('/auth/uploads/:id', UploadController.uploadHandler);
    fastify.get('/png;base64,*', async (req, reply) => {
        try {
            const base64String = req.params['*']; // Capture everything after "/png;base64,"
            const buffer = Buffer.from(base64String, 'base64');

            reply
                .header('Content-Type', 'image/png')
                .send(buffer);
        } catch (error) {
            reply.status(400).send({ message: 'Invalid Base64 string' });
        }
    });
    fastify.post('/auth/google_upload', async (req, reply) => {
        try {
            
        } catch (error) {
            reply.status(500).send({ message: 'Internal Server Error' });
        }
    });
};