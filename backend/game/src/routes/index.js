const path = require('path');
const gameController = require('../controllers/gameController');

async function routes(fastify, options) {
  // Health check endpoint
  fastify.get('/health', gameController.healthCheck);
  
  // API endpoints
  fastify.get('/api/rooms', gameController.getActiveRooms);
  fastify.get('/api/rooms/:roomId', gameController.getGameStatus);
  
//   // SPA catch-all route
//   fastify.get('*', (request, reply) => {
//     reply.sendFile('index.html');
//   });
}

module.exports = routes;