import { createComponent } from "../../utils/StateManager.js";
import  playerPic  from "/src/assets/afarachi.jpg";

// Explicitly import all AI images
import aiPic1 from "/src/assets/ai/pic1.jpg";
import aiPic2 from "/src/assets/ai/pic2.jpg";
import aiPic3 from "/src/assets/ai/pic3.jpg";
import aiPic4 from "/src/assets/ai/pic4.jpg";
import aiPic5 from "/src/assets/ai/pic5.jpg";

// Store AI images in an array
const aiImages = [aiPic1, aiPic2, aiPic3, aiPic4, aiPic5];

// Function to select a random AI image
const getRandomAIImage = () => aiImages[Math.floor(Math.random() * aiImages.length)];


export const PlayerHeader = createComponent(() => {

  const aiPic = getRandomAIImage();

  const container = document.createElement("div");
  container.className = `
    relative flex items-center text-white text-lg shadow-md w-full overflow-hidden rounded-2xl mt-4
  `;


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
    <!-- Player 1 Info -->
    <div class="flex items-center gap-4">
      <img src="${playerPic}" alt="Player 1" class="w-12 h-12 rounded-full border border-white">
      <div>
        <p class="font-bold">Player 1</p>
        <p id="player-score" class="text-xl font-semibold">0</p>
      </div>
    </div>

    <div class="flex flex-row gap-1 text-2xl font-bold uppercase tracking-wider">
      <p><span class="font-mono text-yellow-400">Pong</span> Game<p> 
      <i class="fa-solid fa-table-tennis-paddle-ball"></i>
    </div>

    <!-- Player 2 Info -->
    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="font-bold">Player 2</p>
        <p id="ai-score" class="text-xl font-semibold">0</p>
      </div>
      <img src="${aiPic}" alt="Player 2" class="w-12 h-12 rounded-full border border-white">
    </div>
  `;
  container.appendChild(content);

  function updateBackgrounds(playerScore: number, aiScore: number) {
    const total = playerScore + aiScore;
    let leftWidth = 50;
    let rightWidth = 50;
    if (total > 0) {
      leftWidth = (playerScore / total) * 100;
      rightWidth = 100 - leftWidth;
    }
    leftBg.style.transition = "width 0.5s ease-in-out";
    rightBg.style.transition = "width 0.5s ease-in-out";
    leftBg.style.width = `${leftWidth}%`;
    rightBg.style.width = `${rightWidth}%`;
  }

    // Load scores from Local Storage
    const savedScores = localStorage.getItem("aiPongScores");
    if (savedScores) {
      const { player, ai } = JSON.parse(savedScores);
      updateBackgrounds(player, ai);
    }

  document.addEventListener("aiScoreUpdate", (e: Event) => {
    const event = e as CustomEvent<{ player: number; ai: number }>;
    updateBackgrounds(event.detail.player, event.detail.ai);
  });

  return container;
});
