import { createComponent } from "../../utils/StateManager.js";

interface GameResultsProps {
  // Whether the popup should be visible
  isVisible: boolean;
  // The winning player (either "player" or "ai")
  winner: "player" | "ai" | null;
  // The final scores
  scores: { player: number; ai: number };
  // Callback for when the restart button is clicked
  onRestart: () => void;
}

export const GameResultsPopUp = createComponent((props: GameResultsProps) => {
  // Create popup container
  const popup = document.createElement("div");
  popup.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75";
  
  // Hide by default unless isVisible is true
  if (!props.isVisible) {
    popup.classList.add("hidden");
  }
  
  // Create popup content
  const popupContent = document.createElement("div");
  popupContent.className = "bg-black border-2 border-cyan-400 p-6 rounded-lg shadow-lg text-center";
  popup.appendChild(popupContent);
  
  // Winner text
  const winnerText = document.createElement("p");
  winnerText.className = "text-xl font-bold mb-4 text-cyan-400 text-shadow-neon";
  
  if (props.winner) {
    winnerText.textContent = `${props.winner === "player" ? "Player 1" : "AI"} Wins!`;
  }
  
  popupContent.appendChild(winnerText);
  
  // Score text
  const scoreText = document.createElement("p");
  scoreText.className = "mb-4 text-pink-500 text-shadow-neon";
  scoreText.textContent = `Final Score: ${props.scores.player} - ${props.scores.ai}`;
  popupContent.appendChild(scoreText);
  
  // Restart button
  const restartButton = document.createElement("button");
  restartButton.className = 
    "px-4 py-2 bg-purple-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-purple-900 hover:shadow-neon";
  restartButton.textContent = "Play Again";
  restartButton.style.boxShadow = "0 0 10px #0ff, 0 0 20px #0ff"; // Add neon glow to button
  
  // Add event listener for restart
  restartButton.addEventListener("click", () => {
    props.onRestart();
  });
  
  popupContent.appendChild(restartButton);
  
  // Method to show or hide the popup
  const setVisibility = (isVisible: boolean) => {
    if (isVisible) {
      popup.classList.remove("hidden");
    } else {
      popup.classList.add("hidden");
    }
  };
  
  // Method to update the winner and scores
  const updateResults = (winner: "player" | "ai", scores: { player: number; ai: number }) => {
    winnerText.textContent = `${winner === "player" ? "Player 1" : "AI"} Wins!`;
    scoreText.textContent = `Final Score: ${scores.player} - ${scores.ai}`;
  };
  
  // Expose methods to the parent component
  (popup as any).setVisibility = setVisibility;
  (popup as any).updateResults = updateResults;
  
  return popup;
});