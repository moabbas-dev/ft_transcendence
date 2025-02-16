const { db } = require('../../index');

class User {

	static async create({ email, password, nickname, full_name, google_id = null }) {
		const query = `
      INSERT INTO Users (email, password, nickname, full_name, google_id)
      VALUES (?, ?, ?, ?, ?)
    `;
		return new Promise((resolve, reject) => {
			db.run(query, [email, password, nickname, full_name, google_id], function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getAll() {
		const query = 'SELECT * FROM Users';
		return new Promise((resolve, reject) => {
			db.all(query, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async findByEmail(email) {
		const query = 'SELECT * FROM Users WHERE email = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [email], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async findById(id) {
		const query = 'SELECT * FROM Users WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [id], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async update(id, { nickname, full_name, avatar_url }) {
		const query = `
      		UPDATE Users
      		SET nickname = ?, full_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      		WHERE id = ?
    	`;
		return new Promise((resolve, reject) => {
			db.run(query, [nickname, full_name, avatar_url, id], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async activateUser(id) {
		const query = `
			UPDATE Users
			SET is_2fa_enabled = 1, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async updateUserStatus(id, { status }) {
		const query = `
			UPDATE Users
			SET status = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [status, id], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async delete(id) {
		const query = 'DELETE FROM Users WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.run(query, [id], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = User;