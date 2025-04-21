const fastify = require('fastify');
const path = require('path');
const { Server } = require('socket.io');
const routes = require('../routes');
const { setupSocketHandlers } = require('../socket/socketHandler');
const logger = require('../utils/logger');

// Create Fastify server
const createServer = () => {
  const app = fastify({
    logger: true
  });

  // Register static file serving
  app.register(require('@fastify/static'), {
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
    await app.listen({ port: PORT, host: '0.0.0.0' });
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

module.exports = { createServer, startServer };

