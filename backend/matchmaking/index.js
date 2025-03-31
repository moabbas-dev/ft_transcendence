import Fastify from 'fastify';
import path from 'path';
import autoload from '@fastify/autoload';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { initDatabase, closeDatabase } from "./src/config/db.js";
// import notifier from './websocket/notifier';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors);
// fastify.register(websocket);

//WebSocket setup
//fastify.register(notifier);


fastify.get("/", async (request, reply) => {
    return { status: "Matchmaking microservice running" };
  });

// Initialize the database
const setupDatabase = async () => {
  try {
    await initDatabase();
    fastify.log.info("Database initialized successfully");
  } catch (error) {
    fastify.log.error("Database initialization failed", error);
    process.exit(1);
  }
};

// Start the server
const start = async () => {
    try {
      await setupDatabase();
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
    await closeDatabase();
    
    process.exit(0);
  };
  
  // Listen for shutdown signals
  process.on('SIGINT', () => closeGracefully('SIGINT'));
  process.on('SIGTERM', () => closeGracefully('SIGTERM'));
  
  
  start();