require('dotenv').config();
const fastify = require('fastify')({ logger: true, maxParamLength: 6000 });
const cors = require('@fastify/cors');
const { createTables, closeDatabase } = require('./src/db/initDb');
const fastifyOauth2 = require('@fastify/oauth2');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const path = require('path');
const fs = require('fs');
const { auth } = require('./src/middlewares/auth')
const fastifyMultipart = require('@fastify/multipart');

// const fastify = Fastify({
// 	logger: true,
// 	https: {
// 	  key: fs.readFileSync('./ssl/server.key'),
// 	  cert: fs.readFileSync('./ssl/server.crt'),
// 	}
// })  

fastify.register(fastifyMultipart, {
	limits: {
	  fileSize: 10 * 1024 * 1024 // 10 MB limit (change as needed)
	}
});
  

// fastify.addHook("preHandler", auth)
fastify.register(require('@fastify/static'), {
	root: path.join(__dirname, 'uploads'),
	prefix: '/uploads/',
});

// Enable CORS on Fastify
fastify.register(cors, {
	origin: process.env.FRONTEND_DOMAIN, // Set this to your specific frontend domain for production
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
});

createTables();

// Register cookie plugin
fastify.register(fastifyCookie);

// Register session plugin (must be before oauth2)
fastify.register(fastifySession, {
	secret: process.env.FASTIFY_SESSION_SECRET_KEY,
	cookie: { secure: false }, // Set secure: true when using HTTPS
	saveUninitialized: false,
});

// Register fastify-oauth2
fastify.register(fastifyOauth2, {
	name: 'googleOAuth2', // will be available as fastify.googleOAuth2
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: process.env.CLIENT_ID,
			secret: process.env.CLIENT_SECRET,
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	// This is the path that starts the OAuth flow
	startRedirectPath: '/auth/google',
	// The callback URL registered in Google Cloud Console
	callbackUri: `${process.env.BACKEND_DOMAIN}/auth/google/callback`,
});

// jwt register
fastify.register(require('fastify-jwt'), {
	secret: process.env.JWT_SECRET_KEY,
});

fastify.register(require('./src/routes/AuthRoutes'));
fastify.register(require('./src/routes/JwtRoutes'));
fastify.register(require('./src/routes/UserRoutes'));
fastify.register(require('./src/routes/SessionRoutes'));
fastify.register(require('./src/routes/TwoFactorRoutes'));
fastify.register(require('./src/routes/UploadRoutes'));


// Test route
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

// Start the server
const start = async () => {
	try {
		await fastify.listen({ port: 8001, host: '0.0.0.0' });
		fastify.log.info(`Server listening on http://localhost:${fastify.server.address().port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();