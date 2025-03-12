const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailUtils');

class NotificationController {

    static async sendEmailNotification(request, reply) {
        const { userId } = request.params;
        const { email, subject, body } = request.body;
        try {
            await Notification.create({ senderId: null, receiverId: userId, type: "email", content: body });
            try {
                await sendEmail(email, subject, null, body);
            } catch (err) {
                return reply.code(500).send({ message: "Error sending the email!", error: err.message });
            }
            return reply.code(200).send({ message: "Email message sent successfully!" });
        } catch (err) {
            return reply.code(500).send({ message: "Error sending the email!", error: err.message });
        }
    }

    static async markNotificationAsRead(request, reply) {
        const { id } = request.params;
        try {
            const notification = await Notification.getById(id);
            if (!notification)
                return reply.code(404).send({ message: "Notification not found!" });
            await Notification.markAsRead(id);
            return reply.code(200).send({ message: "The notification is now marked as read!" });
        } catch (err) {
            return reply.code(500).send({ message: "Error marking the notification as read!", error: err.message });
        }
    }
}

module.exports = NotificationController;