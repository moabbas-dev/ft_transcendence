const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = './data/notify.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
	if (err)
		console.log(`Error creating the database!`);
	else
		console.log(`The database created successfully at ${path.resolve(dbPath)}`);
});

const createTable = () => {
	const query =
		`CREATE TABLE IF NOT EXISTS Notifications (
    			id INTEGER PRIMARY KEY AUTOINCREMENT,
				sender_id INTEGER,
    			receiver_id INTEGER NOT NULL,
    			type TEXT NOT NULL CHECK( type IN ('chat', 'game_invite', 'email') ),
    			content TEXT NOT NULL,
    			is_read BOOLEAN DEFAULT 0,
    			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	db.run(query, function (err) {
		if (err) console.error('Error creating table:', err);
		else console.log('Table created or already exists');
	});
}

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
}

module.exports = { db, createTable, closeDatabase };