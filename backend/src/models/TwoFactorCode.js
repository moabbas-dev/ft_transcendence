const { db } = require('../../index');

class TwoFactorCode {

	static async create({ userId, code }) {
		const query = `INSERT INTO Two_Factor_Codes (user_id, code)
                        VALUES (?, ?)`;
		return new Promise((resolve, reject) => {
			db.run(query, [userId, code], (err) => {
				if (err) reject(err);
				else resolve(this.lastID);
			});
		});
	}

	static async getAll() {
		const query = `SELECT * FROM Two_Factor_Codes`;
		return new Promise((resolve, reject) => {
			db.all(query, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		const query = `SELECT * FROM Two_Factor_Codes WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.get(query, [id], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	}

	static async delete(id) {
		const query = `DELETE FROM Two_Factor_Codes WHERE id = ?`;
		return new Promise((resolve, reject) => {
			db.run(query, [id], (err) => {
				if (err) reject(err);
				else resolve(this.changes);
			});
		});
	}
}

module.exports = TwoFactorCode;