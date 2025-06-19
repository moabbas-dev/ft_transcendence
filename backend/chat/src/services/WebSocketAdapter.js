import WebSocket from "ws";
import { WebSocketServer } from "ws";

/**
 * A WebSocket adapter that wraps the native WebSocket server to provide
 * client management, event-based communication, and utility methods for sending messages.
 */
class WebSocketAdapter {
  /**
   * Initializes the WebSocket server and sets up connection handling.
   * @param {http.Server} server - The underlying HTTP server to attach WebSocket to.
   */
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Maps clientId to { socket, username }
    this.setupConnectionHandler();
  }

  /**
   * Sets up event listeners for incoming WebSocket connections.
   */
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

  /**
   * Handles incoming messages from a connected client.
   * Emits custom events based on the message type.
   * @param {string} clientId - The unique identifier of the client.
   * @param {{ event: string, payload: object }} message - The parsed message object.
   */
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

  /**
   * Registers a listener for a specific custom event.
   * @param {string} event - The event name.
   * @param {Function} callback - The callback to handle the event.
   */
  on(event, callback) {
    this.wss.on(`custom:${event}`, callback);
  }

  /**
   * Emits a custom event with associated data.
   * @param {string} event - The event name.
   * @param {object} data - The data to pass to the listener.
   */
  emit(event, data) {
    this.wss.emit(`custom:${event}`, data);
  }

  /**
   * Sends a message to a specific client by ID.
   * @param {string} clientId - The ID of the client.
   * @param {string} event - The event name.
   * @param {object} payload - The message payload.
   */
  sendTo(clientId, event, payload) {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, payload }));
    }
  }

  /**
   * Sends a message to a client identified by their username.
   * @param {string} username - The target username.
   * @param {string} event - The event name.
   * @param {object} payload - The message payload.
   */
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

  /**
   * Retrieves the username associated with a given client ID.
   * @param {string} clientId - The ID of the client.
   * @returns {string|null} - The username or null if not found.
   */
  getUsernameByClientId(clientId) {
    const client = this.clients.get(clientId);
    return client ? client.username : null;
  }

  /**
   * Retrieves the client ID associated with a given username.
   * @param {string} username - The username to look up.
   * @returns {string|null} - The client ID or null if not found.
   */
  getClientIdByUsername(username) {
    for (const [clientId, client] of this.clients.entries()) {
      if (client.username === username) return clientId;
    }
    return null;
  }

  /**
   * Checks whether a user is currently connected (online).
   * @param {string} username - The username to check.
   * @returns {boolean} - True if online, false otherwise.
   */
  isUserOnline(username) {
    return Array.from(this.clients.values()).some(
      (client) => client.username === username
    );
  }

  /**
   * Generates a random unique client ID.
   * @returns {string} - A new unique client ID.
   */
  generateClientId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

/**
 * Registers the WebSocket adapter with a Fastify instance.
 * @param {FastifyInstance} fastify - The Fastify server instance.
 * @returns {WebSocketAdapter} - The created WebSocketAdapter instance.
 */
function registerWebSocketAdapter(fastify) {
  const adapter = new WebSocketAdapter(fastify.server);
  return adapter;
}

export { WebSocketAdapter, registerWebSocketAdapter };
