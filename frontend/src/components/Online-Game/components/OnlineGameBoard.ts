import store from "../../../../store/store.js";
import { t } from "../../../languages/LanguageController.js";
import { navigate, refreshRouter } from "../../../router.js";
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
	private isPlayer1: boolean;
	private lastSentBallUpdate: number = 0;
	private ballUpdateInterval: number = 30;
	protected canvas: HTMLCanvasElement;
	private lastReceivedState: any = null;
	private lastInputTime: number = 0;
	private inputDelay: number = 30;
	private lastSentPaddlePosition: number = 0;
	private eventListeners: Array<{
        target: EventTarget;
        type: string;
        listener: any;
    }> = [];
	private websocketHandlers: Array<{
        event: string;
        handler: (data: any) => void;
    }> = [];

	constructor(
		canvas: HTMLCanvasElement,
		gameHeader: HTMLElement,
		client: PongGameClient | TournamentClient,
		matchId: string,
		playerId: string,
		opponentId: string,
		isPlayer1: boolean
	) {
		super("online", canvas, gameHeader);
		this.canvas = canvas;
		this.gameHeader = gameHeader;

		const ctx = canvas.getContext('2d');
		if (ctx === null) {
			throw new Error("Unable to get 2D rendering context");
		}
		this.ctx = ctx;

		this.client = client;
		this.matchId = matchId;
		this.playerId = playerId;
		this.opponentId = opponentId;
		this.isPlayer1 = isPlayer1;

		this.resize();
		window.addEventListener('resize', () => this.resize());
		this.state = this.createInitialState();
		this.initializeOnlineControllers();
		this.initOnlineEventListeners();
		this.setupWebSocketHandlers();
	}

	private initializeOnlineControllers(): void {
		this.player1Controller = new HumanPlayerController({ up: 'w', down: 's' }, 'player1Y');
		this.player2Controller = new NetworkController();
	}

	private showGameResults(results: any) {
		console.log(results);
		const resultsOverlay = document.createElement('div');
		if (document.body.contains(resultsOverlay)) return;
		
		resultsOverlay.className = 'game-results fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
		
		const isWinner = (results.winner === Number(store.userId));
		console.log(isWinner);
		
		resultsOverlay.innerHTML = `
			<div class="results-container bg-black p-8 rounded-xl border-2 ${isWinner ? 'border-pongcyan' : 'border-pongpink'} max-w-md w-full">
				<h2 class="text-3xl font-bold mb-4 ${isWinner ? 'text-pongcyan' : 'text-pongpink'}">
					${isWinner ? t('play.onlineGame.youWon') : t('play.onlineGame.youLost')}
				</h2>
				<p class="text-white mb-2">${t('play.onlineGame.finalScore')}: ${results.player1Goals} - ${results.player2Goals}</p>
				
				<div class="flex gap-4">
					<button id="play-again-btn" class="flex-1 py-3 px-4 bg-pongcyan text-white rounded-md">
						${t('play.onlineGame.playAgain')}
					</button>
				</div>
			</div>
		`;
		
		document.body.appendChild(resultsOverlay);
		
		document.getElementById('play-again-btn')?.addEventListener('click', () => {
			document.body.removeChild(resultsOverlay);
			navigate("/play/online-game");
		});
	}

	private initOnlineEventListeners(): void {
        const keydownHandler = (e: KeyboardEvent) => {
            this.state.keys[e.key] = true;
            this.sendPaddlePosition();
        };

        const keyupHandler = (e: KeyboardEvent) => {
            this.state.keys[e.key] = false;
            this.sendPaddlePosition();
        };

        this.eventListeners.push(
            { target: window, type: 'keydown', listener: keydownHandler },
            { target: window, type: 'keyup', listener: keyupHandler },
            { target: this.canvas, type: 'touchstart', listener: this.handleTouchStart.bind(this) },
            { target: this.canvas, type: 'touchmove', listener: this.handleTouchMove.bind(this) },
            { target: this.canvas, type: 'touchend', listener: this.handleTouchEnd.bind(this) }
        );

        this.eventListeners.forEach(({ target, type, listener }) => {
            target.addEventListener(type, listener);
        });
	}

	startGame() {
		console.log("KKKKKKKKK: ", this.state.gameEnded);
		console.log("MMMMMMMMM: ", this.isPlayer1);
		
		this.state.gameStarted = true;
		this.state.gameEnded = false;

		this.state.ballX = this.canvas.width / 2;
		this.state.ballY = this.canvas.height / 2;

		if (this.isPlayer1) {
			this.state.servingPlayer = 1;
			const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
			const speed = 8;
			this.state.ballSpeedX = Math.cos(angle) * speed;
			this.state.ballSpeedY = Math.sin(angle) * speed;

			this.sendBallUpdate();
		}else {
			this.state.ballSpeedX = 0;
			this.state.ballSpeedY = 0;
		}

		this.gameLoop();
	}

	private isDestroyed: boolean = false;
	private gameLoopId: number | null = null;

	public destroy(): void {
		if (this.isDestroyed) return;
		
		console.log(`Destroying OnlineGameBoard instance for match ${this.matchId}`);
		this.isDestroyed = true;

		if (this.gameLoopId !== null) {
			cancelAnimationFrame(this.gameLoopId);
			this.gameLoopId = null;
		}

		this.client.off('opponent_paddle_move');
		this.client.off('ball_update');
		this.client.off('score_update');
		
		if (this.client instanceof TournamentClient) {
			this.client.off('tournament_match_completed');
			this.client.off('tournament_completed');
		}

		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		this.state.gameEnded = true;
		this.state.gameStarted = false;
	}

	public isValid(): boolean {
		return !this.isDestroyed;
	}

	gameLoop = () => {
		if (this.state.gameEnded) {
            this.cleanup();
			this.destroy();
			console.log("CLEANUP DONE");
            return;
        }
		if (this.isDestroyed) return;
		if (!this.state.gameEnded) {
			this.draw();
			this.update();
			this.gameLoopId = requestAnimationFrame(this.gameLoop);
		} else {
			if (this.isPlayer1) {
				updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
			} else {
				updateBackgrounds(this.state.scores.player2, this.state.scores.player1);
			}
		}
	}

	private handleTouchStart(e: TouchEvent): void {
		e.preventDefault();

		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			this.state.activeTouches.set(touch.identifier, {
				x: touch.clientX,
				y: touch.clientY
			});
		}

		this.state.isTouching = true;

		this.sendPaddlePosition();
	}

	private handleTouchMove(e: TouchEvent): void {
		e.preventDefault();

		for (let i = 0; i < e.changedTouches.length; i++) {
			const touch = e.changedTouches[i];
			if (this.state.activeTouches.has(touch.identifier)) {
				this.state.activeTouches.set(touch.identifier, {
					x: touch.clientX,
					y: touch.clientY
				});
			}
		}

		this.updatePaddleFromTouch();

		this.sendPaddlePosition();
	}

	private handleTouchEnd(e: TouchEvent): void {
		e.preventDefault();

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

		let totalY = 0;
		this.state.activeTouches.forEach((touch) => {
			totalY += touch.y;
		});
		const avgY = totalY / this.state.activeTouches.size;

		const rect = this.canvas.getBoundingClientRect();
		const relativeY = avgY - rect.top;
		const paddleTarget = (relativeY / this.canvas.height) * this.canvas.height;

		this.state.player1Y = paddleTarget - (this.state.paddleHeight / 2);
	}

	private sendPaddlePosition(): void {
		const now = Date.now();
		if (now - this.lastInputTime < this.inputDelay) return;

		const currentPosition = this.state.player1Y;
		const normalizedY = currentPosition / this.canvas.height;

		if (currentPosition !== this.lastSentPaddlePosition) {
			this.client.updatePaddlePosition(this.matchId, normalizedY);
			this.lastSentPaddlePosition = currentPosition;
			this.lastInputTime = now;
		}
	}

	private setupWebSocketHandlers(): void {
		const paddleMoveHandler = (data: any) => {
            const paddleY = data.position * this.canvas.height;
            this.state.player2Y = paddleY;
        };
		const ballUpdateHandler = (data: any) => {
			if (!this.isPlayer1) {
				const denormalizedPosition = this.denormalizePosition(data.position.x, data.position.y);
				const denormalizedVelocity = {
					x: data.velocity.x * this.canvas.width,
					y: data.velocity.y * this.canvas.height
				};

				this.state.ballX = denormalizedPosition.x;
				this.state.ballY = denormalizedPosition.y;
				this.state.ballSpeedX = denormalizedVelocity.x;
				this.state.ballSpeedY = denormalizedVelocity.y;

				const player1Score = typeof data.scores.player1 === 'number' ? data.scores.player1 : -1;
				const player2Score = typeof data.scores.player2 === 'number' ? data.scores.player2 : -1;
				this.state.scores = {
					player1: player1Score,
					player2: player2Score
				};
			}
        };
		const scoreUpdateHandler = (data: any) => {
			this.state.scores.player1 = data.player1Score;
			this.state.scores.player2 = data.player2Score;
			if (Math.max(this.state.scores.player1, this.state.scores.player2) >= 10)
				this.state.gameEnded = true;
		}
		const tournamentMatchCompletedHandler = (data: any) => {
			if (String(data.matchId) === String(this.matchId)) {
				this.state.gameEnded = true;
				console.log('Tournament match completed:', data);
				this.showTournamentMatchResult(data);
			}
		}
		const tournamentCompletedHandler = (data: any) => {
			console.log('Tournament completed:', data);
			setTimeout(() => {
				navigate(`/tournaments/${data.tournamentId}`);
			}, 5000);
		}
		const mathResultsHandler = (data: any) => {
			this.state.gameEnded = true;
		}

        this.websocketHandlers.push(
            { event: 'opponent_paddle_move', handler: paddleMoveHandler },
            { event: 'ball_update', handler: ballUpdateHandler },
            { event: 'score_update', handler: scoreUpdateHandler},
			{ event: 'match_results', handler: mathResultsHandler}
        );
		if (this.client instanceof TournamentClient) {
			this.websocketHandlers.push(
				{ event: 'tournament_match_completed', handler: tournamentMatchCompletedHandler},
				{ event: 'tournament_completed', handler: tournamentCompletedHandler}
			)
		}

        this.websocketHandlers.forEach(({ event, handler }) => {
            this.client.on(event, handler);
        });
	}

	public cleanup(): void {
        console.log('Cleaning up OnlineGameBoard resources...');
        this.state.gameEnded = true;
        
        this.eventListeners.forEach(({ target, type, listener }) => {
            target.removeEventListener(type, listener);
        });
        this.eventListeners = [];

        this.websocketHandlers.forEach(({ event, handler }) => {
            this.client.off(event, handler);
        });
        this.websocketHandlers = [];

        if (this.lastInputTime) {
            this.lastInputTime = 0;
        }
    }

	private showTournamentMatchResult(data: any): void {
		const isWinner = String(data.winnerId) === String(this.playerId);
		const eloChange = isWinner ? data.winnerEloChange : data.loserEloChange;

		const overlay = document.createElement('div');
		overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
		overlay.innerHTML = `
		  <div class="bg-gray-800 rounded-lg p-8 text-center max-w-md">
			<div class="text-4xl mb-4">
			  ${isWinner ? '🏆 Victory!' : '😔 Defeat'}
			</div>
			<div class="text-xl mb-4 ${isWinner ? 'text-green-400' : 'text-red-400'}">
			  ${isWinner ? 'You Won!' : 'You Lost'}
			</div>
			<div class="text-lg mb-2">
			  ELO Change: 
			  <span class="${eloChange >= 0 ? 'text-green-400' : 'text-red-400'}">
				${eloChange >= 0 ? '+' : ''}${eloChange}
			  </span>
			</div>
			<div class="text-sm text-gray-400">
			  Returning to tournament bracket...
			</div>
		  </div>
		`;

		document.body.appendChild(overlay);

		setTimeout(() => {
			if (document.body.contains(overlay)) {
				document.body.removeChild(overlay);
			}
		}, 3000);
	}

	

	update() {
		if (this.state.gameEnded) {
			this.cleanup();
			console.log("CLEANUP DONE");
			return;
		}
		this.player1Controller.update(this.canvas, this.state);
		this.sendPaddlePosition();

		if (this.lastReceivedState) {
			this.applyServerState(this.lastReceivedState);
		}

		this.clampPaddlePosition('player1Y');
		this.clampPaddlePosition('player2Y');

		if (this.isPlayer1) {
			this.ballController.update(this.canvas, this.state);
			this.sendBallUpdate();
		}

		this.clampPaddlePosition('player1Y');
		this.clampPaddlePosition('player2Y');

		this.updateScoreDisplay();
		
		if (Math.max(this.state.scores.player1, this.state.scores.player2) >= 10) {
			this.state.gameEnded = true;

			const winnerId = this.state.scores.player1 > this.state.scores.player2
				? (this.isPlayer1 ? this.playerId : this.opponentId)
				: (this.isPlayer1 ? this.opponentId : this.playerId);

			if (this.client instanceof TournamentClient) {
				console.log("Sending tournament_match_result");
				this.client.send('tournament_match_result', {
					matchId: this.matchId,
					winnerId: winnerId,
					finalScore: {
						winner: Math.max(this.state.scores.player1, this.state.scores.player2),
						loser: Math.min(this.state.scores.player1, this.state.scores.player2)
					}
				});
			}
			else {
				console.log("Sending game_end message");
				this.client.send('game_end', {
					matchId: this.matchId,
					winner: winnerId,
					player1Goals: this.state.scores.player1,
					player2Goals: this.state.scores.player2
				});
				
				this.cleanup();
			}
			this.updateScoreDisplay();
			// const res = {
			// 	winner: winnerId,
			// 	player1Goals: this.state.scores.player1,
			// 	player2Goals: this.state.scores.player2	
			// }
			// this.showGameResults(res);
		}
	}

	private sendBallUpdate(): void {
		console.log("LALALALALA");
		
		const now = Date.now();
		if (now - this.lastSentBallUpdate < this.ballUpdateInterval) return;

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

	private updateScoreDisplay(): void {
		const score1Element = this.gameHeader.querySelector('#player-score1');
		const score2Element = this.gameHeader.querySelector('#player-score2');

		if (score1Element && score2Element) {
			if (this.isPlayer1) {
				score1Element.textContent = String(this.state.scores.player1);
				score2Element.textContent = String(this.state.scores.player2);
				updateBackgrounds(this.state.scores.player1, this.state.scores.player2);
			} else {
				score1Element.textContent = String(this.state.scores.player2);
				score2Element.textContent = String(this.state.scores.player1);
				updateBackgrounds(this.state.scores.player2, this.state.scores.player1);
			}
		}
	}

	private applyServerState(serverState: any): void {
		this.state.ballX = serverState.ballX;
		this.state.ballY = serverState.ballY;
		this.state.ballSpeedX = serverState.ballSpeedX;
		this.state.ballSpeedY = serverState.ballSpeedY;

		this.state.scores.player1 = serverState.scores.player1;
		this.state.scores.player2 = serverState.scores.player2;

		this.state.player2Y = serverState.player2Y;
	}

	private normalizePosition(x: number, y: number): { x: number, y: number } {
		return {
			x: x / this.canvas.width,
			y: y / this.canvas.height
		};
	}

	private denormalizePosition(normalizedX: number, normalizedY: number): { x: number, y: number } {
		return {
			x: normalizedX * this.canvas.width,
			y: normalizedY * this.canvas.height
		};
	}

	get getState(): gameState {
		return this.state;
	}

	get isEnded(): boolean {
		return this.state.gameEnded;
	}
}

class NetworkController implements Controller {
	update(canvas: HTMLCanvasElement, state: gameState): void {
	}
}