import { createComponent } from "../../utils/StateManager.js";

interface AIState {
  paddleY: number;
  paddleHeight: number;
  keys: {
    ArrowUp: boolean;
    ArrowDown: boolean;
  };
  memory: {
    ballX: number;
    ballY: number;
    ballSpeedX: number;
    ballSpeedY: number;
    timestamp: number;
  };
  lastDirectionChange: number;
  decisionConfidence: number;
}

interface AIControllerProps {
  difficulty: "easy" | "medium" | "hard";
  canvasWidth: number;
  canvasHeight: number;
  paddleHeight: number;
  paddleWidth: number;
  paddleOffset: number;
  onAIStateChange?: (aiState: AIState) => void;
}

export const AIController = createComponent((props: AIControllerProps) => {
  let aiUpdateIntervalId: number;
  
  // AI update frequency varies by difficulty
  const AI_UPDATE_INTERVALS = {
    easy: 1200,   // Slower updates for easy
    medium: 1000, // Standard update once per second
    hard: 800,    // Slightly faster updates for hard
  };
  
  // AI difficulty settings
  const difficultySpeeds = {
    easy: 4,    // Slow movement
    medium: 7,   // Moderate movement
    hard: 10,   // Fast movement
  };
  
  // AI reaction time delay (ms)
  const difficultyReactionDelay = {
    easy: 300,     // Slow reaction
    medium: 150,   // Moderate reaction
    hard: 50,      // Quick reaction
  };
  
  // AI precision
  const difficultyPrecision = {
    easy: 0.3,    // AI aims to hit ball with center 30% of paddle
    medium: 0.5,  // AI aims to hit ball with center 50% of paddle
    hard: 0.8,    // AI aims to hit ball with center 80% of paddle
  };
  
  // AI prediction error factors
  const difficultyPredictionError = {
    easy: 0.35,     // Large prediction error
    medium: 0.15,   // Moderate prediction error
    hard: 0.05,     // Small prediction error
  };
  
  // AI wrong decision chance
  const difficultyWrongDecisionChance = {
    easy: 0.25,     // 25% chance of making wrong decision
    medium: 0.1,    // 10% chance
    hard: 0.02,     // 2% chance
  };
  
  // AI state
  const aiState: AIState = {
    paddleY: props.canvasHeight / 2 - props.paddleHeight / 2,
    paddleHeight: props.paddleHeight,
    keys: {
      ArrowUp: false,
      ArrowDown: false
    },
    memory: {
      ballX: props.canvasWidth / 2,
      ballY: props.canvasHeight / 2,
      ballSpeedX: 0,
      ballSpeedY: 0,
      timestamp: 0
    },
    lastDirectionChange: 0,
    decisionConfidence: 1.0
  };
  
  // Create a hidden container for the AI controller
  const container = document.createElement("div");
  container.style.display = "none";
  
  // Function to predict where the ball will be when it reaches the AI's side
  const predictBallPosition = (ballX: number, ballY: number, ballSpeedX: number, ballSpeedY: number) => {
    // Only predict if the ball is moving toward the AI
    if (ballSpeedX <= 0) return { predictedY: ballY, confidence: 0.5 };
    
    // Calculate distance to AI paddle
    const paddleX = props.canvasWidth - (props.paddleOffset + props.paddleWidth);
    const distanceToTravel = paddleX - ballX;
    
    // Calculate how many time steps needed
    const timeSteps = distanceToTravel / ballSpeedX;
    
    // Predict final Y position with bounces
    let predictedY = ballY + (ballSpeedY * timeSteps);
    
    // Handle bounces off the top and bottom walls
    const canvasHeight = props.canvasHeight;
    // Calculate bounces with modulo arithmetic
    const bounceCount = Math.floor(Math.abs(predictedY) / canvasHeight);
    const remainder = Math.abs(predictedY) % canvasHeight;
    
    if (bounceCount % 2 === 0) {
      // Even number of bounces
      predictedY = ballSpeedY > 0 ? remainder : canvasHeight - remainder;
    } else {
      // Odd number of bounces
      predictedY = ballSpeedY > 0 ? canvasHeight - remainder : remainder;
    }
    
    // Calculate confidence based on distance and bounces
    let confidence = 1.0 - (distanceToTravel / props.canvasWidth) * 0.3 - (bounceCount * 0.2);
    confidence = Math.max(0.2, confidence);
    
    // Add intentional error based on difficulty
    const errorFactor = difficultyPredictionError[props.difficulty];
    const maxError = errorFactor * canvasHeight * (1 + bounceCount * 0.5);
    const errorAmount = (Math.random() * maxError * 2) - maxError;
    
    // On easy difficulty, error increases more with distance
    if (props.difficulty === 'easy') {
      predictedY += errorAmount * (1 + (distanceToTravel / props.canvasWidth));
    } else {
      predictedY += errorAmount;
    }
    
    // Keep within bounds
    predictedY = Math.max(0, Math.min(predictedY, canvasHeight));
    
    return { predictedY, confidence: 1.0 };
  };
  
  // AI update function
  const updateAIDecision = (ballX: number, ballY: number, ballSpeedX: number, ballSpeedY: number) => {
    // Store current ball state in AI memory
    aiState.memory = {
      ballX,
      ballY,
      ballSpeedX,
      ballSpeedY,
      timestamp: Date.now()
    };
    
    // Reset AI keys (simulating key release)
    aiState.keys.ArrowUp = false;
    aiState.keys.ArrowDown = false;
    
    // Always maintain full decision confidence
    aiState.decisionConfidence = 1.0;
    
    // Make AI decisions based on ball trajectory prediction
    const { predictedY } = predictBallPosition(ballX, ballY, ballSpeedX, ballSpeedY);
    
    const aiPaddleCenter = aiState.paddleY + aiState.paddleHeight / 2;
    
    // AI occasionally makes wrong decisions based on difficulty
    const wrongDecisionChance = difficultyWrongDecisionChance[props.difficulty];
    const makeWrongDecision = Math.random() < wrongDecisionChance;
    
    if (makeWrongDecision) {
      // Move in the opposite direction of where the ball is going
      if (aiPaddleCenter < props.canvasHeight / 2) {
        aiState.keys.ArrowDown = true;
      } else {
        aiState.keys.ArrowUp = true;
      }
    } else {
      // Add reaction delay based on difficulty
      setTimeout(() => {
        // Decide which key to press based on the predicted position
        const buffer = props.difficulty === 'hard' ? 5 : (props.difficulty === 'medium' ? 15 : 30);
        
        if (aiPaddleCenter > predictedY + buffer) {
          aiState.keys.ArrowUp = true;
        } else if (aiPaddleCenter < predictedY - buffer) {
          aiState.keys.ArrowDown = true;
        }
        
        // Notify the parent of state changes
        if (props.onAIStateChange) {
          props.onAIStateChange(aiState);
        }
      }, difficultyReactionDelay[props.difficulty]);
    }
  };
  
  // Start AI updates
  const startAIUpdates = () => {
    // Clear existing interval if any
    if (aiUpdateIntervalId) {
      clearInterval(aiUpdateIntervalId);
    }
    
    // Set new interval based on difficulty
    const updateInterval = AI_UPDATE_INTERVALS[props.difficulty];
    aiUpdateIntervalId = window.setInterval(() => {
      if (props.onAIStateChange) {
        props.onAIStateChange(aiState);
      }
    }, updateInterval);
  };
  
  // Stop AI updates
  const stopAIUpdates = () => {
    if (aiUpdateIntervalId) {
      clearInterval(aiUpdateIntervalId);
    }
  };
  
  // Update AI paddle position based on its decisions
  const updateAIPosition = (canvasHeight: number) => {
    const aiSpeed = difficultySpeeds[props.difficulty];
    
    if (aiState.keys.ArrowUp && aiState.paddleY > 0) {
      aiState.paddleY -= aiSpeed;
    }
    
    if (aiState.keys.ArrowDown && aiState.paddleY < canvasHeight - aiState.paddleHeight) {
      aiState.paddleY += aiSpeed;
    }
    
    // Notify parent of state change
    if (props.onAIStateChange) {
      props.onAIStateChange(aiState);
    }
  };
  
  // Expose methods to the parent component
  (container as any).updateAIDecision = updateAIDecision;
  (container as any).startAIUpdates = startAIUpdates;
  (container as any).stopAIUpdates = stopAIUpdates;
  (container as any).updateAIPosition = updateAIPosition;
  (container as any).getAIState = () => ({ ...aiState });
  (container as any).setAIPosition = (y: number) => {
    aiState.paddleY = y;
    if (props.onAIStateChange) {
      props.onAIStateChange(aiState);
    }
  };
  
  // Cleanup function
  const cleanup = () => {
    stopAIUpdates();
  };
  
  (container as any).destroy = cleanup;
  
  return container;
});