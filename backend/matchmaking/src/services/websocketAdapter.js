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
    this.setupConnectionHandler();
  }

  /**
   * Set up handler for new connections
   */
  setupConnectionHandler() {
    this.wss.on('connection', (socket, request) => {
      // Generate a temporary ID for the socket if not authenticated yet
      const clientId = uuidv4();
      
      // Register the new client
      this.registerClient(clientId, socket);
      
      console.log(`New WebSocket connection: ${clientId}`);
      
      // Send welcome message
      this.sendToClient(clientId, 'welcome', { 
        message: 'Connected to matchmaking service',
        clientId
      });
      
      // Set up message handler
      socket.on('message', (rawMessage) => {
        try {
          const message = JSON.parse(rawMessage);
          this.handleMessage(clientId, socket, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
          this.sendToClient(clientId, 'error', { 
            message: 'Invalid message format'
          });
        }
      });
      
      // Handle disconnection
      socket.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        this.handleDisconnect(clientId);
      });
      
      // Handle errors
      socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });
  }
  
  /**
   * Handle incoming messages from clients
   * @param {string} clientId - ID of the client sending the message
   * @param {WebSocket} socket - WebSocket connection of the client
   * @param {Object} message - Parsed message from the client
   */
  handleMessage(clientId, socket, message) {
    const { type, payload } = message;
    
    console.log(`Received message from ${clientId}: ${type}`);
    
    // Handle different message types
    switch (type) {
      case 'join_room':
        this.joinRoom(clientId, payload.roomId);
        break;
        
      case 'leave_room':
        this.leaveRoom(clientId, payload.roomId);
        break;
        
      case 'room_message':
        this.sendToRoom(payload.roomId, payload.type || 'message', payload.data, clientId);
        break;
        
      // Additional message types will be handled by external controllers
      default:
        // Emit an event for custom message handlers
        if (this.messageHandler) {
          this.messageHandler(clientId, socket, message);
        }
    }
  }
  
  /**
   * Register an external message handler
   * @param {Function} handler - Function to handle messages: (clientId, socket, message) => void
   */
  setMessageHandler(handler) {
    this.messageHandler = handler;
  }
  
  /**
   * Handle client disconnection
   * @param {string} clientId - ID of the disconnected client
   */
  handleDisconnect(clientId) {
    // Clean up: Remove client from all rooms
    this.rooms.forEach((clients, roomId) => {
      if (clients.has(clientId)) {
        this.leaveRoom(clientId, roomId);
      }
    });
    
    // Remove client from clients map
    this.removeClient(clientId);
    
    // Notify disconnect handler if registered
    if (this.disconnectHandler) {
      this.disconnectHandler(clientId);
    }
  }
  
  /**
   * Register a disconnect handler
   * @param {Function} handler - Function to handle disconnections: (clientId) => void
   */
  setDisconnectHandler(handler) {
    this.disconnectHandler = handler;
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
    if (!client || client.socket.readyState !== 1) { // 1 = WebSocket.OPEN
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
    return client !== undefined && client.socket.readyState === 1;
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

function registerWebSocketAdapter(fastify) {
  const adapter = new WebSocketAdapter(fastify.server);
  return adapter;
}

export { WebSocketAdapter, registerWebSocketAdapter };
// export function registerWebSocketAdapter(fastify) {
//   // Create WebSocketServer with appropriate options
//   const wss = new WebSocketServer({ 
//     server: fastify.server,
//   });
  
//   // Handle connection directly here for initial debugging
//   wss.on('connection', (socket, request) => {
//     fastify.log.info('Raw WebSocket connection received');
    
//     socket.on('error', (error) => {
//       fastify.log.error('WebSocket error event:', error);
//     });
//   });
  
//   wss.on('error', (error) => {
//     fastify.log.error('WebSocketServer error:', error);
//   });
  
//   const adapter = {
//     server: wss,
//     clients: new Map(), // Store connected clients: userId -> {socket, userData}
    
//     // Send message to specific client by ID
//     sendToClient: function(clientId, messageType, payload) {
//       const client = this.clients.get(clientId);
//       if (client && client.socket.readyState === WebSocket.OPEN) {
//         try {
//           const message = JSON.stringify({
//             type: messageType,
//             payload: payload
//           });
//           client.socket.send(message);
//           return true;
//         } catch (error) {
//           fastify.log.error(`Error sending message to client ${clientId}:`, error);
//           return false;
//         }
//       }
//       return false;
//     },
    
//     // Broadcast to all clients
//     broadcast: function(messageType, payload, excludeId = null) {
//       this.clients.forEach((client, id) => {
//         if (id !== excludeId && client.socket.readyState === WebSocket.OPEN) {
//           try {
//             const message = JSON.stringify({
//               type: messageType,
//               payload: payload
//             });
//             client.socket.send(message);
//           } catch (error) {
//             fastify.log.error(`Error broadcasting to client ${id}:`, error);
//           }
//         }
//       });
//     },
    
//     // Register a new client connection
//     registerClient: function(clientId, socket, userData = {}) {
//       fastify.log.info(`Registering client: ${clientId}`);
      
//       // Set up error handler for this specific client
//       socket.on('error', (error) => {
//         fastify.log.error(`WebSocket error for client ${clientId}:`, error);
//       });
      
//       this.clients.set(clientId, { 
//         socket: socket,
//         userData: userData
//       });
      
//       fastify.log.info(`Client registered: ${clientId}, total clients: ${this.clients.size}`);
//     },
    
//     // Remove a client
//     removeClient: function(clientId) {
//       fastify.log.info(`Removing client: ${clientId}`);
//       const removed = this.clients.delete(clientId);
//       fastify.log.info(`Client removed: ${clientId}, success: ${removed}, remaining clients: ${this.clients.size}`);
//     },
    
//     // Get all online user IDs
//     getOnlineUserIds: function() {
//       return Array.from(this.clients.keys());
//     }
//   };
  
//   return adapter;
// }