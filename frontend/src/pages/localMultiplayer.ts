import { OfflineGame } from "../components/Offline-Game/OfflineGame.js";
import { OfflineGameLocal } from "../components/Offline-Game/MultiplayerGame.js";

const scores = {player1: 0, player2: 0};
// Function to update and save scores
const saveScores = () => {
  localStorage.setItem("pongScores", JSON.stringify(scores));
};

saveScores();

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="content relative flex flex-col items-center sm:justify-around h-screen max-sm:p-2 sm:border-8 bg-pongcyan border-pongdark border-solid">
        <div class="player-header w-4/5 "></div>
        <div id="game-container" class="portrait:-rotate-90 portrait:origin-center max-sm:w-[85dvh] max-sm:h-[85dvw] portrait:w-[85dvh] portrait:h-[85dvw] sm:w-[80vw] sm:h-[80vh] rounded-lg -rotate-90 sm:rotate-0"></div>
      </div>
    `;

    // Render header
    // const headerNav = container.querySelector(".header");
    // const header = Header();
    // headerNav?.appendChild(header);

    const content = container.querySelector('.content')!
    const playerHeader = content.querySelector('.player-header')!
    const gameContainer = content.querySelector("#game-container")!;
    const game:OfflineGame = new OfflineGameLocal()

    if (game instanceof OfflineGameLocal) {
      playerHeader.appendChild(game.gameHeaderElement)
      content.appendChild(game.countdownOverlayElement)
      content.appendChild(game.resultPopupElement)
      gameContainer.appendChild(game.gameCanvasElement)
    }
  },
};
