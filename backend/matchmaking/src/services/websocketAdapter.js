import WebSocket, { WebSocketServer } from 'ws';

export function registerWebSocketAdapter(fastify) {
  const wss = new WebSocketServer({ server: fastify.server });
  
  const adapter = {
    server: wss,
    clients: new Map(), // Store connected clients
    
    // Send message to specific client by ID
    sendToClient: function(clientId, messageType, payload) {
      const client = this.clients.get(clientId);
      if (client && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify({
          type: messageType,
          payload: payload
        }));
        return true;
      }
      return false;
    },
    
    // Broadcast to all clients
    broadcast: function(messageType, payload, excludeId = null) {
      this.clients.forEach((client, id) => {
        if (id !== excludeId && client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: messageType,
            payload: payload
          }));
        }
      });
    },
    
    // Register a new client connection
    registerClient: function(clientId, socket, userData = {}) {
      this.clients.set(clientId, { 
        socket: socket,
        userData: userData
      });
    },
    
    // Remove a client
    removeClient: function(clientId) {
      this.clients.delete(clientId);
    }
  };
  
  fastify.decorate('ws', adapter);
  return adapter;
}