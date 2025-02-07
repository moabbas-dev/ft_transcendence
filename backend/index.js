const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('./data/database.sqlite');

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