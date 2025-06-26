/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chatWebSocketService.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 16:47:48 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 16:47:48 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import store from "../../../store/store";
import { pongGameClient } from "../../main";

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
  private messageQueue: Array<{ event: string, payload: any }> = [];

  constructor(serverUrl: string | null = null) {
    if (!serverUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      this.serverUrl = `${protocol}//${hostname}${port}/social/`;
      console.log("server url is ", this.serverUrl);
    } else {
      this.serverUrl = serverUrl;
      console.log("server url is not null");
    }

    console.log("Using WebSocket URL:", this.serverUrl);
  }

  /**
   * Connect to the WebSocket server with user credentials
   */
  public connect(): Promise<boolean> {
    this.username = store.nickname;
    this.userId = store.userId;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          this.connected = true;

          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg) this.send(msg.event, msg.payload);
          }

          if (!this.username || !this.userId) {
            console.error("Username or userId is missing!");
            return Promise.reject("Missing username or userId");
          }
          this.send("user:connect", {
            username: this.username,
            userId: this.userId,
          });

          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.socket.onclose = () => {
          console.log("WebSocket connection closed");
          this.connected = false;
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        reject(error);
      }
    });
  }

  public send(event: string, payload: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify({ event, payload }));
    console.log(`send: ${event} with: `, payload);

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

  public off(event: string, callback?: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(callback);

      if (index !== -1) {
        listeners.splice(index, 1);
        this.eventListeners.set(event, listeners);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.send("user:disconnect", {});
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
  private handleIncomingMessage(message: {
    event: string;
    payload: any;
  }): void {
    const { event, payload } = message;

    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event) || [];
      callbacks.forEach((callback) => {
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
      console.error("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;

    const backoffTime = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );
    console.log(`Attempting to reconnect in ${backoffTime}ms`);

    this.reconnectTimeout = window.setTimeout(() => {
      if (this.username && this.userId) {
        this.connect().catch((error) => {
          console.error("Reconnect failed:", error);
          this.attemptReconnect();
        });
      }
    }, backoffTime);
  }

  /**
 * Mark all messages in a room as read
 */
  public markMessagesAsRead(roomId: string | null): void {
    if (!this.isConnected()) {
      console.error("WebSocket not connected");
      return;
    }

    if (!roomId) {
      console.error("Invalid roomId");
      return;
    }

    const userId = this.userId;

    if (!userId) {
      console.error("User ID not available");
      return;
    }

    this.send("messages:mark_read", {
      roomId,
      userId
    });

    console.log(`Sent request to mark messages as read in room ${roomId} for user ${userId}`);
  }

  /**
   * Get list of pending friend requests
   */
  public getPendingFriendRequests(): void {
    if (!this.userId) {
      console.error("Not authenticated");
      return;
    }

    this.send("friends:get_pending", {
      userId: this.userId,
    });
  }

  /**
 * Remove a friend
 */
  public removeFriend(friendId: number): void {
    if (!this.userId) {
      console.error('Not authenticated');
      return;
    }

    this.send('friend:remove', {
      userId: this.userId,
      friendId
    });
  }


  /**
  * checkFriendshipStatus
  */
  public checkFriendshipStatus(friendId: number): void {
    if (!this.userId) {
      console.error('Not authenticated');
      return;
    }

    this.send('friend:checkStatus', {
      userId: this.userId,
      friendId
    });
  }

  /**
   * Get message history for a specific chat room
   */
  public getMessageHistory(roomId: string): void {
    this.send("messages:history", { roomId });
  }
  /**
   * Send a friend request
   */
  public sendFriendRequest(to: string): void {
    if (!this.username) {
      console.error("Not authenticated");
      return;
    }

    this.send("friend:request", {
      from: this.username,
      to,
    });
  }

  /**
   * Accept a friend request
   */
  public acceptFriendRequest(from: string): void {
    if (!this.username) {
      console.error("Not authenticated");
      return;
    }

    this.send("friend:accept", {
      from,
      to: this.username,
    });
  }

  /**
   * Block a user
   */
  public blockUser(blockedUserId: string): void {
    if (!this.username) {
      console.error("Not authenticated");
      return;
    }

    this.send("user:block", {
      from: this.userId,
      blocked: blockedUserId,
    });

    this.send('friend:remove', {
      userId: this.userId,
      friendId: blockedUserId
    });

    this.send('friendship:check', {
      currentUserId: this.userId,
      targetUserId: blockedUserId
    });
  }

  /**
   * Unblock a user
   */
  public unblockUser(unblockedUserId: string): void {
    if (!this.userId) {
      console.error("Not authenticated");
      return;
    }

    this.send("user:unblock", {
      from: this.userId,
      unblocked: unblockedUserId,
    });
  }
}

const chatService = new ChatWebSocketService()
export default chatService;

export function setupGameInviteHandlers() {
  chatService.on("create_friend_match", (data) => {
    console.log("Received create_friend_match from chat:", data);

    if (pongGameClient && pongGameClient.isConnected()) {
      pongGameClient.send('create_friend_match', {
        player1: data.player1,
        player2: data.player2,
        initiator: data.initiator
      });
      console.log("Forwarded create_friend_match to matchmaking service");
    } else {
      console.error("Matchmaking client not connected");
    }
  });

  chatService.on("game:match_creating", (data) => {
    console.log("Match is being created:", data);
  });
}
