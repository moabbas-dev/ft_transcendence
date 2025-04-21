const gameService = require('../services/gameService');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 */
const healthCheck = (request, reply) => {
  reply.send({ status: 'OK', timestamp: new Date().toISOString() });
};

/**
 * Get game status by room ID
 */
const getGameStatus = (request, reply) => {
  const { roomId } = request.params;
  const gameRoom = gameService.gameRooms[roomId];
  
  if (!gameRoom) {
    return reply.code(404).send({ error: 'Game room not found' });
  }
  
  return reply.send({
    roomId,
    playerCount: gameRoom.players.length,
    gameStarted: gameRoom.gameStarted,
    scores: gameRoom.scores
  });
};

/**
 * Get list of active game rooms
 */
const getActiveRooms = (request, reply) => {
  const rooms = Object.keys(gameService.gameRooms).map(roomId => {
    const room = gameService.gameRooms[roomId];
    return {
      roomId,
      playerCount: room.players.length,
      gameStarted: room.gameStarted
    };
  });
  
  reply.send(rooms);
};

module.exports = {
  healthCheck,
  getGameStatus,
  getActiveRooms
};