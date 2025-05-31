import { t } from "../../../languages/LanguageController.js";
import { navigate } from "../../../router.js";
import { GameBoard, gameState } from "../../Offline-Game/components/GameBoard.js";
import { BallController, Controller, HumanPlayerController } from "../../Offline-Game/components/GameControllers.js";
import { updateBackgrounds } from "../../Offline-Game/components/HeaderAnimations_utils.js";
import { TournamentClient } from "../../Tournament-Game/TournamentClient.js";
import { PongGameClient } from "./Game.js";

export class OnlineGameBoard extends GameBoard {
	private client: PongGameClient | TournamentClient;
	private matchId: string;
	private playerId: string;
	private opponentId: string;
	private isPlayer1: boolean; // Determines game role (who sends ball updates)
	private lastSentBallUpdate: number = 0;
	private ballUpdateInterval: number = 30; // Send ball updates every 30ms
	protected canvas: HTMLCanvasElement;
	private lastReceivedState: any = null;
	private lastInputTime: number = 0;
	private inputDelay: number = 30; // Delay in ms to prevent sending too many updates
	private lastSentPaddlePosition: number = 0;

	constructor(
		canvas: HTMLCanvasElement,
		gameHeader: HTMLElement,
		client: PongGameClient | TournamentClient,
		matchId: string,
		playerId: string,
		opponentId: string,
		isPlayer1: boolean
	) {
		// Call parent constructor with no game type to use the overloaded empty constructor
		super("online", canvas, gameHeader);

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

		// Initialize the gamestartGame
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
		// UPDATED: Both players control left paddle (player1Y) on their screen
		// The opponent's movements will be mapped to right paddle (player2Y)
		this.player1Controller = new HumanPlayerController({ up: 'w', down: 's' }, 'player1Y');
		this.player2Controller = new NetworkController();
	}

	private initOnlineEventListeners(): void {
		// UPDATED: Only send paddle updates for the left paddle (player controls)
		window.addEventListener('keydown', (e) => {
			this.state.keys[e.key] = true;
			// Send paddle position when local player moves
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

	// UPDATED: Override the startGame method with mirrored ball initialization
	startGame() {
		this.state.gameStarted = true;
		this.state.gameEnded = false;

		// UPDATED: Initialize ball position at center for both players
		this.state.ballX = this.canvas.width / 2;
		this.state.ballY = this.canvas.height / 2;

		// UPDATED: Only Player 1 (game authority) initializes ball velocity
		if (this.isPlayer1) {
			this.state.servingPlayer = 1;
			const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // Random angle between -45 and 45 degrees
			const speed = 8;
			this.state.ballSpeedX = Math.cos(angle) * speed;
			this.state.ballSpeedY = Math.sin(angle) * speed;

			// Send initial ball state to Player 2 (will be automatically mirrored)
			this.sendBallUpdate();
		}else {
			// Player 2 should initialize with zero velocity and wait for updates
			this.state.ballSpeedX = 0;
			this.state.ballSpeedY = 0;
		}

		// Start the game loop
		this.gameLoop();
	}

	gameLoop = () => {
		this.draw();
		this.update();
		if (!this.state.gameEnded) {
			requestAnimationFrame(this.gameLoop);
		} else {
			// UPDATED: Update backgrounds based on player perspective
			if (this.isPlayer1) {
				updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
			} else {
				updateBackgrounds(this.state.scores.player2, this.state.scores.player1);
			}
		}
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

		// UPDATED: Always move the left paddle (player1Y) for local player
		this.state.player1Y = paddleTarget - (this.state.paddleHeight / 2);
	}

	// UPDATED: Send local left paddle position (player1Y)
	private sendPaddlePosition(): void {
		const now = Date.now();
		if (now - this.lastInputTime < this.inputDelay) return;

		// UPDATED: Always send left paddle position (player1Y)
		const currentPosition = this.state.player1Y;
		const normalizedY = currentPosition / this.canvas.height;

		if (currentPosition !== this.lastSentPaddlePosition) {
			this.client.updatePaddlePosition(this.matchId, normalizedY);
			this.lastSentPaddlePosition = currentPosition;
			this.lastInputTime = now;
		}
	}

	// UPDATED: Setup WebSocket handlers with mirrored coordinate system
	private setupWebSocketHandlers(): void {
		// UPDATED: Opponent paddle movement maps to right paddle (player2Y)
		this.client.on('opponent_paddle_move', (data: any) => {
			// Opponent's paddle movement goes to the right side (player2Y)
			const paddleY = data.position * this.canvas.height;
			this.state.player2Y = paddleY;
		});

		// UPDATED: Ball update handling with coordinate transformation
		this.client.on('ball_update', (data: any) => {
			// UPDATED: Only Player 2 receives ball updates (Player 1 is authoritative)
			if (!this.isPlayer1) {
				// Backend already mirrors the coordinates, so we use them directly
				const denormalizedPosition = this.denormalizePosition(data.position.x, data.position.y);
				const denormalizedVelocity = {
					x: data.velocity.x * this.canvas.width,
					y: data.velocity.y * this.canvas.height
				};

				this.state.ballX = denormalizedPosition.x;
				this.state.ballY = denormalizedPosition.y;
				this.state.ballSpeedX = denormalizedVelocity.x;
				this.state.ballSpeedY = denormalizedVelocity.y;
				
				// FIXED: Update scores (backend sends original scores)
				const player1Score = typeof data.scores.player1 === 'number' ? data.scores.player1 : -1;
				const player2Score = typeof data.scores.player2 === 'number' ? data.scores.player2 : -1;
				this.state.scores = {
					player1: player1Score,
					player2: player2Score
				};
			}
		});

		// FIXED: Score update handler (backend sends original scores)
		this.client.on('score_update', (data: any) => {
			this.state.scores.player1 = data.player1Score;
			this.state.scores.player2 = data.player2Score;
		});
	}

	// UPDATED: Override update method with mirrored game logic
	update() {
		// UPDATED: Local player always controls left paddle (player1Y)
		this.player1Controller.update(this.canvas, this.state);
		this.sendPaddlePosition();

		if (this.lastReceivedState) {
			this.applyServerState(this.lastReceivedState);
		}

		this.clampPaddlePosition('player1Y');
		this.clampPaddlePosition('player2Y');

		// UPDATED: Only Player 1 (authoritative) updates ball position and sends updates
		if (this.isPlayer1) {
			this.ballController.update(this.canvas, this.state);
			this.sendBallUpdate();
		}

		this.clampPaddlePosition('player1Y');
		this.clampPaddlePosition('player2Y');

		this.updateScoreDisplay();

		// FIXED: Game end condition using correct score references
		if (Math.max(this.state.scores.player1, this.state.scores.player2) >= 10) {
			this.state.gameEnded = true;

			// FIXED: Determine winner based on actual game scores
			const winnerId = this.state.scores.player1 > this.state.scores.player2
				? (this.isPlayer1 ? this.playerId : this.opponentId)
				: (this.isPlayer1 ? this.opponentId : this.playerId);

			// Send game_end message with actual game scores
			console.log("Sending game_end message");
			this.client.send('game_end', {
				matchId: this.matchId,
				winner: winnerId,
				player1Goals: this.state.scores.player1, // Use state.scores instead of gameScore
				player2Goals: this.state.scores.player2  // Use state.scores instead of gameScore
			});

			this.updateScoreDisplay();
		}
	}

	// UPDATED: Send ball updates with local coordinate system
	private sendBallUpdate(): void {
		const now = Date.now();
		if (now - this.lastSentBallUpdate < this.ballUpdateInterval) return;

		// UPDATED: Send ball position in local coordinate system
		// Backend will mirror coordinates for the opponent
		const normalizedPosition = this.normalizePosition(this.state.ballX, this.state.ballY);
		const normalizedVelocity = {
			x: this.state.ballSpeedX / this.canvas.width,
			y: this.state.ballSpeedY / this.canvas.height
		};

		this.client.send('ball_update', {
			matchId: this.matchId,
			position: { x: normalizedPosition.x, y: normalizedPosition.y },
			velocity: { x: normalizedVelocity.x, y: normalizedVelocity.y },
			scores: {
				player1: this.state.scores.player1,
				player2: this.state.scores.player2
			}
		});

		this.lastSentBallUpdate = now;
	}

	// FIXED: Score display with correct perspective mapping
	private updateScoreDisplay(): void {
		const score1Element = this.gameHeader.querySelector('#player-score1');
		const score2Element = this.gameHeader.querySelector('#player-score2');

		if (score1Element && score2Element) {
			// FIXED: Display scores based on player perspective
			if (this.isPlayer1) {
				// Player 1 sees: their score on left (player1), opponent score on right (player2)
				score1Element.textContent = String(this.state.scores.player1);
				score2Element.textContent = String(this.state.scores.player2);
				updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
			} else {
				// Player 2 sees: their score on left (they are player2), opponent score on right (player1)
				score1Element.textContent = String(this.state.scores.player2);
				score2Element.textContent = String(this.state.scores.player1);
				updateBackgrounds(this.state.scores.player2, this.state.scores.player1);
			}
		}
	}

	private applyServerState(serverState: any): void {
		// Update ball position from server
		this.state.ballX = serverState.ballX;
		this.state.ballY = serverState.ballY;
		this.state.ballSpeedX = serverState.ballSpeedX;
		this.state.ballSpeedY = serverState.ballSpeedY;

		// Update scores from server
		this.state.scores.player1 = serverState.scores.player1;
		this.state.scores.player2 = serverState.scores.player2;

		// UPDATED: Opponent paddle position always goes to right side
		this.state.player2Y = serverState.player2Y;
	}

	// Position normalization (unchanged)
	private normalizePosition(x: number, y: number): { x: number, y: number } {
		return {
			x: x / this.canvas.width,
			y: y / this.canvas.height
		};
	}

	// Position denormalization (unchanged)
	private denormalizePosition(normalizedX: number, normalizedY: number): { x: number, y: number } {
		return {
			x: normalizedX * this.canvas.width,
			y: normalizedY * this.canvas.height
		};
	}

	get getState(): gameState {
		return this.state;
	}
}

// UPDATED: NetworkController handles opponent paddle (right side)
class NetworkController implements Controller {
	update(canvas: HTMLCanvasElement, state: gameState): void {
		// This controller doesn't actively update the paddle position
		// It receives updates via WebSocket and the position is set directly to player2Y
	}
}