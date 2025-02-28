import { createComponent } from "../../utils/StateManager.js";

interface AIDifficultyPopupProps {
  onSelect: (difficulty: string) => void;
}

export const AIDifficultyPopup = createComponent((props: AIDifficultyPopupProps) => {
  const container = document.createElement("div");
  container.className = `
    fixed inset-0 z-[10000]
    flex items-center justify-center
    bg-black/50
  `;

  container.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-center">Choose Difficulty</h2>
      <div class="flex flex-col gap-4">
        <button id="difficulty-easy" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Easy</button>
        <button id="difficulty-medium" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Medium</button>
        <button id="difficulty-hard" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Hard</button>
      </div>
    </div>
  `;

  const selectDifficulty = (difficulty: string) => {
    props.onSelect(difficulty);
    container.remove(); // Remove popup after selection
  };

  container.querySelector("#difficulty-easy")!.addEventListener("click", () => selectDifficulty("easy"));
  container.querySelector("#difficulty-medium")!.addEventListener("click", () => selectDifficulty("medium"));
  container.querySelector("#difficulty-hard")!.addEventListener("click", () => selectDifficulty("hard"));

  return container;
});
