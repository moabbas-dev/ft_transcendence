const { db } = require('../db/initDb');

class Friend {
	// Add a friend
	static async create({ userId, friendId }) {
		const query = `
      INSERT INTO Friends (user_id, friend_id)
      VALUES (?, ?)
    `;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, friendId], function (err) {
				if (err) reject(err);
				else resolve(this.lastID); // Return the new friend relationship ID
			});
		});
	}

	// List all Friends for a user
	static async getUserFriends(userId) {
		const query = `
      SELECT u.id, u.nickname, u.avatar_url, u.full_name, u.status
      FROM Friends f
      JOIN Users u ON f.friend_id = u.id
      WHERE f.user_id = ?
    `;
		return new Promise((resolve, reject) => {
			db.all(query, [userId], function(err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getAll() {
		const query = 'SELECT * FROM Friends';
		return new Promise((resolve, reject) => {
			db.all(query, function(err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = 'SELECT * FROM Friends WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [id], function(err, row) {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async update(id, { status }) {
		const query = `UPDATE Friends
                    SET status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [status, id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async delete(id) {
		const query = 'DELETE FROM Friends WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.run(query, [id], function(err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = Friend;