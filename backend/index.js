require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const sqlite3 = require('sqlite3').verbose();
const { createServer } = require('http'); // Use http server
const { Server } = require('socket.io');

// Enable CORS on Fastify
fastify.register(cors, {
  origin: '*', // Set this to your specific frontend domain for production
  methods: ['GET', 'POST'],
});

// Create a new SQLite database connection
const db = new sqlite3.Database('../data/database.sqlite');
const { createTables } = require('./src/db/initDb');
createTables(db);



fastify.register(require('fastify-jwt'), {
  secret: 'uPdPHqezhZFFXwJLSOvEqLx86EaJsBgVazod8spCxqJ0LBOIXQCK3+vqJ210kD3hmOe0FIgDqU2iA6eNmelf2Q==',
});


fastify.register(require('./src/routes/AuthRoutes'));
fastify.register(require('./src/routes/UserRoutes'));
fastify.register(require('./src/routes/FriendRoutes'));
fastify.register(require('./src/routes/BlockedUserRoutes'));
fastify.register(require('./src/routes/SessionRoutes'));
fastify.register(require('./src/routes/TwoFactorCodeRoutes'));


// Create the HTTP server explicitly for Socket.IO
const server = createServer(fastify.server);

// Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Handle socket events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  // socket.emit('chat-message', 'Hello World');

  // socket.on('send-chat-message', (data) => {
  //   console.log(Message from ${data.sender}: ${data.message});
  //   io.emit('receiveMessage', data);
  // });

  socket.on('send-chat-message', (message) => {
    console.log(`Received message from ${socket.id}: ${message}`);
    
    // Broadcast the message to all clients except the sender
    socket.broadcast.emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Test route
fastify.get('/', async (request, reply) => {
  return { message: 'Hello from the backend!' };
});

// Graceful shutdown
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        fastify.log.error('Error closing database:', err);
        reject(err);
      } else {
        fastify.log.info('Database connection closed.');
        resolve();
      }
    });
  });
};

// Handle shutdown signals
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

// Attach signal handlers
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