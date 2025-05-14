export class TournamentClient {
	private ws: WebSocket | null = null;
	private callbacks: { [key: string]: ((data: any) => void)[] } = {};
	private reconnectTimer: number | null = null;
	private userId: string;

	constructor(private serverUrl: string, userId: string) {
		this.userId = userId;
		this.connect();
	}

	private connect(): void {
		const wsUrl = `${this.serverUrl}/?userId=${encodeURIComponent(this.userId)}`;

		this.ws = new WebSocket(wsUrl);

		this.ws.onopen = () => {
			console.log('Connected to tournament server');
			this.triggerCallbacks('connection', { status: 'connected' });
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

			if (this.reconnectTimer !== null) {
				clearTimeout(this.reconnectTimer);
			}
			this.reconnectTimer = window.setTimeout(() => this.connect(), 3000);
		};

		this.ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	private triggerCallbacks(type: string, payload: any): void {
		if (this.callbacks[type]) {
			this.callbacks[type].forEach(callback => callback(payload));
		}
	}

	send(type: string, payload: any = {}): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ type, payload }));
		} else {
			console.error('Cannot send message, WebSocket is not connected');
		}
	}

	on(messageType: string, callback: (data: any) => void): void {
		if (!this.callbacks[messageType]) {
			this.callbacks[messageType] = [];
		}
		this.callbacks[messageType].push(callback);
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
		}

		if (this.reconnectTimer !== null) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	createTournament(name: string, playerCount: number): void {
		this.send('create_tournament', { name, playerCount });
	}

	joinTournament(tournamentId: string): void {
		this.send('join_tournament', { tournamentId });
	}

	startTournament(tournamentId: string): void {
		this.send('start_tournament', { tournamentId });
	}

	submitTournamentMatchResult(matchId: string, winnerId: string): void {
		this.send('tournament_match_result', { matchId, winnerId });
	}

	getTournamentDetails(tournamentId: string): void {
		this.send('get_tournament_details', { tournamentId });
	}

	listTournaments(): void {
		this.send('list_tournaments', {});
	}

	// This method works with the existing PongGameClient methods
	// for game state updates during tournament matches
	updatePaddlePosition(matchId: string, position: number): void {
		this.send('paddle_move', { matchId, position });
	}

	updateBall(matchId: string, position: any, velocity: any, scores: any): void {
		this.send('ball_update', {
			matchId,
			position,
			velocity,
			scores
		});
	}

	completeMatch(matchId: string, winner: string, finalScore: any): void {
		this.send('game_end', {
			matchId,
			winner,
			player1Goals: finalScore.player1,
			player2Goals: finalScore.player2
		});
	}
}