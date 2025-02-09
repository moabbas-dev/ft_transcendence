const { db } = require('../../index');
const { hashPassword, verifyPassword } = require('../utils/auth');

class User {

  static async create({ email, password, nickname, googleId = null }) {
    const passwordHash = await hashPassword(password);
    const query = `
      INSERT INTO Users (email, password_hash, nickname, google_id)
      VALUES (?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(query, [email, passwordHash, nickname, googleId], function (err) {
        if (err) reject(err);
        else resolve(this.lastID); // Return the new user ID
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

  static async update(id, { nickname, avatarUrl }) {
    const query = `
      UPDATE Users
      SET nickname = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.run(query, [nickname, avatarUrl, id], function (err) {
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