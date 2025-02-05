// backend/index.js
const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('./data/database.sqlite');

// Test route
fastify.get('/', async (request, reply) => {
  return { message: 'Hello from the backend!' };
});

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