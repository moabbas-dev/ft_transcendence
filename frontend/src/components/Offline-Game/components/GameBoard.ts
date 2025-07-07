import { t } from "../../../languages/LanguageController.js";
import { refreshRouter } from "../../../router.js";
import { AIDifficulty, GameType } from "../../../types/types.js";
import { AIController, BallController, Controller, HumanPlayerController } from "./GameControllers.js";
import { updateBackgrounds } from "./HeaderAnimations_utils.js";

export interface gameState {
	paddleHeight: number;
	paddleWidth: number;
	ballSize: number;
	player1Y: number;
	player2Y: number;
	ballX: number;
	ballY: number;
	ballSpeedX: number;
	ballSpeedY: number;
	paddleOffset: number;
	scores: { player1: number; player2: number };
	keys: { [key: string]: boolean };
	gameEnded: boolean;
	gameStarted: boolean;
	servingPlayer: 1 | 2;
	touchStartX: number | null;
	touchStartY: number | null;
	touchCurrentX: number | null;
	touchCurrentY: number | null;
	isTouching: boolean;
	activeTouches: Map<number, { x: number; y: number }>;
	gamePaused: boolean;
}

export class GameBoard {
	protected gameType: GameType;
	protected canvas: HTMLCanvasElement;
	protected ctx: CanvasRenderingContext2D;
	protected state:gameState;
	protected player1Controller!: Controller;
	protected player2Controller!: Controller;
	protected ballController: Controller;
	protected gameHeader: HTMLElement;
	private AIDifficulty: AIDifficulty | undefined;

	/** Overload signatures 
	 *  the first constructor will be used for online games
	 *  the second constructor for offline games
	 * with this technique we can make a new class for online games inherits 
	 * from this class some methods like draw(), initEventListerners() ...
	*/
	constructor();
	constructor(gameType: GameType, canvas:HTMLCanvasElement, gameHeader:HTMLElement, difficulty?:AIDifficulty);

	constructor(gameType?: GameType, canvas?:HTMLCanvasElement, gameHeader?:HTMLElement, difficulty?:AIDifficulty) {
		this.gameType = gameType!;
		this.canvas = canvas!;
		this.gameHeader = gameHeader!
		this.AIDifficulty = difficulty

		const ctx = canvas!.getContext('2d');
		if (ctx === null) {
			throw new Error("Unable to get 2D rendering context");
		}
		this.ctx = ctx;
		this.resize();
		window.addEventListener('resize', () => this.resize());
		this.state = this.createInitialState();		
		this.initializeControllers();
		this.ballController = new BallController();
		this.initEventListeners();
		window.addEventListener("beforeunload", this.handleNavigation.bind(this));
		window.addEventListener("hashchange", this.handleNavigation.bind(this));
		window.addEventListener("popstate", this.handleNavigation.bind(this));
	}

	protected handleNavigation() {
		this.state.gameEnded = true;
	}

	protected createInitialState(): gameState {
		return {
			paddleHeight: 120,
			paddleWidth: 20,
			ballSize: 12,
			player1Y: 250,
			player2Y: 250,	  
			ballX: 400,
			ballY: 300,
			ballSpeedX: 8,
			ballSpeedY: 5,
			paddleOffset: 30,
			scores: { player1: 0, player2: 0 },
			keys: {} as { [key: string]: boolean },
			gameEnded: false,
			gameStarted: false,
			servingPlayer: 1,
			touchStartX: null,
			touchStartY: null,
			touchCurrentX: null,
			touchCurrentY: null,
			isTouching: false,
			activeTouches: new Map(),
			gamePaused: false
		};
	}

	private initializeControllers() {
		this.player1Controller = new HumanPlayerController(
			{ up: 'w', down: 's' },
			'player1Y'
		);

		this.player2Controller = this.gameType === "AI"
		? new AIController(this.AIDifficulty!)
		: new HumanPlayerController(
			{ up: 'arrowup', down: 'arrowdown' },
			'player2Y'
		);
	}

	private initEventListeners() {
		window.addEventListener('resize', () => this.resize());

		window.addEventListener('keydown', (e) => {
			const key = e.key.toLowerCase();

			if (key === 'escape' && this.state.gameStarted && !this.state.gameEnded && this.gameType !== "online") {
			  if (!this.state.keys[key]) {
				this.state.gamePaused = !this.state.gamePaused;
			  }
			  e.preventDefault();
			}

			this.state.keys[key] = true;
		});
		window.addEventListener('keyup', (e) => {
		  this.state.keys[e.key.toLowerCase()] = false;
		});

		const handleTouchStart = (e: TouchEvent) => {
			if (this.state.gamePaused) {
				e.preventDefault();
				return;
			}
			e.preventDefault();
			const rect = this.canvas.getBoundingClientRect();

			Array.from(e.touches).forEach(touch => {
			  const x = touch.clientX - rect.left;
			  const y = touch.clientY - rect.top;
			  
			  this.state.activeTouches.set(touch.identifier, { x, y });
			});
			
			this.updatePaddlesFromTouch();
		  };
		
		  const handleTouchMove = (e: TouchEvent) => {
			if (this.state.gamePaused) {
				e.preventDefault();
				return;
			}
			e.preventDefault();
			const rect = this.canvas.getBoundingClientRect();
			
			Array.from(e.touches).forEach(touch => {
			  const x = touch.clientX - rect.left;
			  const y = touch.clientY - rect.top;

			  this.state.activeTouches.set(touch.identifier, { x, y });
			});
			
			this.updatePaddlesFromTouch();
		  };
		
		  const handleTouchEnd = (e: TouchEvent) => {
			if (this.state.gamePaused) {
				e.preventDefault();
				return;
			}
			e.preventDefault();
			Array.from(e.changedTouches).forEach(touch => {
			  this.state.activeTouches.delete(touch.identifier);
			});
			this.updatePaddlesFromTouch();
		  };
		
		this.canvas.addEventListener('touchstart', handleTouchStart);
		this.canvas.addEventListener('touchmove', handleTouchMove);
		this.canvas.addEventListener('touchend', handleTouchEnd);
		this.canvas.addEventListener('touchcancel', handleTouchEnd);
	}

	private updatePaddlesFromTouch() {
		const rect = this.canvas.getBoundingClientRect();
		if (this.state.activeTouches.size === 0) return;

		this.state.activeTouches.forEach((touch) => {
		  const rotatedX = touch.y;
		  const rotatedY = touch.x;

		  const isLeftSide = rotatedX > rect.height / 2;

		  const touchPosition = Math.min(Math.max(
			rotatedY / rect.width,
			0
		  ), 1);

		  const paddleY = touchPosition * (rect.width - (this.state.paddleHeight / 2));

		  if (isLeftSide) {
			this.state.player1Y = paddleY;
		  } else if (this.gameType === 'Local') {
			this.state.player2Y = paddleY;
		  }
		});
	}

	get canvasElement() {
		return this.canvas
	}

	get gameScore() :{ player1: number; player2: number } {
		return this.state.scores;
	}

	resize() {
		if (window.matchMedia("(max-width: 640px)").matches) {
			this.canvas.width = window.innerHeight;
			this.canvas.height = window.innerWidth;
		} else {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	init() {
		this.state.ballX = this.canvas.width / 2;
		this.state.ballY = this.canvas.height / 2;
		this.state.gameStarted = true;
		this.state.gameEnded = false;
	}

	draw() {
		this.ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.strokeStyle = "rgba(0, 100, 100, 0.1)";
		this.ctx.lineWidth = 1;
		
		for (let y = 0; y < this.canvas.height; y += 30) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(this.canvas.width, y);
			this.ctx.stroke();
		}

		for (let x = 0; x < this.canvas.width; x += 30) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, this.canvas.height);
			this.ctx.stroke();
		}
  
		this.ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
		this.ctx.lineWidth = 6;
		this.ctx.setLineDash([15, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.stroke();
		this.ctx.setLineDash([]);

		this.ctx.fillStyle = "#3b82f6";

		this.ctx.shadowBlur = 20;
		this.ctx.shadowColor = "#3b82f6";

		this.ctx.fillRect(
			this.state.paddleOffset,
			this.state.player1Y,
			this.state.paddleWidth,
			this.state.paddleHeight
		);

		this.ctx.shadowColor = "#ef4444";
		this.ctx.fillStyle = "#ef4444";
		this.ctx.fillRect(
		this.canvas.width - (this.state.paddleOffset + this.state.paddleWidth),
		this.state.player2Y,
		this.state.paddleWidth,
		this.state.paddleHeight
		);

		const ballSpeed = Math.sqrt(this.state.ballSpeedX ** 2 + this.state.ballSpeedY ** 2)
		this.ctx.shadowColor = ballSpeed > 18 ? "#FF4500" : "#ffffff";
		this.ctx.shadowBlur = 25;
		this.ctx.fillStyle = ballSpeed > 18? "#FF4500" : "#ffffff";
		this.ctx.beginPath();
		this.ctx.arc(this.state.ballX, this.state.ballY, this.state.ballSize, 0, Math.PI * 2);
		this.ctx.fill();
		
		this.ctx.shadowBlur = 15;
		this.ctx.fillStyle = ballSpeed > 18 ? "#FF4500" : "rgba(255, 255, 255, 0.3)";
		for (let i = 1; i <= 5; i++) {
			this.ctx.beginPath();
			this.ctx.arc(
			this.state.ballX - this.state.ballSpeedX * i * 0.5,
			this.state.ballY - this.state.ballSpeedY * i * 0.5,
			this.state.ballSize - i * 1.5,
			0,
			Math.PI * 2
			);
			this.ctx.fill();
		}
		this.ctx.shadowBlur = 0;
		if (this.state.gamePaused) {
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			
			this.ctx.fillStyle = 'white';
			this.ctx.font = '48px Arial';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(t('play.paused'), this.canvas.width / 2, this.canvas.height / 2);
		}
	}

	update() {
		this.player1Controller.update(this.canvas, this.state);
		this.player2Controller.update(this.canvas, this.state);	
		this.ballController.update(this.canvas, this.state);

		const score1Element = this.gameHeader.querySelector('#player-score1');
		if (score1Element) {
		  score1Element.textContent = `${this.state.scores.player1}`;
		  updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
		}
		
		const score2Element = this.gameHeader.querySelector('#player-score2');
		if (score2Element) {
		  score2Element.textContent = `${this.state.scores.player2}`;
		  updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
		}

		this.clampPaddlePosition('player1Y');
		this.clampPaddlePosition('player2Y');

		if (Math.max(this.state.scores.player1, this.state.scores.player2) >= 10) {
			this.state.gameEnded = true;
		}
	}

	protected clampPaddlePosition(positionKey: 'player1Y' | 'player2Y') {
		this.state[positionKey] = Math.max(0,
		  Math.min(this.canvas.height - this.state.paddleHeight, this.state[positionKey])
		);
	}

	protected startGame() {
		this.init();
		this.gameLoop();
	}

	restartGame() {
		this.state = this.createInitialState();
		const resultsPopup = document.querySelector("#result-popup");
		resultsPopup?.classList.add("hidden");
		if (this.ballController instanceof BallController)
			this.ballController.resetConfig()
		this.startGame()
	}

	gameLoop = () => {
		this.draw();
		if (!this.state.gamePaused)
			this.update();
		if (!this.state.gameEnded) {
			requestAnimationFrame(this.gameLoop);
		} else {
			const resultsPopup = document.querySelector("#result-popup")!;
			resultsPopup.classList.toggle("hidden")
			let text = ""
			if (this.gameScore.player1 > this.gameScore.player2)
				text = `${t("play.player")} 1`
			else if (this.gameType == "AI") {
				text = t("play.ai")
			} else {
				text = `${t("play.player")} 2`
			}
			const winnerText = resultsPopup.querySelector('#winner-text')!
			winnerText.textContent = `${text} ${t('play.resultsPopup.title')}`;
			
			const scoreText = resultsPopup.querySelector('#score-text')!
			scoreText.textContent = `${t('play.resultsPopup.finalScore')}: ${this.gameScore.player1} - ${this.gameScore.player2}`

			const restartButton = resultsPopup.querySelector("#restart-btn")
			restartButton?.addEventListener('click', () => {
				refreshRouter()
			}, { once: true });
		}
	}
}
