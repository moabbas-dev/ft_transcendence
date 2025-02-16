const { db } = require('../../index');

class Session {

	static async create({ userId, accessToken, refreshToken }) {
		const query = `INSERT INTO Sessions(user_id, access_token, refresh_token)
                        VALUES (?, ?, ?)`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, accessToken, refreshToken], (err) => {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getAll() {
		const query = `SELECT * FROM Sessions`;
		return new Promise((resolve, reject) => {
			db.all(query, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = `SELECT * FROM Sessions WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.get(query, [id], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async getByUserIdAndRefresh(userId, refresh_token) {
		const query = `SELECT * FROM Sessions WHERE user_id = ? AND refresh_token = ?`;
		return new Promise((resolve, reject) => {
			db.get(query, [userId, refresh_token], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async updateAccess(userId, { refreshToken, newAccessToken }) {
		const query = `
			UPDATE Sessions
			SET access_token = ?,
			expires_at = DATETIME('now', '+1 hour'),
			updated_at = CURRENT_TIMESTAMP
			WHERE user_id = ? AND refresh_token = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [newAccessToken, userId, refreshToken], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async deleteById(id) {
		const query = `DELETE FROM Sessions WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async deletebyUserId(userId, refreshToken) {
		const query = `DELETE FROM Sessions WHERE user_id = ? AND refresh_token = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, refreshToken], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = Session;