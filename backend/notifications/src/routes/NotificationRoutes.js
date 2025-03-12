const NotificationController = require('../controllers/NotificationController');

module.exports = async (fastify) => {
    fastify.post('/notifications/email/:userId', NotificationController.sendEmailNotification);
    fastify.put('/notifications/read/:id', NotificationController.markNotificationAsRead);
};