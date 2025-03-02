import { createComponent } from "../../utils/StateManager.js";

interface AIDifficultyPopupProps {
  onSelect: (difficulty: string) => void;
}

export const AIDifficultyPopup = createComponent((props: AIDifficultyPopupProps) => {
  const container = document.createElement("div");
  container.className = `
    fixed inset-0 z-[10000]
    flex items-center justify-center
    bg-black/70
    animate-fadeIn
  `;

  // Add the fadeIn animation to the container
  container.style.animation = "fadeIn 0.5s ease-out";

  container.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 5px 2px currentColor; }
        50% { box-shadow: 0 0 15px 5px currentColor; }
        100% { box-shadow: 0 0 5px 2px currentColor; }
      }
      
      @keyframes floatIn {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .neon-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        animation: pulseGlow 2s infinite;
      }
      
      .neon-btn:hover {
        transform: scale(1.05);
      }
      
      .neon-btn::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
        transform: rotate(45deg);
        transition: all 0.3s ease;
      }
      
      .neon-btn:hover::after {
        left: 100%;
      }
      
      .float-in {
        animation: floatIn 0.5s ease-out forwards;
        opacity: 0;
      }
      
      .float-in:nth-child(1) { animation-delay: 0.1s; }
      .float-in:nth-child(2) { animation-delay: 0.2s; }
      .float-in:nth-child(3) { animation-delay: 0.3s; }
    </style>
    <div class="bg-black p-8 rounded-lg shadow-lg border-2 border-purple-500 w-3/5 max-w-lg">
      <h2 class="text-3xl font-bold mb-6 text-center text-purple-400" style="text-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7;">CHOOSE DIFFICULTY</h2>
      <div class="flex flex-col gap-6">
        <button id="difficulty-easy" class="px-6 py-3 bg-black text-green-400 rounded font-bold text-lg border border-green-400 neon-btn float-in" style="color: #4ade80; box-shadow: 0 0 10px #4ade80;">EASY</button>
        <button id="difficulty-medium" class="px-6 py-3 bg-black text-yellow-400 rounded font-bold text-lg border border-yellow-400 neon-btn float-in" style="color: #facc15; box-shadow: 0 0 10px #facc15;">MEDIUM</button>
        <button id="difficulty-hard" class="px-6 py-3 bg-black text-red-400 rounded font-bold text-lg border border-red-400 neon-btn float-in" style="color: #f87171; box-shadow: 0 0 10px #f87171;">HARD</button>
      </div>
    </div>
  `;

  const selectDifficulty = (difficulty: string) => {
    // Add exit animation
    const popupContent = container.querySelector("div");
    if (popupContent) {
      popupContent.style.animation = "fadeOut 0.3s ease-out forwards";
    }
    
    // Delay removal to allow animation to complete
    setTimeout(() => {
      props.onSelect(difficulty);
      container.remove(); // Remove popup after selection
    }, 300);
  };

  container.querySelector("#difficulty-easy")!.addEventListener("click", () => selectDifficulty("easy"));
  container.querySelector("#difficulty-medium")!.addEventListener("click", () => selectDifficulty("medium"));
  container.querySelector("#difficulty-hard")!.addEventListener("click", () => selectDifficulty("hard"));

  const scores = {player: 0, ai: 0};
  // Function to update and save scores
  const saveScores = () => {
    localStorage.setItem("aiPongScores", JSON.stringify(scores));
  };

  saveScores();

  // localStorage.removeItem("aiPongScores");

  return container;
});