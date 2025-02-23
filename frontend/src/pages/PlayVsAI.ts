import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import { AIDifficultyPopup } from "../components/local_VS_AI/AIDifficultyPopup.js";
import { AIPongGame } from "../components/local_VS_AI/AIPongGame.js";
import { PlayerHeader } from "../components/local_VS_AI/offline_1vAi_Header.js";

// Global variable to hold the current game instance
let currentGame: (HTMLElement & { destroy?: () => void }) | null = null;

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="header bg-[var(--main-color)] w-full h-fit"></div>
      <div class="content relative flex flex-col items-center justify-center h-[calc(100vh-136px)]">
        <div class="player-header w-3/5"></div>
        <div id="pongCanvas" class="w-full h-full flex items-center justify-center"></div>
      </div>
      <div class="footer"></div>
    `;

    // Append Header
    const headerNav = container.querySelector(".header");
    const headerComp = Header();
    headerNav?.appendChild(headerComp);

    // Append Footer
    const footer = container.querySelector(".footer")!;
    const footerComp = Footer();
    footer.appendChild(footerComp);

    // Append Player Header
    const playerHeaderContainer = container.querySelector(".player-header");
    if (playerHeaderContainer) {
      const playerHeader = PlayerHeader();
      playerHeaderContainer.appendChild(playerHeader);
    }

    // // Show difficulty popup and start game after selection
    // const popup = AIDifficultyPopup({
    //   onSelect: (difficulty: string) => {
    //     console.log("Difficulty selected:", difficulty);
    //     const gameContainer = container.querySelector("#pongCanvas");
    //     gameContainer!.innerHTML = ""; // Clear previous instances
    //     gameContainer?.appendChild(AIPongGame(difficulty));
    //   },
    // });

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
