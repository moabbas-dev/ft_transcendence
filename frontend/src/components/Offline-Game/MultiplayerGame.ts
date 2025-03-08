import { CountdownOverlay } from "./components/CountdownOverlay.js";
import { OfflineGame } from "./OfflineGame.js";
import { GameBoard } from "./components/GameBoard.js";

export class OfflineGameLocal extends OfflineGame {
	protected gameCanvas!: GameBoard;
    
    constructor() {
        super('Local');
        this.gameCanvas = new GameBoard("Local", this.canvasElement, this.gameHeader);
        this.countdownOverlay = CountdownOverlay({onCountdownComplete: () => {
            this.gameCanvas.startGame()
		}}) as any
        this.countdownOverlay.startCountdown();
    }
}
