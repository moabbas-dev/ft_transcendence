require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { createTable, closeDatabase } = require('./src/db/initDb');
const {auth} = require('./src/middlewares/auth')
const fs = require('fs')
// Enable CORS on Fastify

const fastify = Fastify({
	logger: true,
	// https: {
	//   key: fs.readFileSync('./ssl/server.key'),
	//   cert: fs.readFileSync('./ssl/server.crt'),
	// }
})  

fastify.register(cors, {
	origin: 'http://localhost:5173', // Set this to your specific frontend domain for production
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

fastify.addHook("preHandler", auth)

createTable();

fastify.register(require('./src/routes/NotificationRoutes'));

// Test route
fastify.get('/', async (request, reply) => {
	return { message: 'Hello from the notifications service!' };
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