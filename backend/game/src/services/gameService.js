import GameRoom from '../models/GameRoom.js';
import logger from '../utils/logger.js';

// Store game rooms and socket mappings
const gameRooms = {};
const socketRooms = {};

/**
 * Get or create a game room
 * @param {string} roomId - Room identifier
 * @param {Object} io - Socket.io instance
 * @returns {GameRoom} - The game room instance
 */
const getOrCreateRoom = (roomId, io) => {
  if (!gameRooms[roomId]) {
    gameRooms[roomId] = new GameRoom(roomId, io);
    logger.info(`Created new room: ${roomId}`);
  }
  return gameRooms[roomId];
};

/**
 * Add player to a room
 * @param {string} socketId - Socket identifier
 * @param {string} roomId - Room identifier
 * @param {Object} io - Socket.io instance
 * @returns {number} - Player number (1 or 2, 0 if room is full)
 */
const addPlayerToRoom = (socketId, roomId, io) => {
  // Clean up any previous room association
  const previousRoomId = socketRooms[socketId];
  if (previousRoomId && previousRoomId !== roomId) {
    if (gameRooms[previousRoomId]) {
      gameRooms[previousRoomId].removePlayer(socketId);
    }
  }
  
  // Record which room this socket is in
  socketRooms[socketId] = roomId;
  
  // Get or create room and add player
  const room = getOrCreateRoom(roomId, io);
  return room.addPlayer(socketId);
};

/**
 * Remove player from room
 * @param {string} socketId - Socket identifier
 */
const removePlayerFromRoom = (socketId) => {
  const roomId = socketRooms[socketId];
  
  if (roomId && gameRooms[roomId]) {
    logger.info(`User ${socketId} disconnected from room ${roomId}`);
    gameRooms[roomId].removePlayer(socketId);
    
    // If no players left, clean up the room
    if (gameRooms[roomId].players.length === 0) {
      logger.info(`Deleting empty room: ${roomId}`);
      delete gameRooms[roomId];
    }
    
    // Remove from socket-room mapping
    delete socketRooms[socketId];
    
    return roomId;
  }
  
  return null;
};

/**
 * Update player position
 * @param {string} socketId - Socket identifier
 * @param {string} roomId - Room identifier
 * @param {number} position - Paddle position
 */
const updatePlayerPosition = (socketId, roomId, position) => {
  if (gameRooms[roomId]) {
    gameRooms[roomId].updatePlayerPosition(socketId, position);
  }
};

/**
 * Restart game
 * @param {string} roomId - Room identifier
 */
const restartGame = (roomId) => {
  if (gameRooms[roomId]) {
    gameRooms[roomId].restartGame();
    return true;
  }
  return false;
};

/**
 * Check if a room can start the game (has 2 players)
 * @param {string} roomId - Room identifier
 * @returns {boolean} - Whether the game can start
 */
const canStartGame = (roomId) => {
  return gameRooms[roomId] && gameRooms[roomId].players.length === 2;
};

/**
 * Start game
 * @param {string} roomId - Room identifier
 */
const startGame = (roomId) => {
  if (gameRooms[roomId]) {
    gameRooms[roomId].startGame();
    return true;
  }
  return false;
};

export default {
  getOrCreateRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  updatePlayerPosition,
  restartGame,
  canStartGame,
  startGame,
  gameRooms,
  socketRooms
};