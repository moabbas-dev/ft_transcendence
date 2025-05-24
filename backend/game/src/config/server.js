import fastify from 'fastify'
import { Server } from 'socket.io'
import routes from '../routes/index.js'
import { setupSocketHandlers } from '../socket/socketHandler.js'
import logger from '../utils/logger.js'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';

// Create Fastify server
const createServer = () => {
  const app = fastify({
    logger: true
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Register static file serving
  app.register(fastifyStatic, {
    root: path.join(__dirname, '../../../client/dist'),
    prefix: '/',
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  });

  // Register routes
  app.register(routes);

  return app;
};

// Start the server
const startServer = async () => {
  const app = createServer();
  const PORT = process.env.PORT || 3004;

  try {
    await app.listen({ port: PORT, host: '::' });
    logger.info(`Server running on port ${PORT}`);

    // Setup Socket.IO after server is started
    const io = new Server(app.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup socket handlers
    setupSocketHandlers(io);
  } catch (err) {
    logger.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};

export { createServer, startServer };

