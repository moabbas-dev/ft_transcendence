import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import database from './src/config/database.js';
import NotificationModel from './src/models/notification.model.js';
import NotificationController from './src/controllers/notification.controller.js';
import NotificationRoutes from './src/routes/notification.routes.js';
import auth from './src/middlewares/auth.js';
import fs from 'fs'

dotenv.config();
database.initializeTables()

const fastify = Fastify({
  logger: true,
//   https: {
//     key: fs.readFileSync('./ssl/server.key'),
//     cert: fs.readFileSync('./ssl/server.crt'),
//   }
})


const notificationModel = new NotificationModel(database.getInstance());
const notificationService = new NotificationController(notificationModel);
fastify.decorate('NotificationController', notificationService);

fastify.register(cors, {
	origin: process.env.FRONTEND_DOMAIN,
	methods: ['GET', 'POST', 'PATCH'],
});

fastify.register(NotificationRoutes, {
  prefix: '/api/notifications'
});

// fastify.addHook("preHandler", auth)

fastify.get('/', async (request, reply) => {
    return { message: 'Notifications API WOOOOOOO!' };
});

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

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT, host: '0.0.0.0' }, () => {
      
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();