const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = './data/auth.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
	if (err)
		console.error("Error creating the database:", err.message);
	else
		console.log(`The database created successfully at ${path.resolve(dbPath)}`);
});

const createTables = () => {
	const queries = [
		`CREATE TABLE IF NOT EXISTS Users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					email TEXT NOT NULL UNIQUE,
					password TEXT,
					nickname TEXT UNIQUE,
					full_name TEXT NOT NULL,
					age INT,
					country TEXT,
					language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ar')),
					status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'in_game')),
					elo INTEGER NOT NULL DEFAULT 1000,
					wins INTEGER DEFAULT 0,
  					losses INTEGER DEFAULT 0,
					avatar_url TEXT DEFAULT '/authentication/uploads/binary.png',
					google_id TEXT UNIQUE,
					is_2fa_enabled BOOLEAN DEFAULT 0,
					is_active BOOLEAN DEFAULT 0,
					two_factor_secret TEXT,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);`,
		`CREATE TABLE IF NOT EXISTS Sessions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					uuid TEXT NOT NULL UNIQUE,
					user_id INTEGER NOT NULL,
					access_token TEXT,
					refresh_token TEXT,
					expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME('now', '+5 minutes')),
					refresh_expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME('now', '+30 minutes')),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users(id)
				);`,
		`CREATE TABLE IF NOT EXISTS User_Tokens (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER NOT NULL,
					activation_token TEXT NOT NULL UNIQUE,
					token_type TEXT NOT NULL CHECK (token_type IN ('account_activation', 'reset_password')),
					expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME('now', '+24 hours')),
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES Users(id)
				);`
	];
	queries.forEach((query) => {
		db.run(query, function (err) {
			if (err) console.error('Error creating table:', err);
			else console.log('Table created or already exists');
		});
	});
};

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