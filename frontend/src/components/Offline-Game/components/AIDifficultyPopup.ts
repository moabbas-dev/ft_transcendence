import { createComponent } from "../../../utils/StateManager.js";
import { AIDifficulty } from "../../../types/types.js";

interface DifficultyPopupProps {
	onSelect: (difficulty: AIDifficulty) => void;
}

export const DifficultyPopup = createComponent((props: DifficultyPopupProps) => {
    const container = document.createElement("div");
    container.className = `
    fixed inset-0 z-[10000]
    flex items-center justify-center
    bg-black/70
    animate-fadeIn
  `;

  container.innerHTML = `
  <div class="bg-black p-8 rounded-lg shadow-lg border-2 border-purple-500 w-3/5 max-w-lg">
	<h2 class="text-3xl font-bold mb-6 text-center text-purple-400" style="text-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7;">CHOOSE DIFFICULTY</h2>
	<div class="flex flex-col gap-6">
	  <button id="difficulty-easy" class="px-6 py-3 bg-black text-green-400 rounded font-bold text-lg border
		border-green-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-100 shadow-[0_0_10px_#4ade80]">EASY</button>
	  <button id="difficulty-medium" class="px-6 py-3 bg-black text-yellow-400 rounded font-bold text-lg border
		border-yellow-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-200 shadow-[0_0_10px_#facc15]">MEDIUM</button>
	  <button id="difficulty-hard" class="px-6 py-3 bg-black text-red-400 rounded font-bold text-lg border
		border-red-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-300 shadow-[0_0_10px_#f87171]">HARD</button>
	</div>
  </div>
  `;

	const selectDifficulty = (difficulty: AIDifficulty) => {
		// Add exit animation
		const popupContent = container.querySelector("div");
		if (popupContent) {
		popupContent.className = "animate-fadeOut";
		}

		// Delay removal to allow animation to complete
		setTimeout(() => {
		props.onSelect(difficulty);
		container.remove(); // Remove popup after selection
		}, 50);
	};

	container
		.querySelector("#difficulty-easy")!
		.addEventListener("click", () => selectDifficulty("easy"));
	container
		.querySelector("#difficulty-medium")!
		.addEventListener("click", () => selectDifficulty("medium"));
	container
		.querySelector("#difficulty-hard")!
		.addEventListener("click", () => selectDifficulty("hard"));
	return container;
})