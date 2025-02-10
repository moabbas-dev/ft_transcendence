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

    static async delete(id) {
        const query = `DELETE FROM Sessions WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [id], (err) => {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = Session;