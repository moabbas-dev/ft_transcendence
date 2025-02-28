import { createComponent } from "../../utils/StateManager.js";
import player1Pic from "/src/assets/p1.jpg";
import player2Pic from "/src/assets/p2.jpg";

export const PlayerHeader = createComponent(() => {
  const container = document.createElement("div");
  container.className = "relative flex items-center text-white text-lg shadow-md w-full overflow-hidden rounded-full mt-4";

  const leftBg = document.createElement("div");
  leftBg.className = "absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500 ";
  const rightBg = document.createElement("div");
  rightBg.className = "absolute inset-y-0 right-0 bg-red-600 transition-all duration-500 ";

  leftBg.style.width = "50%";
  rightBg.style.width = "50%";

  container.appendChild(leftBg);
  container.appendChild(rightBg);

  const content = document.createElement("div");
  content.className = "rounded-full relative z-10 flex justify-between items-center w-full";

  content.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${player1Pic}" alt="Player 1" class="w-12 h-12 rounded-full">
      <p class="font-bold text-lg">Player 1</p>
    </div>

    <div class="flex gap-20">
      <p id="player1-score" class="text-4xl font-semibold">0</p>
      <p id="player2-score" class="text-4xl font-semibold">0</p>
    </div>

    <div class="flex items-center gap-4">
      <p class="font-bold text-lg">Player 2</p>
      <img src="${player2Pic}" alt="Player 2" class="w-12 h-12 rounded-full">
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
