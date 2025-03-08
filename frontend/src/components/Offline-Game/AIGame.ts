import { AIDifficulty } from "../../types/types.js";
import { CountdownOverlay } from "./components/CountdownOverlay.js";
import { OfflineGame } from "./OfflineGame.js";
import { DifficultyPopup } from "./components/AIDifficultyPopup.js";
import { GameBoard } from "./components/GameBoard.js";

export class OfflineGameAI extends OfflineGame {
	private difficultyPopup: HTMLElement;
	protected gameCanvas!: GameBoard;

	constructor() {
		super('AI');
		this.difficulty = "easy"
		this.difficultyPopup = DifficultyPopup({
			onSelect: (difficulty: AIDifficulty) => {
				this.difficulty = difficulty
				this.countdownOverlay.startCountdown();
				console.log(this.difficulty);
				this.gameCanvas = new GameBoard("AI", this.canvasElement, this.gameHeader, this.difficulty);
			}
		})
		this.countdownOverlay = CountdownOverlay({onCountdownComplete: () => {
			this.gameCanvas.startGame()
		}}) as any
	}

	get difficultyLevel():AIDifficulty {
		return this.difficulty!
	}

	get difficultyPopupElement():HTMLElement {
		return this.difficultyPopup;
	}

}