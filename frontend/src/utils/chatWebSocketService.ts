import store from "../../store/store";


class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 100;
  private reconnectTimeout: number | null = null;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private serverUrl: string;
  private connected = false;
  private username: string | null = null;
  private userId: any;
  
  constructor(serverUrl: string = 'ws://localhost:3002') {
    this.serverUrl = serverUrl;
  }
  
  /**
   * Connect to the WebSocket server with user credentials
  */
  public connect(): Promise<boolean>  {
   
   this.username = store.nickname;
   this.userId = store.userId;
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.serverUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.connected = true;
          
          // Send the initial connection message with user data
          if (!this.username || !this.userId) {
            console.error("Username or userId is missing!");
            return Promise.reject("Missing username or userId");
          }
          this.send('user:connect', {
            username: this.username,
            userId: this.userId
          });
          
          resolve(true);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket connection closed');
          this.connected = false;
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Send a message to the server
   */
  public send(event: string, payload: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    
    this.socket.send(JSON.stringify({
      event,
      payload
    }));
  }
  
  /**
   * Subscribe to an event from the server
   */
  public on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)?.push(callback);
  }
  
  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.send('user:disconnect', {});
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
    
    if (this.reconnectTimeout !== null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Handle incoming WebSocket messages and emit events
   */
  private handleIncomingMessage(message: { event: string, payload: any }): void {
    const { event, payload } = message;
    
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event) || [];
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${backoffTime}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      if (this.username && this.userId) {
        this.connect()
          .catch(error => {
            console.error('Reconnect failed:', error);
            this.attemptReconnect();
          });
      }
    }, backoffTime);
  }
  
  // Chat specific methods
  
  /**
   * Send a private message to another user
   */
  public sendPrivateMessage(to: string, content: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('message:private', {
      from: this.username,
      to,
      content,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get message history for a specific chat room
   */
  public getMessageHistory(roomId: string): void {
    this.send('messages:history', { roomId });
  }
  
  /**
   * Send a typing indicator
   */
  public sendTypingIndicator(to: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('user:typing', {
      from: this.username,
      to
    });
  }
  
  /**
   * Send a friend request
   */
  public sendFriendRequest(to: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('friend:request', {
      from: this.username,
      to
    });
  }
  
  /**
   * Accept a friend request
   */
  public acceptFriendRequest(from: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('friend:accept', {
      from,
      to: this.username
    });
  }
  
  /**
   * Block a user
   */
  public blockUser(blockedUsername: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('user:block', {
      from: this.username,
      blocked: blockedUsername
    });
  }
  
  /**
   * Unblock a user
   */
  public unblockUser(unblockedUsername: string): void {
    if (!this.username) {
      console.error('Not authenticated');
      return;
    }
    
    this.send('user:unblock', {
      from: this.username,
      unblocked: unblockedUsername
    });
  }
}

// Create a singleton instance
export const chatService = new ChatWebSocketService();
export default chatService;