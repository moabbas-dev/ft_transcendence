import { LocalPongGame } from "../components/local _offline_1v1/LocalPongGame.js";
import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import { PlayerHeader } from "../components/offline_games_header/OfflineGames_Header.js";

const scores = {player1: 0, player2: 0};
// Function to update and save scores
const saveScores = () => {
  localStorage.setItem("pongScores", JSON.stringify(scores));
};

saveScores();

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="header bg-pongblue w-full h-fit"></div>
      <div class="content relative flex flex-col items-center justify-center h-[calc(100vh-136px)]">
        <div class="player-header w-3/5"></div>
        <div class="game-container w-full h-full flex items-center justify-center"></div>
      </div>
      <div class="footer"></div>
    `;

    // Render header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    // Render footer
    const footer = container.querySelector(".footer")!;
    const footerComp = Footer();
    footer.appendChild(footerComp);

    // Append Player Header
    const playerHeaderContainer = container.querySelector(".player-header");
    if (playerHeaderContainer) {
        const playerHeader = PlayerHeader({
          gameMode: "offline_1v1",
          keyScores: "pongScores"  
        });
        playerHeaderContainer.appendChild(playerHeader);
    }

    // Render the Pong game inside the game-container
    const gameContainer = container.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.appendChild(LocalPongGame()); // Append the game component
    }
  },
};
