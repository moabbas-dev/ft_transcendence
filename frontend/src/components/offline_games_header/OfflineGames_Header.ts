import { createComponent } from "../../utils/StateManager.js";
import playerPic from "/src/assets/afarachi.jpg";
import player2Pic from "/src/assets/moabbas.jpg";
import {
  createDivider,
  createParticles,
  updateBackgrounds,
  initBackgrounds,
} from "./HeaderAnimations_utils.js";

// Explicitly import all AI images
import aiPic1 from "/src/assets/ai/pic1.jpg";
import aiPic2 from "/src/assets/ai/pic2.jpg";
import aiPic3 from "/src/assets/ai/pic3.jpg";
import aiPic4 from "/src/assets/ai/pic4.jpg";
import aiPic5 from "/src/assets/ai/pic5.jpg";
import { t } from "../../languages/LanguageController.js";

interface GameHraderProps {
  gameMode: string;
  keyScores: string;
}

// Store AI images in an array
const aiImages = [aiPic1, aiPic2, aiPic3, aiPic4, aiPic5];

// Function to select a random AI image
const getRandomAIImage = () =>
  aiImages[Math.floor(Math.random() * aiImages.length)];

export const PlayerHeader = createComponent((props: GameHraderProps) => {
  const aiPic = getRandomAIImage();
  const container = document.createElement("div");
  container.className = `
    relative flex items-center text-white text-lg shadow-lg overflow-hidden rounded-lg md:rounded-2xl
    border border-yellow-500 md:border-2
  `;

  // Create and add particles
  const particleContainer = createParticles();
  container.appendChild(particleContainer);

  const dividerContainer = createDivider();
  container.appendChild(dividerContainer);

  // Main content container
  const content = document.createElement("div");
  content.className =
    "rounded-lg md:rounded-2xl relative z-30 grid grid-cols-3 items-center w-full px-2 sm:px-4 md:px-8";

  // Create HTML structure
  content.innerHTML = `
    <!-- Player 1 Info -->
    <div class="flex items-center gap-1 sm:gap-2 md:gap-4 justify-self-start">
      <div id="player-avatar-container">
        <img src="${playerPic}" alt="Player 1" class="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border border-blue-300 md:border-2">
      </div>
      <div>
        <p class="font-bold text-sm sm:text-base md:text-xl text-blue-200">${props.gameMode === "ai" ? t("play.player") : `${t("play.player")} 1`}</p>
        <div class="flex items-center">
          <p id="player-score1" class="text-lg sm:text-xl md:text-2xl font-bold relative">
            <span class="relative z-10 text-white">0</span>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Center Title with Animated Effect - Now in the center column of the grid -->
    <div class="flex flex-col items-center justify-self-center">
      <div class="relative text-base sm:text-xl md:text-3xl font-extrabold uppercase tracking-wider">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 opacity-30 blur-md rounded-lg"></div>
        <div class="relative text-center">
          <span class="font-mono text-yellow-300">Pong</span>
          <span class="hidden sm:inline pl-1">Game</span>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 animate-shimmer" 
            style="background-size: 200% 100%;"></div>
      </div>
      <div class="mt-1 hidden sm:block">
        <i class="fa-solid fa-table-tennis-paddle-ball text-yellow-300 animate-float"></i>
      </div>
    </div>
    
    <!-- Player 2 Info -->
    <div class="flex items-center gap-1 sm:gap-2 md:gap-4 justify-self-end">
      <div class="text-right">
        <p class="font-bold text-sm sm:text-base md:text-xl text-red-200">${props.gameMode === "ai" ? t("play.ai") : `${t("play.player")} 2`}</p>
        <div class="flex items-center justify-end">
          <p id="player-score2" class="text-lg sm:text-xl md:text-2xl font-bold relative">
            <span class="relative z-10 text-white">0</span>
          </p>
        </div>
      </div>
      <div id="ai-avatar-container">
        <img src="${
          props.gameMode === "ai" ? aiPic : player2Pic
        }" alt="Player 2" class="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border border-red-300 md:border-2">
      </div>
    </div>
  `;

  // Append the player frame to the avatar container after content is added to DOM
  container.appendChild(content);
  initBackgrounds(container);

  if (props.keyScores === "aiPongScores") {
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
  } else if (props.keyScores === "pongScores") {
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
  }

  return container;
});
