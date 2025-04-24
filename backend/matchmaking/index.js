'use strict';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import database from './src/config/db.js';
import { registerWebSocketAdapter } from './src/services/websocketAdapter.js';
import { setupWebSocketHandlers } from './src/controllers/websocketController.js';

dotenv.config();

const fastify = Fastify({ 
  logger: true,
});

fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.get("/", async (request, reply) => {
  return { status: "Chat microservice running" };
});

const start = async () => {
  try {
    database.initializeTables();

    await fastify.listen({ port: 3001, host: "::" });

    const wsAdapter = registerWebSocketAdapter(fastify);
    setupWebSocketHandlers(wsAdapter, fastify);

    fastify.log.info("MatchMaking Server started successfully");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle server shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received ${signal}, closing HTTP server and database connection`);
  
  await fastify.close();
  await closeDatabase();
  
  process.exit(0);
};

// Listen for shutdown signals
process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

start();