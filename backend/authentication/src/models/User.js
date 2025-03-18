const { db } = require('../db/initDb');

class User {

	static async create({ email, password, nickname, full_name, age, country, google_id = null }) {
		const query = `
      INSERT INTO Users (email, password, nickname, full_name, age, country, google_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
		return new Promise((resolve, reject) => {
			db.run(query, [email, password, nickname, full_name, age, country, google_id], function (err) {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getAll() {
		const query = 'SELECT * FROM Users';
		return new Promise((resolve, reject) => {
			db.all(query, function(err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async findByEmail(email) {
		const query = 'SELECT * FROM Users WHERE email = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [email], function(err, row) {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async findById(id) {
		const query = 'SELECT * FROM Users WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [id], function(err, row) {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async findByNickname(nickname) {
		const query = 'SELECT * FROM Users WHERE nickname = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [nickname], function(err, row) {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async update(id, { nickname, full_name, age, country, avatar_url }) {
		const query = `
      		UPDATE Users
      		SET nickname = ?, full_name = ?, age = ?, country = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      		WHERE id = ?
    	`;
		return new Promise((resolve, reject) => {
			db.run(query, [nickname, full_name, age, country, avatar_url, id], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async update2fa(id, { value }) {
		const query = `
			UPDATE Users
			SET is_2fa_enabled = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [value, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async update2faSecret(id, { twoFASecret }) {
		const query = `
			UPDATE USERS
			SET two_factor_secret = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [twoFASecret, id], function(err) {
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
			db.run(query, [status, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async updateUserNickname(id, { nickname }) {
		const query = `
			UPDATE Users
			SET nickname = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [nickname, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async updateUserPassword(id, { password }) {
		const query = `
			UPDATE Users
			SET password = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [password, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async updateUserGoogleID(id, { googleId }) {
		const query = `
			UPDATE Users
			SET google_id = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [googleId, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async activateUser(id) {
		const query = `
			UPDATE Users
			SET is_active = 1, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], function(err) {
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