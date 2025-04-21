import gameController from '../controllers/gameController.js'

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

export default routes;