import { AIDifficultyPopup } from "../components/local_VS_AI/AIDifficultyPopup.js";
import { AIPongGame } from "../components/local_VS_AI/AIPongGame.js";
import { PlayerHeader } from "../components/offline_games_header/offline_1vAi_Header.js";

// Global variable to hold the current game instance
let currentGame: (HTMLElement & { destroy?: () => void }) | null = null;

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="content relative flex flex-col items-center justify-center h-screen border-8 bg-pongblue border-pongdark border-solid">
        <div class="player-header w-4/5 "></div>
        <div id="pongCanvas" class=" flex items-center justify-center"></div>
      </div>
    `;

    // If a game is already running, clean it up immediately before showing the popup
    const gameContainer = container.querySelector("#pongCanvas");
    if (currentGame && typeof currentGame.destroy === "function") {
      currentGame.destroy();
      currentGame.remove();
      currentGame = null;
      if (gameContainer) gameContainer.innerHTML = "";
    }

    // Show difficulty popup and start game after selection
    const popup = AIDifficultyPopup({
      onSelect: (difficulty: string) => {
        console.log("Difficulty selected:", difficulty);

        // Reset header scores to 0 and update the header to 50% blue and 50% red
        localStorage.setItem(
          "aiPongScores",
          JSON.stringify({ player: 0, ai: 0 })
        );
        document.dispatchEvent(
          new CustomEvent("aiScoreUpdate", {
            detail: { player: 0, ai: 0 },
          })
        );

        const gameContainer = container.querySelector("#pongCanvas");
        if (gameContainer) {
          gameContainer.innerHTML = "";
        }
        // Append Player Header
        const playerHeaderContainer = container.querySelector(".player-header");
        if (playerHeaderContainer) {
          const playerHeader = PlayerHeader({
            gameMode: "ai",
            keyScores: "aiPongScores"  
          });
          playerHeaderContainer.appendChild(playerHeader);
        }

        currentGame = AIPongGame(difficulty);
        if (gameContainer && currentGame) {
          gameContainer.appendChild(currentGame);
        }
      },
    });

    // Ensure popup is removed when navigating away
    container.appendChild(popup);
  },
};
