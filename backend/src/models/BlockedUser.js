const { db } = require("../../index");

class BlockedUser {

	static async create({ userId, blockedUserId }) {
		const query = `INSERT INTO Blocked_Users (user_id, blocked_user_id)
                        VALUES (?, ?)`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, blockedUserId], (err) => {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getUserBlocks(userId) {
		const query = `
            SELECT u.id, u.nickname, u.avatar_url
            FROM Blocked_Users b
            JOIN Users u ON b.blocked_user_id = u.id
            WHERE b.user_id = ?`;
		return new Promise((resolve, reject) => {
			db.all(query, [userId], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getAll() {
		const query = `SELECT * FROM Blocked_Users`;
		return new Promise((resolve, reject) => {
			db.all(query, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = `SELECT * FROM Blocked_Users WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.get(query, [id], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async delete(id) {
		const query = `DELETE FROM Blocked_Users WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = BlockedUser;