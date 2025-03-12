const UploadController = require('../controllers/UploadController');

module.exports = async (fastify) => {
    fastify.get('/auth/uploads/:id/:dirname', UploadController.getImageUrlsRoute);
    fastify.post('/auth/uploads/:id', UploadController.uploadHandler);
};