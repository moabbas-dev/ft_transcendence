require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('./data/database.sqlite');
module.exports = { db };


const { createTables } = require('./src/db/initDb');
createTables(db);

fastify.register(require('fastify-jwt'), {
	secret: process.env.JWT_SECRET_KEY,
});


fastify.register(require('./src/routes/AuthRoutes'));
fastify.register(require('./src/routes/UserRoutes'));
fastify.register(require('./src/routes/FriendRoutes'));
fastify.register(require('./src/routes/BlockedUserRoutes'));
fastify.register(require('./src/routes/SessionRoutes'));
fastify.register(require('./src/routes/TwoFactorCodeRoutes'));

// Test route
fastify.get('/', async (request, reply) => {
	return { message: 'Hello from the backend!' };
});

// Graceful shutdown
const closeDatabase = () => {
	return new Promise((resolve, reject) => {
		db.close((err) => {
			if (err) {
				fastify.log.error('Error closing database:', err);
				reject(err);
			} else {
				fastify.log.info('Database connection closed.');
				resolve();
			}
		});
	});
};

// Handle shutdown signals
const handleShutdown = async (signal) => {
	fastify.log.info(`Received signal: ${signal}`);
	fastify.log.info('Shutting down server...');

	try {
		await closeDatabase();
		fastify.log.info('Server shutdown complete.');
		process.exit(0);
	} catch (err) {
		fastify.log.error('Error during shutdown:', err);
		process.exit(1);
	}
};

// Attach signal handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Start the server
const start = async () => {
	try {
		await fastify.listen({ port: 8000, host: '0.0.0.0' });
		fastify.log.info(`Server listening on http://localhost:${fastify.server.address().port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();