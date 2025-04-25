import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

/**
 * WebSocketAdapter - Manages WebSocket connections and message routing
 * for the matchmaking service
 */
class WebSocketAdapter {
  /**
   * Create a new WebSocketAdapter
   * @param {Server} server - HTTP/HTTPS server instance to attach WebSocket server to
   */
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Map of client connections: clientId -> { socket, userData }
    this.rooms = new Map();   // Map of room connections: roomId -> Set of clients
    this.messageHandlers = new Map(); // Map of message type handlers
  }

  /**
   * Initialize the WebSocket server with message handlers
   * @param {Function} onConnection - Function to call when a new connection is established
   */
  initialize(onConnection) {
    this.wss.on('connection', (socket, request) => {
      // Let the controller handle the connection
      if (onConnection) {
        onConnection(socket, request);
      }
    });
  }
  
  /**
   * Register a message type handler
   * @param {string} messageType - Type of message to handle
   * @param {Function} handler - Handler function (clientId, payload) => Promise<void>
   */
  registerMessageHandler(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }
  
  /**
   * Process an incoming message
   * @param {string} clientId - ID of the client sending the message
   * @param {Object} message - Parsed message object
   * @returns {Promise<boolean>} Whether the message was handled
   */
  async processMessage(clientId, message) {
    const { type, payload } = message;
    
    const handler = this.messageHandlers.get(type);
    if (handler) {
      try {
        await handler(clientId, payload);
        return true;
      } catch (error) {
        console.error(`Error handling message type ${type}:`, error);
        this.sendToClient(clientId, 'error', { 
          message: `Error processing ${type}: ${error.message}`
        });
        return false;
      }
    }
    
    return false; // Message type not handled
  }
  
  /**
   * Join a client to a room
   * @param {string} clientId - ID of the client
   * @param {string} roomId - ID of the room to join
   */
  joinRoom(clientId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId).add(clientId);
    console.log(`Client ${clientId} joined room: ${roomId}`);
    
    // Notify room about new client
    this.sendToRoom(roomId, 'client_joined', { clientId }, clientId);
  }
  
  /**
   * Remove a client from a room
   * @param {string} clientId - ID of the client
   * @param {string} roomId - ID of the room to leave
   */
  leaveRoom(clientId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.delete(clientId);
    console.log(`Client ${clientId} left room: ${roomId}`);
    
    // Remove room if empty
    if (room.size === 0) {
      this.rooms.delete(roomId);
      console.log(`Room deleted: ${roomId}`);
    } else {
      // Notify room about client leaving
      this.sendToRoom(roomId, 'client_left', { clientId });
    }
  }
  
  /**
   * Register a new client connection
   * @param {string} clientId - Unique ID for the client
   * @param {WebSocket} socket - WebSocket connection
   * @param {Object} userData - Optional user data to associate with the client
   */
  registerClient(clientId, socket, userData = {}) {
    this.clients.set(clientId, { socket, userData });
  }
  
  /**
   * Update a client's user data
   * @param {string} clientId - ID of the client
   * @param {Object} userData - User data to update
   */
  updateClientData(clientId, userData) {
    const client = this.clients.get(clientId);
    if (client) {
      client.userData = { ...client.userData, ...userData };
    }
  }
  
  /**
   * Remove a client
   * @param {string} clientId - ID of the client to remove
   */
  removeClient(clientId) {
    this.clients.delete(clientId);
  }
  
  /**
   * Send a message to a specific client
   * @param {string} clientId - ID of the client
   * @param {string} messageType - Type of the message
   * @param {Object} payload - Message data
   * @returns {boolean} Whether the message was sent successfully
   */
  sendToClient(clientId, messageType, payload) {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      client.socket.send(JSON.stringify({
        type: messageType,
        payload
      }));
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      return false;
    }
  }
  
  /**
   * Send a message to all clients in a room
   * @param {string} roomId - ID of the room
   * @param {string} messageType - Type of the message
   * @param {Object} payload - Message data
   * @param {string} excludeClient - Optional client ID to exclude
   */
  sendToRoom(roomId, messageType, payload, excludeClient = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.forEach(clientId => {
      if (clientId !== excludeClient) {
        this.sendToClient(clientId, messageType, payload);
      }
    });
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param {string} messageType - Type of the message
   * @param {Object} payload - Message data
   * @param {string} excludeClient - Optional client ID to exclude
   */
  broadcast(messageType, payload, excludeClient = null) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClient) {
        this.sendToClient(clientId, messageType, payload);
      }
    });
  }
  
  /**
   * Get all clients in a room
   * @param {string} roomId - ID of the room
   * @returns {Array} Array of client IDs in the room
   */
  getClientsInRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }
  
  /**
   * Check if a client is connected
   * @param {string} clientId - ID of the client
   * @returns {boolean} Whether the client is connected
   */
  isClientConnected(clientId) {
    const client = this.clients.get(clientId);
    return client !== undefined && client.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get client count
   * @returns {number} Number of connected clients
   */
  getClientCount() {
    return this.clients.size;
  }
  
  /**
   * Get client data
   * @param {string} clientId - ID of the client
   * @returns {Object|null} Client data or null if client not found
   */
  getClientData(clientId) {
    const client = this.clients.get(clientId);
    return client ? client.userData : null;
  }
  
  /**
   * Close all connections and clean up
   */
  close() {
    this.wss.close();
    this.clients.clear();
    this.rooms.clear();
    console.log('WebSocket server closed');
  }
}

// Export a factory function to create the adapter
export function createWebSocketAdapter(server) {
  return new WebSocketAdapter(server);
}