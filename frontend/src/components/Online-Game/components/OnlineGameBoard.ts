import { GameBoard, gameState } from "../../Offline-Game/components/GameBoard.js";
import { BallController, Controller, HumanPlayerController } from "../../Offline-Game/components/GameControllers.js";
import { PongGameClient } from "./Game.js";

export class OnlineGameBoard extends GameBoard {
	private client: PongGameClient;
	private matchId: string;
	private playerId: string;
	private opponentId: string;
	private isPlayer1: boolean; // Determines which paddle this player controls
	private lastSentBallUpdate: number = 0;
	private ballUpdateInterval: number = 50; // Send ball updates every 50ms
	protected canvas: HTMLCanvasElement;

	constructor(
	  canvas: HTMLCanvasElement, 
	  gameHeader: HTMLElement,
	  client: PongGameClient,
	  matchId: string,
	  playerId: string,
	  opponentId: string,
	  isPlayer1: boolean
	) {
	  // Call parent constructor with no game type to use the overloaded empty constructor
	  super();
	  
	  // Reassign the properties that would normally be set in the parent constructor
	  this.canvas = canvas;
	  this.gameHeader = gameHeader;
	  
	  const ctx = canvas.getContext('2d');
	  if (ctx === null) {
		throw new Error("Unable to get 2D rendering context");
	  }
	  this.ctx = ctx;
	  
	  // Online game specific properties
	  this.client = client;
	  this.matchId = matchId;
	  this.playerId = playerId;
	  this.opponentId = opponentId;
	  this.isPlayer1 = isPlayer1;
	  
	  // Initialize the game
	  this.resize();
	  window.addEventListener('resize', () => this.resize());
	  this.state = this.createInitialState();
	  this.initializeOnlineControllers();
	  this.ballController = new BallController();
	  this.initOnlineEventListeners();
	  
	  // Set up websocket handlers for game events
	  this.setupWebSocketHandlers();
	}
	
	private initializeOnlineControllers(): void {
	  // In online mode, each player only controls their own paddle
	  if (this.isPlayer1) {
		this.player1Controller = new HumanPlayerController({ up: 'w', down: 's' }, 'player1Y');
		this.player2Controller = new NetworkController(); // This receives updates from opponent
	  } else {
		this.player1Controller = new NetworkController(); // This receives updates from opponent
		this.player2Controller = new HumanPlayerController({ up: 'w', down: 's' },'player1Y');
	  }
	}
	
	private initOnlineEventListeners(): void {
	  // We'll override the keyboard and touch controls to only affect the player's paddle
	  // and send those updates to the opponent
	  window.addEventListener('keydown', (e) => {
		this.state.keys[e.key] = true;
		
		// Only send paddle updates for the paddle we control
		this.sendPaddlePosition();
	  });
	  
	  window.addEventListener('keyup', (e) => {
		this.state.keys[e.key] = false;
		
		// Send updated paddle position when key is released
		this.sendPaddlePosition();
	  });
	  
	  // Add touch event listeners
	  this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
	  this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
	  this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
	}
	
	private handleTouchStart(e: TouchEvent): void {
	  e.preventDefault();
	  
	  // Track all touches
	  for (let i = 0; i < e.changedTouches.length; i++) {
		const touch = e.changedTouches[i];
		this.state.activeTouches.set(touch.identifier, {
		  x: touch.clientX,
		  y: touch.clientY
		});
	  }
	  
	  this.state.isTouching = true;
	  
	  // Send paddle position update
	  this.sendPaddlePosition();
	}
	
	private handleTouchMove(e: TouchEvent): void {
	  e.preventDefault();
	  
	  // Update position for all active touches
	  for (let i = 0; i < e.changedTouches.length; i++) {
		const touch = e.changedTouches[i];
		if (this.state.activeTouches.has(touch.identifier)) {
		  this.state.activeTouches.set(touch.identifier, {
			x: touch.clientX,
			y: touch.clientY
		  });
		}
	  }
	  
	  // Move the paddle based on touch position
	  this.updatePaddleFromTouch();
	  
	  // Send paddle position update
	  this.sendPaddlePosition();
	}
	
	private handleTouchEnd(e: TouchEvent): void {
	  e.preventDefault();
	  
	  // Remove ended touches
	  for (let i = 0; i < e.changedTouches.length; i++) {
		const touch = e.changedTouches[i];
		this.state.activeTouches.delete(touch.identifier);
	  }
	  
	  if (this.state.activeTouches.size === 0) {
		this.state.isTouching = false;
	  }
	}
	
	private updatePaddleFromTouch(): void {
	  if (this.state.activeTouches.size === 0) return;
	  
	  // Calculate average y position of all touches
	  let totalY = 0;
	  this.state.activeTouches.forEach((touch) => {
		totalY += touch.y;
	  });
	  const avgY = totalY / this.state.activeTouches.size;
	  
	  // Calculate position relative to canvas
	  const rect = this.canvas.getBoundingClientRect();
	  const relativeY = avgY - rect.top;
	  const paddleTarget = (relativeY / this.canvas.height) * this.canvas.height;
	  
	  // Move the player's paddle
	  if (this.isPlayer1) {
		this.state.player1Y = paddleTarget - (this.state.paddleHeight / 2);
	  } else {
		this.state.player2Y = paddleTarget - (this.state.paddleHeight / 2);
	  }
	}
	
	private sendPaddlePosition(): void {
	  // Only send paddle position if game is started
	  if (!this.state.gameStarted) return;
	  
	  const position = this.isPlayer1 ? this.state.player1Y : this.state.player2Y;
	  this.client.updatePaddlePosition(this.matchId, position);
	}
	
	private setupWebSocketHandlers(): void {
	  // Handle opponent paddle movement
	  this.client.on('opponent_paddle_move', (data:any) => {
		if (this.isPlayer1) {
		  this.state.player2Y = data.position;
		} else {
		  this.state.player1Y = data.position;
		}
	  });
	  
	  // Handle ball sync (when we're not the authoritative player)
	  this.client.on('ball_sync', (data:any) => {
		// Only update ball if we're not the current authority
		if ((this.state.servingPlayer === 1 && !this.isPlayer1) || 
			(this.state.servingPlayer === 2 && this.isPlayer1)) {
		  this.state.ballX = data.ballData.x;
		  this.state.ballY = data.ballData.y;
		  this.state.ballSpeedX = data.ballData.speedX;
		  this.state.ballSpeedY = data.ballData.speedY;
		}
	  });
	  
	  // Handle goal updates
	  this.client.on('goal_update', (data:any) => {
		// Update scores
		if (data.scoringPlayer === 1) {
		  this.state.scores.player1 = data.newScore.player1;
		} else {
		  this.state.scores.player2 = data.newScore.player2;
		}
		
		// Reset ball to center
		this.resetBall();
		
		// Set serving player
		this.state.servingPlayer = data.scoringPlayer === 1 ? 2 : 1;
	  });
	  
	  // Handle match results
	  this.client.on('match_results', (data:any) => {
		this.state.gameEnded = true;
		
		// Show game over screen
		const winner = data.winner === this.playerId ? 'You' : 'Opponent';
		this.showGameOverScreen(winner, data.finalScore, data.eloChange);
	  });
	}
	
	// Override the update method to include network synchronization
	update(): void {
	  // Call parent update to handle local game state
	  super.update();
	  
	  // If this player is the authority for the ball, send ball updates
	  const now = Date.now();
	  if ((this.state.servingPlayer === 1 && this.isPlayer1) || 
		  (this.state.servingPlayer === 2 && !this.isPlayer1)) {
		if (now - this.lastSentBallUpdate > this.ballUpdateInterval) {
		  this.client.updateBall(this.matchId, {
			x: this.state.ballX,
			y: this.state.ballY,
			speedX: this.state.ballSpeedX,
			speedY: this.state.ballSpeedY
		  });
		  this.lastSentBallUpdate = now;
		}
	  }
	  
	  // Check for goals and report them
	  this.checkForGoals();
	}
	
	private checkForGoals(): void {
	  // Check if ball went past left edge (player 2 scores)
	  if (this.state.ballX < 0) {
		this.state.scores.player2++;
		this.client.reportGoal(this.matchId, 2, {
		  player1: this.state.scores.player1,
		  player2: this.state.scores.player2
		});
		this.resetBall();
		this.state.servingPlayer = 1;
	  }
	  
	  // Check if ball went past right edge (player 1 scores)
	  if (this.state.ballX > this.canvas.width) {
		this.state.scores.player1++;
		this.client.reportGoal(this.matchId, 1, {
		  player1: this.state.scores.player1,
		  player2: this.state.scores.player2
		});
		this.resetBall();
		this.state.servingPlayer = 2;
	  }
	}
	
	// Method to reset ball to center for a new point
	private resetBall(): void {
	  this.state.ballX = this.canvas.width / 2;
	  this.state.ballY = this.canvas.height / 2;
	  this.state.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
	  this.state.ballSpeedY = (Math.random() * 2 - 1) * 5;
	}
	
	// Show game over screen with player stats
	private showGameOverScreen(winner: string, finalScore: { player1: number, player2: number }, eloChange: any): void {
	  // Implementation depends on your UI, but could create a modal or overlay
	  const gameOver = document.createElement('div');
	  gameOver.className = 'game-over';
	  gameOver.innerHTML = `
		<h2>${winner} won!</h2>
		<p>Final Score: ${finalScore.player1} - ${finalScore.player2}</p>
		<p>ELO Change: ${eloChange[this.playerId] > 0 ? '+' : ''}${eloChange[this.playerId]}</p>
		<button class="play-again">Play Again</button>
		<button class="return-to-menu">Return to Menu</button>
	  `;
	  
	  document.body.appendChild(gameOver);
	  
	  // Add event listeners for buttons
	  gameOver.querySelector('.play-again')?.addEventListener('click', () => {
		document.body.removeChild(gameOver);
		this.client.findMatch(); // Find a new match
	  });
	  
	  gameOver.querySelector('.return-to-menu')?.addEventListener('click', () => {
		document.body.removeChild(gameOver);
		window.location.href = '/dashboard'; // Return to dashboard or main menu
	  });
	}
	
	// Method to handle when game ends or player leaves
	stopGame(): void {
	  if (!this.state.gameEnded) {
		// Report that player forfeited the match
		this.client.completeMatch(
		  this.matchId,
		  this.opponentId, // Opponent wins if player leaves
		  {
			player1: this.state.scores.player1,
			player2: this.state.scores.player2
		  }
		);
	  }
	  
	  // Clean up event listeners
	  window.removeEventListener('resize', () => this.resize());
	  window.removeEventListener("beforeunload", this.handleNavigation.bind(this));
	  window.removeEventListener("hashchange", this.handleNavigation.bind(this));
	  window.removeEventListener("popstate", this.handleNavigation.bind(this));
	}

	get getState(): gameState {
	  return this.state;
	}
  }
  
  // NetworkController is responsible for handling opponent's paddle
  class NetworkController implements Controller {
	update(canvas: HTMLCanvasElement, state: gameState): void {
	  // This controller doesn't actively update the paddle position
	  // It receives updates via the WebSocket and the position is set directly
	}
  }