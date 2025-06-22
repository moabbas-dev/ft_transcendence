require('dotenv').config();
const fastify = require('fastify')({ logger: true, maxParamLength: 6000 });
const cors = require('@fastify/cors');
const { createTables, closeDatabase } = require('./src/db/initDb');
const fastifyOauth2 = require('@fastify/oauth2');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const path = require('path');
const fs = require('fs');
const fastifyMultipart = require('@fastify/multipart');

fastify.register(fastifyMultipart, {
	limits: {
	  fileSize: 10 * 1024 * 1024 // 10 MB limit
	}
});
  

fastify.register(require('@fastify/static'), {
	root: path.join(__dirname, 'uploads'),
	prefix: '/uploads/',
});

fastify.register(cors, {
	origin: process.env.FRONTEND_DOMAIN,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
});

createTables();

fastify.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {}
});

fastify.register(fastifySession, {
	secret: process.env.FASTIFY_SESSION_SECRET_KEY,
	cookie: { secure: false },
	saveUninitialized: false,
});

fastify.register(fastifyOauth2, {
	name: 'googleOAuth2', 
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: process.env.CLIENT_ID,
			secret: process.env.CLIENT_SECRET,
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: '/auth/google',
	callbackUri: `${process.env.BACKEND_DOMAIN}/auth/google/callback`,
});

fastify.register(require('fastify-jwt'), {
	secret: process.env.JWT_SECRET_KEY,
});

fastify.register(require('./src/routes/AuthRoutes'));
fastify.register(require('./src/routes/JwtRoutes'));
fastify.register(require('./src/routes/UserRoutes'));
fastify.register(require('./src/routes/SessionRoutes'));
fastify.register(require('./src/routes/TwoFactorRoutes'));
fastify.register(require('./src/routes/UploadRoutes'));

fastify.get('/', async (request, reply) => {
	return { message: 'Hello from the authentication service!' };
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
		await fastify.listen({ port: 8001, host: '::' });
		fastify.log.info(`Server listening on http://localhost:${fastify.server.address().port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();