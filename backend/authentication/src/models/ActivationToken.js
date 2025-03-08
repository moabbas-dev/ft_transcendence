const { db } = require('../db/initDb');

class ActivationToken {
    static async create({ userId, activationToken }) {
        const query = `INSERT INTO Activation_Tokens (user_id, activation_token)
                        VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(query, [userId, activationToken], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    static async getById(id) {
        const query = `SELECT * FROM Activation_Tokens WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [id], function(err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async getByToken(token) {
        const query = `SELECT * FROM Activation_Tokens WHERE activation_token = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [token], function(err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async getAll() {
        const query = `SELECT * FROM Activation_Tokens`;
        return new Promise((resolve, reject) => {
            db.all(query, function(err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async deleteById(id) {
        const query = `DELETE FROM Activation_Tokens WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    static async deleteByToken(token) {
        const query = `DELETE FROM Activation_Tokens WHERE activation_token = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [token], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
}

module.exports = ActivationToken;