const { db } = require('../db/initDb');

class Notification {
    static async create({ senderId = null, receiverId, type, content }) {
        const query = `INSERT INTO Notifications (sender_id, receiver_id, type, content)
                        VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(query, [senderId, receiverId, type, content], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    static async getById(id) {
        const query = `SELECT * FROM Notifications WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [id], function (err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async getAll() {
        const query = `SELECT * FROM Notifications`;
        return new Promise((resolve, reject) => {
            db.all(query, function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getUserChatNotifications({ userId1, userId2 }) {
        const query = `SELECT * FROM Notifications
                        WHERE type = 'chat' AND 
                        (
                        (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                        )
                        ORDER BY created_at ASC`;
        return new Promise((resolve, reject) => {
            db.all(query, [userId1, userId2, userId2, userId1], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getReceiverTypeNotifications({ userId, type }) {
        const query = `SELECT * FROM Notifications
                        WHERE receiver_id = ? AND type = ?`;
        return new Promise((resolve, reject) => {
            db.all(query, [userId, type], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async deleteById(id) {
        const query = `DELETE FROM Notifications WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async deleteUserNotifications({ userId }) {
        const query = `DELETE FROM Notifications WHERE receiver_id = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [userId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async markAsRead(id) {
        const query = `UPDATE Notifications SET is_read = 1 WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async getUnreadNotifications(userId) {
        const query = `SELECT * FROM Notifications WHERE receiver_id = ? AND is_read = 0`;
        return new Promise((resolve, reject) => {
            db.all(query, [userId], function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = Notification;