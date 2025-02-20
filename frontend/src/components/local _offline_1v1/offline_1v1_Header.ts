import { createComponent } from "../../utils/StateManager";
import player1Pic from "../../../public/assets/p1.jpg";
import player2Pic from "../../../public/assets/p2.jpg";

export const PlayerHeader = createComponent(() => {
  const container = document.createElement("div");
  container.className = "relative flex items-center text-white text-lg shadow-md w-full overflow-hidden rounded-2xl mt-4";

  const leftBg = document.createElement("div");
  leftBg.className = "absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500 ";
  const rightBg = document.createElement("div");
  rightBg.className = "absolute inset-y-0 right-0 bg-red-600 transition-all duration-500 ";

  leftBg.style.width = "50%";
  rightBg.style.width = "50%";

  container.appendChild(leftBg);
  container.appendChild(rightBg);

  const content = document.createElement("div");
  content.className = "rounded-2xl relative z-10 flex justify-between items-center w-full px-8 py-2";

  content.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${player1Pic}" alt="Player 1" class="w-12 h-12 rounded-full border border-white">
      <div>
        <p class="font-bold">Player 1</p>
        <p id="player1-score" class="text-xl font-semibold">0</p>
      </div>
    </div>

    <div class="text-2xl font-bold uppercase tracking-wider">
      Pong Game 🏓
    </div>

    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="font-bold">Player 2</p>
        <p id="player2-score" class="text-xl font-semibold">0</p>
      </div>
      <img src="${player2Pic}" alt="Player 2" class="w-12 h-12 rounded-full border border-white">
    </div>
  `;
  container.appendChild(content);

  function updateBackgrounds(player1Score: number, player2Score: number) {
    const total = player1Score + player2Score;
    let leftWidth = 50;
    let rightWidth = 50;
    if (total > 0) {
      leftWidth = (player1Score / total) * 100;
      rightWidth = 100 - leftWidth;
    }
    leftBg.style.transition = "width 0.5s ease-in-out";
    rightBg.style.transition = "width 0.5s ease-in-out";
    leftBg.style.width = `${leftWidth}%`;
    rightBg.style.width = `${rightWidth}%`;
  }

  // Load scores from Local Storage
  const savedScores = localStorage.getItem("pongScores");
  if (savedScores) {
    const { player1, player2 } = JSON.parse(savedScores);
    updateBackgrounds(player1, player2);
  }

  document.addEventListener("scoreUpdate", (e: Event) => {
    const event = e as CustomEvent<{ player1: number; player2: number }>;
    updateBackgrounds(event.detail.player1, event.detail.player2);
  });

  return container;
});
