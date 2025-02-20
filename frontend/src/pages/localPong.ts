import { LocalPongGame } from "../components/LocalPongGame";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { PlayerHeader } from "../components/PlayerHeader";

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="header bg-[var(--main-color)] w-full h-fit"></div>
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
        const playerHeader = PlayerHeader();
        playerHeaderContainer.appendChild(playerHeader);
    }

    // Render the Pong game inside the game-container
    const gameContainer = container.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.appendChild(LocalPongGame()); // Append the game component
    }
  },
};
