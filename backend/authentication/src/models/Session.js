const { db } = require('../db/initDb');

class Session {

	static async create({ userId, accessToken, refreshToken }) {
		const query = `INSERT INTO Sessions(user_id, access_token, refresh_token)
                        VALUES (?, ?, ?)`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, accessToken, refreshToken], function(err) {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getAll() {
		const query = `SELECT * FROM Sessions`;
		return new Promise((resolve, reject) => {
			db.all(query, function(err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = `SELECT * FROM Sessions WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.get(query, [id], function(err, row) {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async updateAccessAndRefresh(id, { refreshToken, accessToken }) {
		const query = `
			UPDATE Sessions
			SET access_token = ?,
			expires_at = DATETIME('now', '+5 minutes'),
			refresh_token = ?,
			refresh_expires_at = DATETIME('now', '+30 minutes'),
			updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [accessToken, refreshToken, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async updateAccess(id, { newAccessToken }) {
		const query = `
			UPDATE Sessions
			SET access_token = ?,
			expires_at = DATETIME('now', '+5 minutes'),
			updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [newAccessToken, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async deleteById(id) {
		const query = `DELETE FROM Sessions WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async deleteUserSessions(userId) {
		const query = `
			DELETE FROM Sessions WHERE user_id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = Session;