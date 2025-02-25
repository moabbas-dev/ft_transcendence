const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./data/social.sqlite');

const createTables = () => {
	const queries = [
		`CREATE TABLE IF NOT EXISTS Friends (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						user_id INTEGER NOT NULL,
						friend_id INTEGER NOT NULL,
						status TEXT DEFAULT 'pending',
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						UNIQUE(user_id, friend_id)
					);`,
		`CREATE TABLE IF NOT EXISTS Blocked_Users (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						user_id INTEGER NOT NULL,
						blocked_user_id INTEGER NOT NULL,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
						UNIQUE(user_id, blocked_user_id)
					);`
	];

	queries.forEach((query) => {
		db.run(query, function(err) {
			if (err) console.error(`Error creating table: ${err}`);
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