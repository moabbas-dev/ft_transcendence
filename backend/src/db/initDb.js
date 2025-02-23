const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/database.sqlite');

const createTables = () => {
	const queries = [
		`CREATE TABLE IF NOT EXISTS Users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					email TEXT NOT NULL UNIQUE,
					password TEXT,
					nickname TEXT UNIQUE,
					full_name TEXT NOT NULL,
					status TEXT NOT NULL DEFAULT 'offline',
					avatar_url TEXT DEFAULT 'default_avatar.png',
					google_id TEXT UNIQUE,
					is_2fa_enabled BOOLEAN DEFAULT 0,
					is_active BOOLEAN DEFAULT 0,
					two_factor_secret TEXT,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);`,
		`CREATE TABLE IF NOT EXISTS Friends (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					friend_id INTEGER NOT NULL,
					status TEXT DEFAULT 'pending',
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users(id),
					FOREIGN KEY (friend_id) REFERENCES Users(id),
					UNIQUE(user_id, friend_id)
				);`,
		`CREATE TABLE IF NOT EXISTS Blocked_Users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					blocked_user_id INTEGER NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users(id),
					FOREIGN KEY (blocked_user_id) REFERENCES Users(id),
					UNIQUE(user_id, blocked_user_id)
				);`,
		`CREATE TABLE IF NOT EXISTS Sessions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					access_token TEXT,
					refresh_token TEXT,
					expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME('now', '+1 hour')),
					refresh_expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME('now', '+30 days')),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users(id)
				);`,
	];
	queries.forEach((query) => {
		db.run(query, (err) => {
			if (err) console.error('Error creating table:', err);
			else console.log('Table created or already exists');
		});
	});
};

// Graceful shutdown handling
const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.close(err => {
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

module.exports = { db, createTables, closeDatabase };