import { createComponent } from "../../utils/StateManager.js";

interface ScoreManagerProps {
  initialScores?: { player: number; ai: number };
  winningScore?: number;
  onScoreUpdate?: (scores: { player: number; ai: number }) => void;
  onGameOver?: (winner: "player" | "ai", scores: { player: number; ai: number }) => void;
}

export const ScoreManager = createComponent((props: ScoreManagerProps) => {
  // Set default props
  const winningScore = props.winningScore || 10;
  
  // Initialize scores
  const scores = {
    player: props.initialScores?.player || 0,
    ai: props.initialScores?.ai || 0
  };
  
  // Create container
  const container = document.createElement("div");
  container.style.display = "none";
  
  // Load scores from localStorage if available
  const loadScores = () => {
    const savedScores = localStorage.getItem("aiPongScores");
    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores);
        scores.player = parsedScores.player || 0;
        scores.ai = parsedScores.ai || 0;
        
        // Notify parent of loaded scores
        if (props.onScoreUpdate) {
          props.onScoreUpdate(scores);
        }
      } catch (e) {
        console.error("Error loading scores:", e);
      }
    }
  };
  
  // Save scores to localStorage
  const saveScores = () => {
    localStorage.setItem("aiPongScores", JSON.stringify(scores));
    
    // Dispatch custom event for UI updates
    const scoreEvent = new CustomEvent("aiScoreUpdate", {
      detail: { player: scores.player, ai: scores.ai },
    });
    document.dispatchEvent(scoreEvent);
  };
  
  // Update score for either player or AI
  const updateScore = (player: "player" | "ai") => {
    scores[player]++;
    
    // Notify parent of score update
    if (props.onScoreUpdate) {
      props.onScoreUpdate(scores);
    }
    
    // Save scores to localStorage
    saveScores();
    
    // Check for game over
    if (scores[player] >= winningScore) {
      if (props.onGameOver) {
        props.onGameOver(player, scores);
      }
      return true; // Game is over
    }
    
    return false; // Game continues
  };
  
  // Reset scores
  const resetScores = () => {
    scores.player = 0;
    scores.ai = 0;
    
    // Notify parent of score reset
    if (props.onScoreUpdate) {
      props.onScoreUpdate(scores);
    }
    
    // Save reset scores
    saveScores();
  };
  
  // Initialize by loading saved scores
  loadScores();
  
  // Expose methods to the parent component
  (container as any).getScores = () => ({ ...scores });
  (container as any).updateScore = updateScore;
  (container as any).resetScores = resetScores;
  (container as any).saveScores = saveScores;
  (container as any).loadScores = loadScores;
  
  return container;
});