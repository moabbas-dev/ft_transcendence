import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Database } = sqlite3;

class DatabaseConnection {
  constructor() {
    const dbPath = path.resolve(__dirname, '../../data/notifications.sqlite');
    this.db = new Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
      } else {
        console.log('Connected to the database.');
      }
    });
  }

  initializeTables() {
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        sender_id INTEGER,
        recipient_id INTEGER NOT NULL,
        content TEXT DEFAULT '',
        additional_data TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP
      )
    `;

    this.db.run(createNotificationsTable, (err) => {
      if (err) {
        console.error('Error creating notifications table', err);
      } else {
        console.log('Notifications table created or already exists');
      }
    });
  }

  getInstance() {
    return this.db;
  }

  async closeDatabase () {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database connection closed.');
          resolve();
        }
      });
    });
  };
}

export default new DatabaseConnection();