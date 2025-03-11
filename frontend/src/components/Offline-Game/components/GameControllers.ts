import { AIDifficulty } from "../../../types/types.js";
import { gameState } from "./GameBoard.js";

export interface Controller {
	update(canvas: HTMLCanvasElement, state: gameState): void;
}

export class HumanPlayerController implements Controller {
	constructor(
	  private readonly controlKeys: { up: string; down: string },
	  private readonly playerPositionKey: keyof Pick<gameState, 'player1Y' | 'player2Y'>,
	  private baseSpeed: number = 10
	) {}

	update(canvas: HTMLCanvasElement, state: gameState) {
		const paddleSpeed = this.calculatePaddleSpeed(canvas.height);

		if (state.keys[this.controlKeys.up]) {
			state[this.playerPositionKey] -= paddleSpeed;
		}
		if (state.keys[this.controlKeys.down]) {
			state[this.playerPositionKey] += paddleSpeed;
		}
	}
  
	private calculatePaddleSpeed(canvasHeight: number): number {
		return this.baseSpeed * (canvasHeight / 500);
		}
	}

export class AIController implements Controller {
	private difficulty: AIDifficulty;
	private readonly config = {
		baseSpeed: 8,
		reactionDelay: { easy: 250, medium: 200, hard: 100 },
		predictionAccuracy: { easy: 0.7, medium: 0.8, hard: 0.95 },
		errorMargin: { easy: 0.4, medium: 0.4, hard: 0.2 }
	};
	private lastUpdateTime = 0;
	private targetY = 0;
	private ballTrajectory: number[] = [];

	constructor(difficulty: AIDifficulty) {
		console.log("Difficulty selected:", difficulty);
		this.difficulty = difficulty;
	}

	update(canvas: HTMLCanvasElement, state: gameState) {
		if (!state.gameStarted || state.gameEnded) return;
		this.trackBallMovement(state);
		this.calculateTargetPosition(canvas, state);
		this.movePaddle(state, canvas.height);
	}

	private trackBallMovement(state: gameState) {
		// Store ball positions for trajectory analysis
		this.ballTrajectory.push(state.ballY);
		if (this.ballTrajectory.length > 10) {
		  this.ballTrajectory.shift();
		}
	}

	private calculateTargetPosition(canvas: HTMLCanvasElement, state: gameState) {
		const now = Date.now();
		const timeSinceLastUpdate = now - this.lastUpdateTime;

		if (timeSinceLastUpdate < this.config.reactionDelay[this.difficulty])
			return;

		// Predict ball position based on difficulty
		const predictedY = this.predictBallPosition(canvas, state);
		const error = canvas.height * this.config.errorMargin[this.difficulty];

		this.targetY = this.applyDifficultyModifiers(
		  predictedY,
		  error,
		  this.config.predictionAccuracy[this.difficulty]
		);
		
		this.lastUpdateTime = now;
	}

	private predictBallPosition(canvas: HTMLCanvasElement, state: gameState): number {
		if (this.difficulty === "easy") return state.ballY;
	
		// Calculate predicted intercept point
		const timeToIntercept = Math.abs(
		  (canvas.width - state.paddleOffset - state.ballX) / state.ballSpeedX
		);
	
		let predictedY = state.ballY + (state.ballSpeedY * timeToIntercept);
	
		// Bounce prediction for higher difficulties
		if (this.difficulty === "hard") {
		  const bounces = Math.floor(predictedY / canvas.height);
		  predictedY = bounces % 2 === 0 
			? predictedY % canvas.height 
			: canvas.height - (predictedY % canvas.height);
		}

		return predictedY;
	}

	private applyDifficultyModifiers(
		targetY: number,
		maxError: number,
		accuracy: number
	  ): number {
		// Apply random error based on difficulty
		const error = maxError * (1 - accuracy) * (Math.random() * 2 - 1);
		return targetY + error;
	}
	
	private movePaddle(state: gameState, canvasHeight: number) {
		const paddleCenter = state.player2Y + state.paddleHeight / 2;
		const speed = this.calculateAdaptiveSpeed(paddleCenter, this.targetY);

		// Apply smooth movement with momentum
		const newPosition = state.player2Y + speed;
		state.player2Y = Math.max(0, 
			Math.min(newPosition, canvasHeight - state.paddleHeight)
		);
	}

	private calculateAdaptiveSpeed(currentY: number, targetY: number): number {
		const distance = targetY - currentY;
		const baseSpeed = this.config.baseSpeed * (this.difficulty === "hard" ? 1.2 : 1);

		// Dynamic speed adjustment based on distance
		const speedMultiplier = Math.min(Math.abs(distance) / 50, 2);
		const direction = Math.sign(distance);

		// Add random speed variation for lower difficulties
		const variation = this.difficulty === "easy" 
		  ? Math.random() * 2 - 1 
		  : 0;

		return (baseSpeed * speedMultiplier + variation) * direction;
	}
}

export class BallController implements Controller {
    private config = {
		baseSpeed: 8,
		minSpeed: 5,
		speedIncrease: 1.001,
		maxBounceAngle: Math.PI / 4 // 45 degrees
	};

	public resetConfig() {
		this.config = {
			baseSpeed: 8,
			minSpeed: 5,
			speedIncrease: 1.001,
			maxBounceAngle: Math.PI / 4 // 45 degrees
		}
	}

	update(canvas: HTMLCanvasElement, state: gameState) {
		if (!state.gameStarted || state.gameEnded) return;

		this.moveBall(state);
		this.checkWallCollisions(canvas, state);
		this.checkPaddleCollisions(canvas, state);
		this.checkScoreConditions(canvas, state);
	}

	resetBall(canvas: HTMLCanvasElement, state: gameState) {
        state.ballX = canvas.width / 2;
        state.ballY = canvas.height / 2;
        
        let angle = (Math.random() * Math.PI/2) - Math.PI/4;
		if (angle >= 0 && angle < 10)
			angle = 10;
		if (angle < 0 && angle > -10)
			angle = -10;

        state.ballSpeedX = Math.cos(angle) * this.config.baseSpeed * this.getServeDirection(state);
        state.ballSpeedY = Math.sin(angle) * this.config.baseSpeed;
        
        state.servingPlayer = state.servingPlayer === 1 ? 2 : 1;
    }

    private moveBall(state: gameState) {
        state.ballX += state.ballSpeedX;
        state.ballY += state.ballSpeedY;
    }

	private clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	private checkWallCollisions(canvas: HTMLCanvasElement, state: gameState) {
		if (state.ballY - state.ballSize < 0 || 
			state.ballY + state.ballSize > canvas.height) {
			state.ballSpeedY *= -1;
			state.ballY = this.clamp(
				state.ballY, 
				state.ballSize, 
				canvas.height - state.ballSize
			);
		}
	}

	private checkPaddleCollisions(canvas: HTMLCanvasElement, state: gameState) {
		const leftPaddleX = state.paddleOffset;
		const rightPaddleX = canvas.width - state.paddleOffset - state.paddleWidth;

        if (this.isCollidingWithPaddle(leftPaddleX, state.player1Y, state)) {
            this.handlePaddleCollision('left', state);
        }
        else if (this.isCollidingWithPaddle(rightPaddleX, state.player2Y, state)) {
            this.handlePaddleCollision('right', state);
        }
    }

    private isCollidingWithPaddle(paddleX: number, paddleY: number, state: gameState) {
        return state.ballX - state.ballSize < paddleX + state.paddleWidth &&
               state.ballX + state.ballSize > paddleX &&
               state.ballY > paddleY &&
               state.ballY < paddleY + state.paddleHeight;
    }

    private handlePaddleCollision(side: 'left' | 'right', state: gameState) {
        const paddleY = side === 'left' ? state.player1Y : state.player2Y;
        const relativeIntersectY = state.ballY - (paddleY + state.paddleHeight/2);
        const normalizedIntersectY = relativeIntersectY / (state.paddleHeight/2);
        const bounceAngle = normalizedIntersectY * this.config.maxBounceAngle;

        const currentSpeed = Math.sqrt(state.ballSpeedX ** 2 + state.ballSpeedY ** 2);
        const newSpeed = currentSpeed * this.config.speedIncrease;

        state.ballSpeedX = Math.cos(bounceAngle) * newSpeed * (side === 'left' ? 1 : -1);
        state.ballSpeedY = Math.sin(bounceAngle) * newSpeed;

        // Ensure minimum vertical speed
        if (Math.abs(state.ballSpeedY) < this.config.minSpeed) {
            state.ballSpeedY = this.config.minSpeed * Math.sign(state.ballSpeedY);
        }
    }

	private checkScoreConditions(canvas: HTMLCanvasElement, state: gameState) {
		if (state.ballX < 0) {
			state.scores.player2++;
			this.resetBall(canvas, state);
		} 
		else if (state.ballX > canvas.width) {
			state.scores.player1++;
			this.resetBall(canvas, state);
		}
    }

    private getServeDirection(state: gameState): number {
        return state.servingPlayer === 1 ? 1 : -1;
    }
}