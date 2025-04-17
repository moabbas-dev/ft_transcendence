import { t } from "../languages/LanguageController.js";
import { createComponent } from "../utils/StateManager.js";
import  player1Pic  from "/src/assets/afarachi.jpg";
import  player2Pic  from "/src/assets/moabbas.jpg";
 
export const PlayerHeader = createComponent(() => {
  const container = document.createElement("div");
  container.className = `
    flex mt-6 justify-between items-center
     px-8 text-white text-lg
    bg-pongcyan shadow-md
  `;

  container.innerHTML = `
    <!-- Player 1 Info -->
    <div class="flex items-center gap-4">
      <img src="${player1Pic}" alt="Player 1" class="w-12 h-12 rounded-full border border-white">
      <div>
        <p class="font-bold">${t('play.player')} 1</p>
        <p id="player1-score" class="text-xl font-semibold">0</p>
      </div>
    </div>

    <!-- Game Title -->
    <div class="text-2xl font-bold uppercase tracking-wider">
      Pong ${t('play.game')} 🏓
    </div>

    <!-- Player 2 Info -->
    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="font-bold">${t('play.player')} 2</p>
        <p id="player2-score" class="text-xl font-semibold">0</p>
      </div>
      <img src="${player2Pic}" alt="Player 2" class="w-12 h-12 rounded-full border border-white">
    </div>
  `;

  return container;
});
