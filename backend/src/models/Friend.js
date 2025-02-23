const { db } = require('../db/initDb');

class Friend {
	// Add a friend
	static async create({ userId, friendId }) {
		return new Promise((resolve, reject) => {
			// First, check if the friendship already exists in either direction
			const checkQuery = `
				SELECT 1 FROM Friends 
				WHERE (user_id = ? AND friend_id = ?) 
				   OR (user_id = ? AND friend_id = ?)
			`;

			db.get(checkQuery, [userId, friendId, friendId, userId], (err, existing) => {
				if (err) return reject(err);
				if (existing) {
					return reject(new Error("Friend request already exists!"));
				}

				// If no existing friendship, insert a new request
				const insertQuery = `
					INSERT INTO Friends (user_id, friend_id, status) 
					VALUES (?, ?, 'pending')
				`;

				db.run(insertQuery, [userId, friendId], function (err) {
					if (err) reject(err);
					else resolve(this.lastID); // Return the new friendship ID
				});
			});
		});
	}

	// List all Friends for a user
	static async getUserFriends(userId) {
		const query = `
		  SELECT u.id, u.nickname, u.avatar_url, u.full_name, u.status
		  FROM Friends f
		  JOIN Users u ON u.id = 
			CASE 
			  WHEN f.user_id = ? THEN f.friend_id 
			  WHEN f.friend_id = ? THEN f.user_id 
			END
		  WHERE (f.user_id = ? OR f.friend_id = ?) 
			AND f.status = 'accepted'
		`;

		return new Promise((resolve, reject) => {
			db.all(query, [userId, userId, userId, userId], function (err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getAll() {
		const query = 'SELECT * FROM Friends';
		return new Promise((resolve, reject) => {
			db.all(query, function (err, rows) {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = 'SELECT * FROM Friends WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.get(query, [id], function (err, row) {
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
			db.run(query, [status, id], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async delete(id) {
		const query = 'DELETE FROM Friends WHERE id = ?';
		return new Promise((resolve, reject) => {
			db.run(query, [id], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}

	static async deleteUserFriends(userId) {
		const query = `
			DELETE FROM Friends
			WHERE user_id = ? OR friend_id = ?
		`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, userId], function (err) {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = Friend;