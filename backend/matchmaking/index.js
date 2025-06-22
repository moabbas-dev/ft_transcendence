import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createWebSocketAdapter } from './src/services/websocketAdapter.js';
import { setupWebSocketHandlers } from './src/controllers/websocketController.js';
import matchmakingRoutes from './src/routes/matches.js'; 
import tournamentRoutes from './src/routes/tournament.js';
import historyRoutes from './src/routes/history.js';
import matchmakingService from './src/services/matchmaking.js';
import database from './src/config/db.js';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.decorate('matchmakingService', matchmakingService);

const wsAdapter = createWebSocketAdapter(fastify.server);
fastify.decorate('wsAdapter', wsAdapter);

fastify.register(matchmakingRoutes);
fastify.register(tournamentRoutes);
fastify.register(historyRoutes);

fastify.get('/', async (request, reply) => {
  return { status: 'Matchmaking service running' };
});

await database.initializeTables();

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    
    setupWebSocketHandlers(wsAdapter, fastify);
    
    fastify.log.info('MatchMaking Server started successfully');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

const closeGracefully = async (signal) => {
  fastify.log.info(`Received ${signal}, closing HTTP server and database connection`);
  
  await fastify.close();
  
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

start();