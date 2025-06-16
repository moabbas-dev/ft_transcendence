export class PongGameClient {
	private ws: WebSocket | null = null;
	private callbacks: { [key: string]: ((data: any) => void)[] } = {};
	private reconnectTimer: number | null = null;
	private userId: string;
	private count: number;
	
	constructor(private serverUrl: string, userId: string) {
	  this.userId = userId;
	//   this.connect();
	  this.count = 0;
	}
	
	public connect(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const wsUrl = `${this.serverUrl}?userId=${encodeURIComponent(this.userId)}`;
			
			this.ws = new WebSocket(wsUrl);
			
			this.ws.onopen = () => {
			  console.log('Connected to matchmaking server');
			  this.triggerCallbacks('connection', { status: 'connected' });
			  resolve(true);
			};
			
			this.ws.onmessage = (event) => {
			  try {
				const message = JSON.parse(event.data);
			  //   console.log('Received:', message);
				
			  // Trigger all callbacks for this message type
			  if (this.callbacks[message.type]) {
				  this.callbacks[message.type].forEach(callback => {
					  try {
						  callback(message.payload);
					  } catch (err) {
						  console.error(`Error in callback for message type ${message.type}:`, err);
					  }
				  });
			  }
			  } catch (err) {
				console.error('Error processing message:', err);
			  }
			};
			
			this.ws.onclose = () => {
			  console.log('Disconnected from game server');
			  
			  // Try to reconnect after a delay
			  if (this.reconnectTimer !== null) {
				clearTimeout(this.reconnectTimer);
			  }
			  this.reconnectTimer = window.setTimeout(() => this.connect(), 3000);
			};
			
			this.ws.onerror = (error) => {
			  console.error('WebSocket errorrrr:', error);
			  reject(new Error('Game WebSocket connection closed'));
			};
		})
	}
	
	private triggerCallbacks(type: string, payload: any): void {
	  if (this.callbacks[type]) {
		this.callbacks[type].forEach(callback => callback(payload));
	  }
	}
	
	// Send message to the server
	send(type: string, payload: any = {}): void {
	  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
		this.ws.send(JSON.stringify({ type, payload }));
	  } else {
		console.error('Cannot send message, WebSocket is not connected');
	  }
	}
	
	// Register a callback for a specific message type
	on(messageType: string, callback: (data: any) => void): void {
		this.count++;
		console.log(this.count, '. Listen for ', messageType, ': ', callback);
	  if (!this.callbacks[messageType]) {
		this.callbacks[messageType] = [];
	  }
	  this.callbacks[messageType].push(callback);
	}
	
	off(messageType: string, callback?: (data: any) => void): void {
		if (!this.callbacks[messageType]) return;
		this.count++;
		console.log(this.count, '. disable ', messageType, ': ', callback);
		if (callback) {
			const index = this.callbacks[messageType].indexOf(callback);
			if (index !== -1) {
				this.callbacks[messageType].splice(index, 1);
			}
		} else {
			delete this.callbacks[messageType];
		}
	}

	clearAllHandlers(): void {
		this.callbacks = {};
	}

	// NEW: Check if connected
	public isConnected(): boolean {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}

	// Close the connection
	disconnect(): void {
	  if (this.ws) {
		this.ws.close();
	  }
	  
	  if (this.reconnectTimer !== null) {
		clearTimeout(this.reconnectTimer);
		this.reconnectTimer = null;
	  }
	}
	
	// Start finding a match
	findMatch(): void {
	  this.send('find_match');
	}
	
	// Cancel matchmaking
	cancelMatchmaking(): void {
	  this.send('cancel_matchmaking');
	}
	
	// Game-specific methods
	updatePaddlePosition(matchId: string, position: number): void {
	  this.send('paddle_move', { matchId, position });
	}
	
	// to be deleted
	updateBall(matchId: string, ballData: { x: number, y: number, speedX: number, speedY: number }): void {
	  this.send('ball_update', { matchId, ballData });
	}

	// to be deleted
	completeMatch(matchId: string, winner: string, finalScore: { player1: number, player2: number }): void {
	  this.send('match_complete', { matchId, winner, finalScore });
	}

	// For playing with friends
	inviteFriend(friendId: string): void {
	  this.send('friend_match_request', { friendId });
	}
	
	acceptFriendMatch(fromId: string): void {
	  this.send('friend_match_accept', { fromId });
	}
  }
