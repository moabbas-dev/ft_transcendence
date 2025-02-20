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
    flex mt-6 justify-between items-center
    px-8 text-white text-lg
    bg-[var(--main-color)] shadow-md
  `;

  container.innerHTML = `
    <!-- Player 1 Info -->
    <div class="flex items-center gap-4">
      <img src="${playerPic}" alt="Player 1" class="w-12 h-12 rounded-full border border-white">
      <div>
        <p class="font-bold">Player 1</p>
        <p id="player-score" class="text-xl font-semibold">0</p>
      </div>
    </div>

    <!-- Game Title -->
    <div class="text-2xl font-bold uppercase tracking-wider">
      Pong Game 🏓
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

  return container;
});
