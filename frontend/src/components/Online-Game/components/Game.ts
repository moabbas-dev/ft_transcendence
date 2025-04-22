import { OnlineGameBoard } from "./OnlineGameBoard";

export class PongGameClient {
	private ws: WebSocket | null = null;
	private callbacks: { [key: string]: ((data: any) => void)[] } = {};
	private reconnectTimer: number | null = null;
	private authToken: string;
	private gameBoard: OnlineGameBoard | null = null;
	
	constructor(private serverUrl: string, authToken: string) {
	  this.authToken = authToken;
	  this.connect();
	}
	
	private connect(): void {
	  this.ws = new WebSocket(this.serverUrl);
	  
	  this.ws.onopen = () => {
		console.log('Connected to game server');
		this.send('auth', { token: this.authToken });
	  };
	  
	  this.ws.onmessage = (event) => {
		try {
		  const message = JSON.parse(event.data);
		  console.log('Received:', message);
		  
		  // Trigger all callbacks for this message type
		  if (this.callbacks[message.type]) {
			this.callbacks[message.type].forEach(callback => callback(message.payload));
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
		console.error('WebSocket error:', error);
	  };
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
	  if (!this.callbacks[messageType]) {
		this.callbacks[messageType] = [];
	  }
	  this.callbacks[messageType].push(callback);
	}
	
	// Remove a callback
	off(messageType: string, callback?: (data: any) => void): void {
	  if (!this.callbacks[messageType]) return;
	  
	  if (callback) {
		const index = this.callbacks[messageType].indexOf(callback);
		if (index !== -1) {
		  this.callbacks[messageType].splice(index, 1);
		}
	  } else {
		// Remove all callbacks for this message type
		delete this.callbacks[messageType];
	  }
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
	  
	  // Show "Finding match" UI
	  this.showFindingMatchUI();
	}
	
	// Cancel matchmaking
	cancelMatchmaking(): void {
	  this.send('cancel_matchmaking');
	  this.hideFindingMatchUI();
	}
	
	// Show UI for finding a match
	private showFindingMatchUI(): void {
	  const findingMatch = document.createElement('div');
	  findingMatch.id = 'finding-match-overlay';
	  findingMatch.innerHTML = `
		<div class="finding-match-content">
		  <h2>Finding Match...</h2>
		  <div class="spinner"></div>
		  <button id="cancel-matchmaking">Cancel</button>
		</div>
	  `;
	  
	  document.body.appendChild(findingMatch);
	  
	  document.getElementById('cancel-matchmaking')?.addEventListener('click', () => {
		this.cancelMatchmaking();
	  });
	}
	
	// Hide the finding match UI
	private hideFindingMatchUI(): void {
	  const findingMatch = document.getElementById('finding-match-overlay');
	  if (findingMatch) {
		document.body.removeChild(findingMatch);
	  }
	}
	
	// Start a game when match is found
	startGame(matchId: string, playerId: string, opponentId: string, isPlayer1: boolean): void {
	  // Hide the finding match UI if it's visible
	  this.hideFindingMatchUI();
	  
	  // Get the game canvas and header elements
	  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
	  const gameHeader = document.getElementById('game-header') as HTMLElement;
	  
	  if (!canvas || !gameHeader) {
		console.error('Game elements not found in the DOM');
		return;
	  }
	  
	  // Create a new online game board
	  this.gameBoard = new OnlineGameBoard(
		canvas,
		gameHeader,
		this,
		matchId,
		playerId,
		opponentId,
		isPlayer1
	  );
	  
	  // Start the game loop
	  this.startGameLoop();
	}
	
	// Start the game loop
	private startGameLoop(): void {
	  const gameLoop = () => {
		if (this.gameBoard) {
		  // Update and draw the game
		  this.gameBoard.update();
		  this.gameBoard.draw();
		  
		  // Continue the loop if game hasn't ended
		  if (!this.gameBoard.getState.gameEnded) {
			requestAnimationFrame(gameLoop);
		  }
		}
	  };
	  
	  // Start the loop
	  requestAnimationFrame(gameLoop);
	}
	
	// Game-specific methods
	updatePaddlePosition(matchId: string, position: number): void {
	  this.send('paddle_move', { matchId, position });
	}
	
	updateBall(matchId: string, ballData: { x: number, y: number, speedX: number, speedY: number }): void {
	  this.send('ball_update', { matchId, ballData });
	}
	
	reportGoal(matchId: string, scoringPlayer: 1 | 2, newScore: { player1: number, player2: number }): void {
	  this.send('goal_scored', { matchId, scoringPlayer, newScore });
	}
	
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