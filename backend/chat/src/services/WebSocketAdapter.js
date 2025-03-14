import WebSocket from "ws";
import { WebSocketServer } from "ws";

class WebSocketAdapter {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.setupConnectionHandler();
  }

  setupConnectionHandler() {
    this.wss.on("connection", (socket) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, { socket, username: "" });

      socket.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      socket.on("close", () => {
        const client = this.clients.get(clientId);
        if (client && client.username) {
          this.handleMessage(clientId, {
            event: "disconnect",
            payload: {},
          });
        }
        this.clients.delete(clientId);
      });
    });
  }

  handleMessage(clientId, message) {
    const { event, payload } = message;
    const client = this.clients.get(clientId);
    if (!client) return;

    if (event === "user:connect") {
      client.username = payload.username;
      this.clients.set(clientId, client);
      this.emit("user:connect", { clientId, payload });
    } else {
      this.emit(event, { clientId, payload });
    }
  }

  on(event, callback) {
    this.wss.on(`custom:${event}`, callback);
  }

  emit(event, data) {
    this.wss.emit(`custom:${event}`, data);
  }

  sendTo(clientId, event, payload) {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, payload }));
    }
  }

  sendToUser(username, event, payload) {
    for (const [clientId, client] of this.clients.entries()) {
      if (
        client.username === username &&
        client.socket.readyState === WebSocket.OPEN
      ) {
        this.sendTo(clientId, event, payload);
        break;
      }
    }
  }

  getUsernameByClientId(clientId) {
    const client = this.clients.get(clientId);
    return client ? client.username : null;
  }

  getClientIdByUsername(username) {
    for (const [clientId, client] of this.clients.entries()) {
      if (client.username === username) return clientId;
    }
    return null;
  }

  isUserOnline(username) {
    return Array.from(this.clients.values()).some(
      (client) => client.username === username
    );
  }

  generateClientId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

function registerWebSocketAdapter(fastify) {
  const adapter = new WebSocketAdapter(fastify.server);
  return adapter;
}

export { WebSocketAdapter, registerWebSocketAdapter };