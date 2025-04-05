import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { registerWebSocketAdapter } from "./src/services/WebSocketAdapter.js";
import { setupWebSocketHandlers } from "./src/controllers/websocketController.js";
import { initDatabase, closeDatabase } from "./src/db/initDB.js";
import auth from "./middlewares/auth.js";

const fastify = Fastify({
  logger: true,
});

fastify.addHook("preHandler", auth);

fastify.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST"],
  Credentials: true,
});

fastify.get("/", async (request, reply) => {
  return { status: "Chat microservice running" };
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

const start = async () => {
  try {
    await setupDatabase();
    await fastify.listen({ port: 3002, host: "0.0.0.0" });

    const wsAdapter = registerWebSocketAdapter(fastify);
    setupWebSocketHandlers(wsAdapter, fastify);

    fastify.log.info("Server started successfully");
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