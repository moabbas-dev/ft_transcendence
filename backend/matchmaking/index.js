import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import database from './src/config/db.js';
// import notifier from './websocket/notifier';
database.initializeTables()
const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors);

// Register websocket plugin
fastify.register(websocket);

fastify.get("/", async (request, reply) => {
  return { status: "Matchmaking microservice running" };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
    fastify.log.info(`Server is running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};


// Handle server shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received ${signal}, closing HTTP server and database connection`);

  await fastify.close();
  await database.closeDatabase();

  process.exit(0);
};

// Listen for shutdown signals
process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));


start();