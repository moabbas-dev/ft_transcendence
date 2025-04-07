import { z } from 'zod'

const NotificationSchema = z.object({
	type: z.enum([
		'USER_MESSAGE',
		'TOURNAMENT_ALERT',
		'FRIEND_REQUEST',
		'FRIEND_ACCEPTED',
		'GAME_CHALLENGE',
		'email'
	]),
	senderId: z.number().optional(),
	recipientId: z.number(),
	content: z.string().max(500),
	additionalData: z.string().optional(),
	isRead: z.boolean().optional().default(false)
});

class NotificationModel {
	constructor(db) {
		this.db = db
	}

	async create(notificationData) {
		const validatedData = NotificationSchema.parse(notificationData);

		return new Promise((resolve, reject) => {
			const query = `INSERT INTO notifications
			(type, sender_id, recipient_id, content, additional_data, is_read) 
			VALUES (?, ?, ?, ?, ?, ?)`

			this.db.run(
				query,
				[
					validatedData.type,
					validatedData.senderId || null,
					validatedData.recipientId,
					validatedData.content,
					validatedData.additionalData || null,
					validatedData.isRead ? 1 : 0
				],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve({ id: this.lastID, ...validatedData });
					}
				}
			)
		})
	}

	async getNotificationsForUser(userId, limit = 20) {
		return new Promise((resolve, reject) => {
			const query = `
			SELECT * FROM notifications 
			WHERE recipient_id = ? 
			ORDER BY created_at DESC 
			LIMIT ?
			`;
			this.db.all(query, [userId, limit], (err, rows) => {
				err ? reject(err) : resolve(rows)
			})
		})
	}

	async markAllAsRead(userId) {
		return new Promise((resolve, reject) => {
			const query = `
			UPDATE notifications
			SET is_read = 1
			WHERE is_read = 0 AND recipient_id = ?
		  `;

			this.db.run(query, [userId], function (err,rows) {
				if (err) {
					reject(err);
				} else {
					resolve(rows)
				}
			});
		});
	}

	getAllNotifications() {
		return new Promise((resolve, reject) => {
			const sql = 'SELECT * FROM notifications ORDER BY created_at DESC';
			this.db.all(sql, [], (err, rows) => {
				if (err) {
					return reject(err);
				}
				resolve(rows);
			});
		});
	}
}

export default NotificationModel