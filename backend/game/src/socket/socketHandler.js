import gameService from '../services/gameService.js'
import logger from '../utils/logger.js';

/**
 * Set up Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);
    
    // Create or join room handler
    socket.on('join-room', (roomId) => {
      logger.info(`User ${socket.id} joining room ${roomId}`);
      
      // Add player to room and join socket room
      const playerNumber = gameService.addPlayerToRoom(socket.id, roomId, io);
      socket.join(roomId);
      
      // Inform the client of their player number
      socket.emit('player-number', playerNumber);
      
      // If player wasn't added successfully (room full), don't proceed
      if (playerNumber === 0) {
        logger.info(`Room ${roomId} is full, player ${socket.id} is spectating`);
        return;
      }
      
      // If two players have joined, start the game
      if (gameService.canStartGame(roomId)) {
        io.to(roomId).emit('start-game');
        gameService.startGame(roomId);
      }
    });
    
    // Handle paddle movement
    socket.on('paddle-move', ({ roomId, position }) => {
      gameService.updatePlayerPosition(socket.id, roomId, position);
    });
    
    // Handle restart requests
    socket.on('restart-game', (roomId) => {
      if (gameService.restartGame(roomId)) {
        io.to(roomId).emit('start-game'); // Ensure all clients know game is restarting
      }
    });
    
    // Handle player disconnection
    socket.on('disconnect', () => {
      const roomId = gameService.removePlayerFromRoom(socket.id);
      
      if (roomId) {
        // Notify remaining player
        io.to(roomId).emit('opponent-disconnected');
      }
    });
  });
};
