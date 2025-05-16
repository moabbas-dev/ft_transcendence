export class TournamentClient {
	private ws: WebSocket | null = null;
	private callbacks: { [key: string]: ((data: any) => void)[] } = {};
	private reconnectTimer: number | null = null;
	private userId: string;
	private connectionPromise: Promise<boolean> | null = null;
	private isConnecting: boolean = false;
  
	constructor(private serverUrl: string, userId: string) {
		this.userId = userId;
		this.serverUrl = serverUrl || "ws://localhost:3001";
	}

	public initialize(): Promise<boolean> {
		if (!this.connectionPromise && !this.isConnecting) {
			this.isConnecting = true;
			this.connectionPromise = this.connect();
		}
		return this.connectionPromise || Promise.resolve(false);
	}

	private connect(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const wsUrl = `${this.serverUrl}?userId=${encodeURIComponent(this.userId)}`;
			console.log(`Connecting to: ${wsUrl}`);
			
			this.ws = new WebSocket(wsUrl);
	
			this.ws.onopen = () => {
				console.log('Connected to tournament server');
				this.isConnecting = false;
				this.triggerCallbacks('connection', { status: 'connected' });
				resolve(true);
			};
	
			this.ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
	
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
				console.log('Disconnected from tournament server');
				this.connectionPromise = null;
				this.isConnecting = false;
	
				if (this.reconnectTimer !== null) {
					clearTimeout(this.reconnectTimer);
				}
				this.reconnectTimer = window.setTimeout(() => this.initialize(), 3000);
				
				reject(new Error('WebSocket connection closed'));
			};
	
			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				this.isConnecting = false;
				this.connectionPromise = null;
				reject(error);
			};
		});
	}

	private triggerCallbacks(type: string, payload: any): void {
		if (this.callbacks[type]) {
			this.callbacks[type].forEach(callback => callback(payload));
		}
	}

	async send(type: string, payload: any = {}): Promise<void> {
		try {
			if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
				await this.initialize();
			}
			
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({ type, payload }));
			} else {
				console.error('Cannot send message, WebSocket is not connected');
				throw new Error('WebSocket not connected');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}

	on(messageType: string, callback: (data: any) => void): void {
		console.log("[TOURNAMENT EVENT RECEIVED]: ", messageType);
		
		if (!this.callbacks[messageType]) {
			this.callbacks[messageType] = [];
		}
		this.callbacks[messageType].push(callback);
		
		if (messageType === 'connection' && this.ws && this.ws.readyState === WebSocket.OPEN) {
			callback({ status: 'connected' });
		}
	}

	off(messageType: string, callback?: (data: any) => void): void {
		if (!this.callbacks[messageType]) return;

		if (callback) {
			const index = this.callbacks[messageType].indexOf(callback);
			if (index !== -1) {
				this.callbacks[messageType].splice(index, 1);
			}
		} else {
			delete this.callbacks[messageType];
		}
	}

	disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		if (this.reconnectTimer !== null) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		
		this.connectionPromise = null;
		this.isConnecting = false;
	}

	isConnected(): boolean {
		return !!this.ws && this.ws.readyState === WebSocket.OPEN;
	}

	async createTournament(name: string, playerCount: number): Promise<void> {
		await this.send('create_tournament', { name, playerCount });
	}

	async joinTournament(tournamentId: string): Promise<void> {
		await this.send('join_tournament', { tournamentId });
	}

	async startTournament(tournamentId: string): Promise<void> {
		await this.send('start_tournament', { tournamentId });
	}

	async submitTournamentMatchResult(matchId: string, winnerId: string): Promise<void> {
		await this.send('tournament_match_result', { matchId, winnerId });
	}

	async getTournamentDetails(tournamentId: string): Promise<void> {
		await this.send('get_tournament_details', { tournamentId });
	}

	async listTournaments(): Promise<void> {
		await this.send('list_tournaments', {});
	}

	updatePaddlePosition(matchId: string, position: number): void {
		this.send('paddle_move', { matchId, position }).catch(err => 
			console.error('Failed to send paddle position:', err)
		);
	}

	updateBall(matchId: string, position: any, velocity: any, scores: any): void {
		this.send('ball_update', {
			matchId,
			position,
			velocity,
			scores
		}).catch(err => console.error('Failed to send ball update:', err));
	}

	completeMatch(matchId: string, winner: string, finalScore: any): void {
		this.send('game_end', {
			matchId,
			winner,
			player1Goals: finalScore.player1,
			player2Goals: finalScore.player2
		}).catch(err => console.error('Failed to complete match:', err));
	}
}
