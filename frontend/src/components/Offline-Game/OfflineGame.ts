import { OfflineGameHeader } from "./components/GameHeader.js";
import { AIDifficulty } from "../../types/types.js";
import { GameResultsPopUp } from "./components/GameResultsPopUp.js";

export abstract class OfflineGame {
	protected gameHeader: HTMLElement;
	protected countdownOverlay: any;
	protected difficulty: AIDifficulty | undefined;
	protected canvasElement:HTMLCanvasElement;
	protected resultPopup: HTMLElement;

	constructor(gameMode: "AI" | "Local") {
		const canvas = document.createElement("canvas");
		canvas.id = "gameCanvas";
		canvas.className = "portrait:-rotate-90 portrait:origin-center max-sm:w-[85dvh] max-sm:h-[85dvw] portrait:w-[85dvh] portrait:h-[85dvw] sm:w-[80vw] sm:h-[80vh] rounded-lg -rotate-90 sm:rotate-0";
		this.canvasElement = canvas;
		this.gameHeader = OfflineGameHeader({gameMode})
		this.resultPopup = GameResultsPopUp();
	}

	get gameHeaderElement(): HTMLElement {
		return this.gameHeader;
	}

	get countdownOverlayElement(): HTMLElement {
		return this.countdownOverlay;
	}

	get gameCanvasElement(): HTMLCanvasElement {
		return this.canvasElement
	}

	get resultPopupElement(): HTMLElement {
		return this.resultPopup;
	}
}
