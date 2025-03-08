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
		canvas.className = "size-full rounded-lg";
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
