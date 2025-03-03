// import { createComponent } from "../../utils/StateManager.js";

// export const AIPongGame = createComponent((difficulty: string) => {
//   let animationFrameId: number;
//   let countdownIntervalId: number; // store interval id for countdown
//   let aiUpdateIntervalId: number; // store interval id for AI updates
//   const COUNTDOWN_DURATION = 5;

//   // Initial ball speed constants - used to reset to consistent values
//   const INITIAL_BALL_SPEED_X = 8;
//   const INITIAL_BALL_SPEED_Y = 5;

//   // AI update frequency varies by difficulty
//   const AI_UPDATE_INTERVALS = {
//     easy: 1200, // Slower updates for easy
//     medium: 1000, // Standard update once per second
//     hard: 800, // Slightly faster updates for hard (still meets the "once per second" requirement),
//   };

//   const state = {
//     paddleHeight: 120, // Increased paddle height for larger table
//     paddleWidth: 20,
//     ballSize: 12, // Slightly larger ball for better visibility
//     playerY: 250,
//     AiY: 250,
//     ballX: 400,
//     ballY: 300,
//     ballSpeedX: INITIAL_BALL_SPEED_X,
//     ballSpeedY: INITIAL_BALL_SPEED_Y,
//     paddleOffset: 30, // Increased offset from edges
//     scores: { player: 0, ai: 0 },
//     keys: {} as { [key: string]: boolean },
//     gameEnded: false,
//     gameStarted: false,
//     countdown: COUNTDOWN_DURATION,
//     // AI state variables for simulated keypress
//     aiKeys: {
//       ArrowUp: false,
//       ArrowDown: false
//     },
//     // AI memory of the last known ball position (for prediction)
//     aiMemory: {
//       ballX: 400,
//       ballY: 300,
//       ballSpeedX: INITIAL_BALL_SPEED_X,
//       ballSpeedY: INITIAL_BALL_SPEED_Y,
//       timestamp: 0
//     },
//     // Track when AI last changed direction (for human-like behavior)
//     aiLastDirectionChange: 0,
//     // AI decision confidence (for difficulty-based randomness)
//     aiDecisionConfidence: 1.0
//   };
  
//   // Function to update and save scores
//   const saveScores = () => {
//     localStorage.setItem("aiPongScores", JSON.stringify(state.scores));
//   };
//   saveScores();

//   // Create game container
//   const container = document.createElement("div");
//   container.className = "game-container flex items-center justify-center";
//   // Make container take up more screen space
//   container.style.width = "95vw";
//   container.style.height = "90vh";

//   // Create countdown overlay
//   const countdownOverlay = document.createElement("div");
//   countdownOverlay.className = `
//     fixed flex items-center justify-center bg-opacity-75 text-9xl font-bold text-cyan-400
//     text-shadow-neon
//   `;
//   countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
//   // Add neon text shadow style
//   const style = document.createElement('style');
//   style.textContent = `
//     .text-shadow-neon {
//       text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff;
//     }
//   `;
//   document.head.appendChild(style);
//   container.appendChild(countdownOverlay);

//   // Dispatch event to update UI and save scores
//   const dispatchScoreUpdate = () => {
//     saveScores();
//     const scoreEvent = new CustomEvent("aiScoreUpdate", {
//       detail: { player: state.scores.player, ai: state.scores.ai },
//     });
//     document.dispatchEvent(scoreEvent);
//   };

//   // Create canvas
//   const canvas = document.createElement("canvas");
//   canvas.className = "rounded-lg shadow-xl";
//   // Set canvas to take up more space - 90% of the container
//   canvas.style.width = "90%";
//   canvas.style.height = "90%";
//   container.appendChild(canvas);
//   const ctx = canvas.getContext("2d")!;

//   // Create popup for game over
//   const popup = document.createElement("div");
//   popup.className =
//     "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 hidden";
//   const popupContent = document.createElement("div");
//   popupContent.className = "bg-black border-2 border-cyan-400 p-6 rounded-lg shadow-lg text-center";
//   popup.appendChild(popupContent);
//   const winnerText = document.createElement("p");
//   winnerText.className = "text-xl font-bold mb-4 text-cyan-400 text-shadow-neon";
//   popupContent.appendChild(winnerText);
//   const scoreText = document.createElement("p");
//   scoreText.className = "mb-4 text-pink-500 text-shadow-neon";
//   popupContent.appendChild(scoreText);
//   const restartButton = document.createElement("button");
//   restartButton.className =
//     "px-4 py-2 bg-purple-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-purple-900 hover:shadow-neon";
//   restartButton.textContent = "Play Again";
//   restartButton.style.boxShadow = "0 0 10px #0ff, 0 0 20px #0ff"; // Add neon glow to button
//   restartButton.addEventListener("click", () => {
//     state.scores = { player: 0, ai: 0 };
//     state.gameEnded = false;
//     popup.classList.add("hidden");
//     // Reset ball with consistent initial speed
//     resetBall(true);
//     startAIUpdateInterval();
//     gameLoop();
//     saveScores();
//   });
//   popupContent.appendChild(restartButton);
//   container.appendChild(popup);

//   // Adjust canvas size dynamically
//   const setCanvasSize = () => {
//     // Make canvas larger by using 90% of window dimensions
//     canvas.width = window.innerWidth * 0.9;
//     canvas.height = window.innerHeight * 0.9;
    
//     // If game already started, reset ball position to center of new canvas size
//     if (state.gameStarted) {
//       state.ballX = canvas.width / 2;
//       state.ballY = canvas.height / 2;
//     }
//   };

//   // AI difficulty settings - significantly different based on level
//   const difficultySpeeds = {
//     easy: 4,    // Slow movement
//     medium: 7,   // Moderate movement
//     hard: 10,   // Fast movement
//   };
  
//   // AI reaction time delay (ms) - adds human-like delay
//   const difficultyReactionDelay = {
//     easy: 300,     // Slow reaction
//     medium: 150,   // Moderate reaction
//     hard: 50,      // Quick reaction
//   };
  
//   // AI precision - how much of the paddle must cover the ball
//   const difficultyPrecision = {
//     easy: 0.3,    // AI aims to hit ball with center 30% of paddle
//     medium: 0.5,  // AI aims to hit ball with center 50% of paddle
//     hard: 0.8,    // AI aims to hit ball with center 80% of paddle
//   };

//   // AI prediction error factors
//   const difficultyPredictionError = {
//     easy: 0.35,     // Large prediction error (35% of canvas height)
//     medium: 0.15,   // Moderate prediction error
//     hard: 0.05,     // Small prediction error
//   };
  
//   // AI occasionally makes wrong decisions based on difficulty
//   const difficultyWrongDecisionChance = {
//     easy: 0.25,     // 25% chance of making wrong decision
//     medium: 0.1,    // 10% chance
//     hard: 0.02,     // 2% chance
//   };
  
//   // Function to predict where the ball will be when it reaches the AI's side
//   const predictBallPosition = () => {
//     // Get the current state of the ball
//     let ballX = state.ballX;
//     let ballY = state.ballY;
//     let ballSpeedX = state.ballSpeedX;
//     let ballSpeedY = state.ballSpeedY;
    
//     // Only predict if the ball is moving toward the AI
//     if (ballSpeedX <= 0) return { predictedY: ballY, confidence: 0.5 };
    
//     // Calculate distance to AI paddle
//     const paddleX = canvas.width - (state.paddleOffset + state.paddleWidth);
//     const distanceToTravel = paddleX - ballX;
    
//     // Calculate how many time steps needed
//     const timeSteps = distanceToTravel / ballSpeedX;
    
//     // Predict final Y position with bounces
//     let predictedY = ballY + (ballSpeedY * timeSteps);
    
//     // Handle bounces off the top and bottom walls
//     const canvasHeight = canvas.height;
//     // Calculate bounces with modulo arithmetic
//     const bounceCount = Math.floor(Math.abs(predictedY) / canvasHeight);
//     const remainder = Math.abs(predictedY) % canvasHeight;
    
//     if (bounceCount % 2 === 0) {
//       // Even number of bounces
//       predictedY = ballSpeedY > 0 ? remainder : canvasHeight - remainder;
//     } else {
//       // Odd number of bounces
//       predictedY = ballSpeedY > 0 ? canvasHeight - remainder : remainder;
//     }
    
//     // Calculate confidence based on distance and bounces
//     // Lower confidence for distant predictions and multiple bounces
//     let confidence = 1.0 - (distanceToTravel / canvas.width) * 0.3 - (bounceCount * 0.2);
//     confidence = Math.max(0.2, confidence);
    
//     // Add intentional error based on difficulty - more error on easy, less on hard
//     const errorFactor = difficultyPredictionError[difficulty as keyof typeof difficultyPredictionError];
//     const maxError = errorFactor * canvasHeight * (1 + bounceCount * 0.5);
//     const errorAmount = (Math.random() * maxError * 2) - maxError;
    
//     // On easy difficulty, error increases more with distance
//     if (difficulty === 'easy') {
//       predictedY += errorAmount * (1 + (distanceToTravel / canvas.width));
//     } else {
//       predictedY += errorAmount;
//     }
    
//     // Keep within bounds
//     predictedY = Math.max(0, Math.min(predictedY, canvasHeight));
    
//     return { predictedY, confidence: 1.0 }; // Always return full confidence to prevent AI from slowing down
//   };

//   // AI update function - called at different intervals based on difficulty
//   const updateAIDecision = () => {
//     if (!state.gameStarted || state.gameEnded) return;
    
//     // Store current ball state in AI memory
//     state.aiMemory = {
//       ballX: state.ballX,
//       ballY: state.ballY,
//       ballSpeedX: state.ballSpeedX,
//       ballSpeedY: state.ballSpeedY,
//       timestamp: Date.now()
//     };
    
//     // Reset AI keys (simulating key release)
//     state.aiKeys.ArrowUp = false;
//     state.aiKeys.ArrowDown = false;
    
//     // Always maintain full decision confidence - AI never gives up
//     state.aiDecisionConfidence = 1.0;
    
//     // Make AI decisions based on ball trajectory prediction
//     const { predictedY } = predictBallPosition();
    
//     const aiPaddleCenter = state.AiY + state.paddleHeight / 2;
    
//     // AI occasionally makes wrong decisions based on difficulty - but never gives up
//     const wrongDecisionChance = difficultyWrongDecisionChance[difficulty as keyof typeof difficultyWrongDecisionChance];
//     const makeWrongDecision = Math.random() < wrongDecisionChance;
    
//     if (makeWrongDecision) {
//       // Move in the opposite direction of where the ball is going
//       if (aiPaddleCenter < canvas.height / 2) {
//         state.aiKeys.ArrowDown = true;
//       } else {
//         state.aiKeys.ArrowUp = true;
//       }
//       return;
//     }
    
//     // Calculate target based on precision setting - higher difficulties aim more precisely
//     const precision = difficultyPrecision[difficulty as keyof typeof difficultyPrecision];
//     const targetPaddleRange = state.paddleHeight * precision;
//     const targetOffset = (state.paddleHeight - targetPaddleRange) / 2;
    
//     // Target position (where the AI wants to be)
//     const targetY = predictedY - (targetPaddleRange / 2) - targetOffset;
    
//     // Add reaction delay based on difficulty
//     setTimeout(() => {
//       // Decide which key to press based on the predicted position
//       const buffer = difficulty === 'hard' ? 5 : (difficulty === 'medium' ? 15 : 30);
      
//       if (aiPaddleCenter > predictedY + buffer) {
//         state.aiKeys.ArrowUp = true;
//       } else if (aiPaddleCenter < predictedY - buffer) {
//         state.aiKeys.ArrowDown = true;
//       }
//     }, difficultyReactionDelay[difficulty as keyof typeof difficultyReactionDelay]);
//   };

//   // Function to start the AI update interval
//   const startAIUpdateInterval = () => {
//     if (aiUpdateIntervalId) clearInterval(aiUpdateIntervalId);
//     const updateInterval = AI_UPDATE_INTERVALS[difficulty as keyof typeof AI_UPDATE_INTERVALS];
//     aiUpdateIntervalId = window.setInterval(updateAIDecision, updateInterval);
//   };

//   // Handle key press for Player 1
//   const handleKeyDown = (e: KeyboardEvent) => (state.keys[e.key] = true);
//   const handleKeyUp = (e: KeyboardEvent) => (state.keys[e.key] = false);

//   // Reset the ball after scoring
//   const resetBall = (forceReset = false) => {
//     state.ballX = canvas.width / 2;
//     state.ballY = canvas.height / 2;
    
//     // If it's a forced reset or starting a new game, use initial speeds
//     if (forceReset) {
//       state.ballSpeedX = INITIAL_BALL_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
//       state.ballSpeedY = (Math.random() * 6 - 3); // Random Y direction
//     } else {
//       // Normal score reset - just reverse X direction but maintain current speed
//       state.ballSpeedX *= -1;
      
//       // Make sure speed isn't too fast
//       if (Math.abs(state.ballSpeedX) > 15) {
//         state.ballSpeedX = (state.ballSpeedX > 0 ? 12 : -12);
//       }
      
//       state.ballSpeedY = Math.random() * 6 - 3; // Random Y direction
//     }
//   };

//   // Main game loop
//   const update = () => {
//     if (!state.gameStarted || state.gameEnded) return;

//     // Process human player input
//     if (state.keys["w"] && state.playerY > 0) state.playerY -= 7;
//     if (state.keys["s"] && state.playerY < canvas.height - state.paddleHeight)
//       state.playerY += 7;
//     if (state.keys["ArrowUp"] && state.playerY > 0) state.playerY -= 7;
//     if (state.keys["ArrowDown"] && state.playerY < canvas.height - state.paddleHeight)
//       state.playerY += 7;

//     // Process AI input (simulated keypress)
//     const aiSpeed = difficultySpeeds[difficulty as keyof typeof difficultySpeeds];
    
//     // AI always moves at full speed, never slows down due to confidence
//     const effectiveSpeed = aiSpeed;
    
//     if (state.aiKeys.ArrowUp && state.AiY > 0) 
//       state.AiY -= effectiveSpeed;
//     if (state.aiKeys.ArrowDown && state.AiY < canvas.height - state.paddleHeight) 
//       state.AiY += effectiveSpeed;

//     state.ballX += state.ballSpeedX;
//     state.ballY += state.ballSpeedY;

//     if (state.ballY <= 0 || state.ballY >= canvas.height)
//       state.ballSpeedY *= -1;

//     // Ball collision detection with paddles
//     const hitLeftPaddle =
//       state.ballX - state.ballSize <= state.paddleOffset + state.paddleWidth &&
//       state.ballX - state.ballSize > state.paddleOffset &&
//       state.ballY >= state.playerY &&
//       state.ballY <= state.playerY + state.paddleHeight;
    
//     const hitRightPaddle =
//       state.ballX + state.ballSize >= canvas.width - (state.paddleOffset + state.paddleWidth) &&
//       state.ballX + state.ballSize < canvas.width - state.paddleOffset &&
//       state.ballY >= state.AiY &&
//       state.ballY <= state.AiY + state.paddleHeight;
    
//     if (hitLeftPaddle || hitRightPaddle) {
//       // Ball direction changes
//       state.ballSpeedX *= -1;
      
//       // Add a slight angle change based on where the ball hits the paddle
//       if (hitLeftPaddle) {
//         const relativeIntersectY = (state.playerY + (state.paddleHeight / 2)) - state.ballY;
//         const normalizedRelativeIntersectY = relativeIntersectY / (state.paddleHeight / 2);
//         state.ballSpeedY = -normalizedRelativeIntersectY * 10;
//       } else {
//         const relativeIntersectY = (state.AiY + (state.paddleHeight / 2)) - state.ballY;
//         const normalizedRelativeIntersectY = relativeIntersectY / (state.paddleHeight / 2);
//         state.ballSpeedY = -normalizedRelativeIntersectY * 10;
        
//         // Increase ball speed slightly on hard difficulty when AI hits it
//         // But cap it to prevent it from getting too fast
//         if (difficulty === 'hard') {
//           state.ballSpeedX *= 1.05;
//           if (Math.abs(state.ballSpeedX) > 15) state.ballSpeedX = (state.ballSpeedX > 0 ? 15 : -15);
//         }
//       }
//     }

//     // Scoring conditions
//     if (state.ballX < 0) {
//       state.scores.ai++;
//       checkGameOver("ai");
//       resetBall();
//       dispatchScoreUpdate();
//     }
//     if (state.ballX > canvas.width) {
//       state.scores.player++;
//       checkGameOver("player");
//       resetBall();
//       dispatchScoreUpdate();
//     }
//   };

//   const checkGameOver = (winner: "player" | "ai") => {
//     if (state.scores[winner] >= 10) {
//       state.gameEnded = true;
//       winnerText.textContent = `${winner === "player" ? "Player 1" : "Player 2"} Wins!`;
//       scoreText.textContent = `Final Score: ${state.scores.player} - ${state.scores.ai}`;
//       popup.classList.remove("hidden");
//       cancelAnimationFrame(animationFrameId);
//       clearInterval(aiUpdateIntervalId);
//     }
//   };

//   const draw = () => {
//     // Clear canvas with dark background
//     ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
    
//     // Draw grid lines for neon effect
//     ctx.strokeStyle = "rgba(0, 100, 100, 0.1)";
//     ctx.lineWidth = 1;
    
//     // Draw horizontal grid lines - spaced further apart for larger table
//     for (let y = 0; y < canvas.height; y += 30) {
//       ctx.beginPath();
//       ctx.moveTo(0, y);
//       ctx.lineTo(canvas.width, y);
//       ctx.stroke();
//     }
    
//     // Draw vertical grid lines - spaced further apart for larger table
//     for (let x = 0; x < canvas.width; x += 30) {
//       ctx.beginPath();
//       ctx.moveTo(x, 0);
//       ctx.lineTo(x, canvas.height);
//       ctx.stroke();
//     }
    
//     // Draw center line with neon effect
//     ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
//     ctx.lineWidth = 6; // Thicker line for larger table
//     ctx.setLineDash([15, 15]); // Larger dashes for larger table
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2, canvas.height);
//     ctx.stroke();
//     ctx.setLineDash([]);
    
//     // Draw paddles with neon glow
//     ctx.fillStyle = "#00ffff"; // Cyan color
    
//     // Add shadow for glow effect
//     ctx.shadowBlur = 20; // Increased glow for better visibility
//     ctx.shadowColor = "#00ffff";
    
//     // Left paddle (player)
//     ctx.fillRect(state.paddleOffset, state.playerY, state.paddleWidth, state.paddleHeight);
    
//     // Right paddle (AI) - different color for contrast
//     ctx.shadowColor = "#ff00ff"; // Pink shadow
//     ctx.fillStyle = "#ff00ff"; // Pink color
//     ctx.fillRect(canvas.width - (state.paddleOffset + state.paddleWidth), state.AiY, state.paddleWidth, state.paddleHeight);
    
//     // Ball with neon glow
//     ctx.shadowColor = "#ffffff";
//     ctx.shadowBlur = 25; // Increased glow
//     ctx.fillStyle = "#ffffff";
//     ctx.beginPath();
//     ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
//     ctx.fill();
    
//     // Draw ball trail
//     ctx.shadowBlur = 15;
//     ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
//     for (let i = 1; i <= 5; i++) { // Extended trail
//       ctx.beginPath();
//       ctx.arc(
//         state.ballX - (state.ballSpeedX * i * 0.5), 
//         state.ballY - (state.ballSpeedY * i * 0.5), 
//         state.ballSize - (i * 1.5), 
//         0, 
//         Math.PI * 2
//       );
//       ctx.fill();
//     }
    
//     // Reset shadow for other elements
//     ctx.shadowBlur = 0;

//     const playerScore = document.getElementById("player-score");
//     const aiScore = document.getElementById("ai-score");
//     if (playerScore && aiScore) {
//       playerScore.textContent = state.scores.player.toString();
//       aiScore.textContent = state.scores.ai.toString();
//     }
//   };

//   // Game loop
//   const gameLoop = () => {
//     update();
//     draw();
//     animationFrameId = requestAnimationFrame(gameLoop);
//   };

//   // Countdown logic
//   const startCountdown = () => {
//     countdownOverlay.classList.remove("hidden");
//     let counter = COUNTDOWN_DURATION;
//     countdownOverlay.textContent = counter.toString();
//     countdownIntervalId = window.setInterval(() => {
//       counter--;
//       countdownOverlay.textContent = counter.toString();
//       if (counter === 0) {
//         clearInterval(countdownIntervalId);
//         countdownOverlay.classList.add("hidden");
//         state.gameStarted = true;
//         startAIUpdateInterval();
//         gameLoop();
//       }
//     }, 1000);
//   };

//   // Initialize the game
//   setCanvasSize();
//   // Position paddles at appropriate heights for the new canvas size
//   state.playerY = (canvas.height - state.paddleHeight) / 2;
//   state.AiY = (canvas.height - state.paddleHeight) / 2;
//   // Initialize ball in center
//   state.ballX = canvas.width / 2;
//   state.ballY = canvas.height / 2;
//   startCountdown();

//   // Event listeners
//   window.addEventListener("keydown", handleKeyDown);
//   window.addEventListener("keyup", handleKeyUp);
//   window.addEventListener("resize", setCanvasSize);

//   // --- Cleanup function ---
//   const cleanup = () => {
//     // Set flag to stop game updates
//     state.gameEnded = true;
//     // Cancel the animation frame
//     cancelAnimationFrame(animationFrameId);
//     // Remove event listeners
//     window.removeEventListener("keydown", handleKeyDown);
//     window.removeEventListener("keyup", handleKeyUp);
//     window.removeEventListener("resize", setCanvasSize);
//     // Clear countdown interval if active
//     if (countdownIntervalId) {
//       clearInterval(countdownIntervalId);
//     }
//     // Clear AI update interval
//     if (aiUpdateIntervalId) {
//       clearInterval(aiUpdateIntervalId);
//     }
//   };

//   // Expose cleanup so the parent can call it
//   (container as any).destroy = cleanup;

//   return container;
// });

//////////111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111

import { createComponent } from "../../utils/StateManager.js";

export const AIPongGame = createComponent((difficulty: string) => {
  let animationFrameId: number;
  let countdownIntervalId: number; // store interval id for countdown
  let aiUpdateIntervalId: number; // store interval id for AI updates
  const COUNTDOWN_DURATION = 5;

  // Initial ball speed constants - used to reset to consistent values
  const INITIAL_BALL_SPEED_X = 8;
  const INITIAL_BALL_SPEED_Y = 5;

  // AI update frequency varies by difficulty
  const AI_UPDATE_INTERVALS = {
    easy: 1200, // Slower updates for easy
    medium: 1000, // Standard update once per second
    hard: 800, // Slightly faster updates for hard (still meets the "once per second" requirement),
  };

  const state = {
    paddleHeight: 120, // Increased paddle height for larger table
    paddleWidth: 20,
    ballSize: 12, // Slightly larger ball for better visibility
    playerY: 250,
    AiY: 250,
    ballX: 400,
    ballY: 300,
    ballSpeedX: INITIAL_BALL_SPEED_X,
    ballSpeedY: INITIAL_BALL_SPEED_Y,
    paddleOffset: 30, // Increased offset from edges
    scores: { player: 0, ai: 0 },
    keys: {} as { [key: string]: boolean },
    gameEnded: false,
    gameStarted: false,
    countdown: COUNTDOWN_DURATION,
    // AI state variables for simulated keypress
    aiKeys: {
      ArrowUp: false,
      ArrowDown: false
    },
    // AI memory of the last known ball position (for prediction)
    aiMemory: {
      ballX: 400,
      ballY: 300,
      ballSpeedX: INITIAL_BALL_SPEED_X,
      ballSpeedY: INITIAL_BALL_SPEED_Y,
      timestamp: 0
    },
    // Track when AI last changed direction (for human-like behavior)
    aiLastDirectionChange: 0,
    // AI decision confidence (for difficulty-based randomness)
    aiDecisionConfidence: 1.0
  };
  
  // Function to update and save scores
  const saveScores = () => {
    localStorage.setItem("aiPongScores", JSON.stringify(state.scores));
  };
  saveScores();

  // Create game container
  const container = document.createElement("div");
  container.className = "game-container flex items-center justify-center";
  // Make container take up more screen space
  container.style.width = "95vw";
  container.style.height = "85vh";

  // Create countdown overlay
  const countdownOverlay = document.createElement("div");
  countdownOverlay.className = `
    fixed inset-0 flex items-center justify-center bg-opacity-75 text-9xl font-bold text-cyan-400
    text-shadow-neon pointer-events-none
  `;
  countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
  // Add neon text shadow style
  const style = document.createElement('style');
  style.textContent = `
    .text-shadow-neon {
      text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff;
    }
  `;
  document.head.appendChild(style);
  container.appendChild(countdownOverlay);

  // Dispatch event to update UI and save scores
  const dispatchScoreUpdate = () => {
    saveScores();
    const scoreEvent = new CustomEvent("aiScoreUpdate", {
      detail: { player: state.scores.player, ai: state.scores.ai },
    });
    document.dispatchEvent(scoreEvent);
  };

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.className = "rounded-lg shadow-xl";
  // Set canvas to take up more space - 90% of the container
  canvas.style.width = "90%";
  canvas.style.height = "90%";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  // Create popup for game over
  const popup = document.createElement("div");
  popup.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 hidden";
  const popupContent = document.createElement("div");
  popupContent.className = "bg-black border-2 border-cyan-400 p-6 rounded-lg shadow-lg text-center";
  popup.appendChild(popupContent);
  const winnerText = document.createElement("p");
  winnerText.className = "text-xl font-bold mb-4 text-cyan-400 text-shadow-neon";
  popupContent.appendChild(winnerText);
  const scoreText = document.createElement("p");
  scoreText.className = "mb-4 text-pink-500 text-shadow-neon";
  popupContent.appendChild(scoreText);
  const restartButton = document.createElement("button");
  restartButton.className =
    "px-4 py-2 bg-purple-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-purple-900 hover:shadow-neon";
  restartButton.textContent = "Play Again";
  restartButton.style.boxShadow = "0 0 10px #0ff, 0 0 20px #0ff"; // Add neon glow to button
  restartButton.addEventListener("click", () => {
    state.scores = { player: 0, ai: 0 };
    state.gameEnded = false;
    state.gameStarted = false; // Reset game started flag
    popup.classList.add("hidden");
    // Reset ball with consistent initial speed
    resetBall(true);
    // Reset paddle positions to middle
    resetPaddlePositions();
    // Start countdown again
    startCountdown();
    saveScores();
  });
  popupContent.appendChild(restartButton);
  container.appendChild(popup);

  // Function to reset paddle positions to middle of the table
  const resetPaddlePositions = () => {
    state.playerY = (canvas.height - state.paddleHeight) / 2;
    state.AiY = (canvas.height - state.paddleHeight) / 2;
  };

  // Adjust canvas size dynamically
  const setCanvasSize = () => {
    // Make canvas larger by using 90% of window dimensions
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    
    // If game already started, reset ball position to center of new canvas size
    if (state.gameStarted) {
      state.ballX = canvas.width / 2;
      state.ballY = canvas.height / 2;
    }
  };

  // AI difficulty settings - significantly different based on level
  const difficultySpeeds = {
    easy: 4,    // Slow movement
    medium: 7,   // Moderate movement
    hard: 10,   // Fast movement
  };
  
  // AI reaction time delay (ms) - adds human-like delay
  const difficultyReactionDelay = {
    easy: 300,     // Slow reaction
    medium: 150,   // Moderate reaction
    hard: 50,      // Quick reaction
  };
  
  // AI precision - how much of the paddle must cover the ball
  const difficultyPrecision = {
    easy: 0.3,    // AI aims to hit ball with center 30% of paddle
    medium: 0.5,  // AI aims to hit ball with center 50% of paddle
    hard: 0.8,    // AI aims to hit ball with center 80% of paddle
  };

  // AI prediction error factors
  const difficultyPredictionError = {
    easy: 0.35,     // Large prediction error (35% of canvas height)
    medium: 0.15,   // Moderate prediction error
    hard: 0.05,     // Small prediction error
  };
  
  // AI occasionally makes wrong decisions based on difficulty
  const difficultyWrongDecisionChance = {
    easy: 0.25,     // 25% chance of making wrong decision
    medium: 0.1,    // 10% chance
    hard: 0.02,     // 2% chance
  };
  
  // Function to predict where the ball will be when it reaches the AI's side
  const predictBallPosition = () => {
    // Get the current state of the ball
    let ballX = state.ballX;
    let ballY = state.ballY;
    let ballSpeedX = state.ballSpeedX;
    let ballSpeedY = state.ballSpeedY;
    
    // Only predict if the ball is moving toward the AI
    if (ballSpeedX <= 0) return { predictedY: ballY, confidence: 0.5 };
    
    // Calculate distance to AI paddle
    const paddleX = canvas.width - (state.paddleOffset + state.paddleWidth);
    const distanceToTravel = paddleX - ballX;
    
    // Calculate how many time steps needed
    const timeSteps = distanceToTravel / ballSpeedX;
    
    // Predict final Y position with bounces
    let predictedY = ballY + (ballSpeedY * timeSteps);
    
    // Handle bounces off the top and bottom walls
    const canvasHeight = canvas.height;
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
    // Lower confidence for distant predictions and multiple bounces
    let confidence = 1.0 - (distanceToTravel / canvas.width) * 0.3 - (bounceCount * 0.2);
    confidence = Math.max(0.2, confidence);
    
    // Add intentional error based on difficulty - more error on easy, less on hard
    const errorFactor = difficultyPredictionError[difficulty as keyof typeof difficultyPredictionError];
    const maxError = errorFactor * canvasHeight * (1 + bounceCount * 0.5);
    const errorAmount = (Math.random() * maxError * 2) - maxError;
    
    // On easy difficulty, error increases more with distance
    if (difficulty === 'easy') {
      predictedY += errorAmount * (1 + (distanceToTravel / canvas.width));
    } else {
      predictedY += errorAmount;
    }
    
    // Keep within bounds
    predictedY = Math.max(0, Math.min(predictedY, canvasHeight));
    
    return { predictedY, confidence: 1.0 }; // Always return full confidence to prevent AI from slowing down
  };

  // AI update function - called at different intervals based on difficulty
  const updateAIDecision = () => {
    if (!state.gameStarted || state.gameEnded) return;
    
    // Store current ball state in AI memory
    state.aiMemory = {
      ballX: state.ballX,
      ballY: state.ballY,
      ballSpeedX: state.ballSpeedX,
      ballSpeedY: state.ballSpeedY,
      timestamp: Date.now()
    };
    
    // Reset AI keys (simulating key release)
    state.aiKeys.ArrowUp = false;
    state.aiKeys.ArrowDown = false;
    
    // Always maintain full decision confidence - AI never gives up
    state.aiDecisionConfidence = 1.0;
    
    // Make AI decisions based on ball trajectory prediction
    const { predictedY } = predictBallPosition();
    
    const aiPaddleCenter = state.AiY + state.paddleHeight / 2;
    
    // AI occasionally makes wrong decisions based on difficulty - but never gives up
    const wrongDecisionChance = difficultyWrongDecisionChance[difficulty as keyof typeof difficultyWrongDecisionChance];
    const makeWrongDecision = Math.random() < wrongDecisionChance;
    
    if (makeWrongDecision) {
      // Move in the opposite direction of where the ball is going
      if (aiPaddleCenter < canvas.height / 2) {
        state.aiKeys.ArrowDown = true;
      } else {
        state.aiKeys.ArrowUp = true;
      }
      return;
    }
    
    // Calculate target based on precision setting - higher difficulties aim more precisely
    const precision = difficultyPrecision[difficulty as keyof typeof difficultyPrecision];
    const targetPaddleRange = state.paddleHeight * precision;
    const targetOffset = (state.paddleHeight - targetPaddleRange) / 2;
    
    // Target position (where the AI wants to be)
    const targetY = predictedY - (targetPaddleRange / 2) - targetOffset;
    
    // Add reaction delay based on difficulty
    setTimeout(() => {
      // Decide which key to press based on the predicted position
      const buffer = difficulty === 'hard' ? 5 : (difficulty === 'medium' ? 15 : 30);
      
      if (aiPaddleCenter > predictedY + buffer) {
        state.aiKeys.ArrowUp = true;
      } else if (aiPaddleCenter < predictedY - buffer) {
        state.aiKeys.ArrowDown = true;
      }
    }, difficultyReactionDelay[difficulty as keyof typeof difficultyReactionDelay]);
  };

  // Function to start the AI update interval
  const startAIUpdateInterval = () => {
    if (aiUpdateIntervalId) clearInterval(aiUpdateIntervalId);
    const updateInterval = AI_UPDATE_INTERVALS[difficulty as keyof typeof AI_UPDATE_INTERVALS];
    aiUpdateIntervalId = window.setInterval(updateAIDecision, updateInterval);
  };

  // Handle key press for Player 1
  const handleKeyDown = (e: KeyboardEvent) => (state.keys[e.key] = true);
  const handleKeyUp = (e: KeyboardEvent) => (state.keys[e.key] = false);

  // Reset the ball after scoring
  const resetBall = (forceReset = false) => {
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    
    // Reset paddle positions to the middle of the table after each goal
    resetPaddlePositions();
    
    // If it's a forced reset or starting a new game, use initial speeds
    if (forceReset) {
      state.ballSpeedX = INITIAL_BALL_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
      state.ballSpeedY = (Math.random() * 6 - 3); // Random Y direction
    } else {
      // Normal score reset - just reverse X direction but maintain current speed
      state.ballSpeedX *= -1;
      
      // Make sure speed isn't too fast
      if (Math.abs(state.ballSpeedX) > 15) {
        state.ballSpeedX = (state.ballSpeedX > 0 ? 12 : -12);
      }
      
      state.ballSpeedY = Math.random() * 6 - 3; // Random Y direction
    }
  };

  // Main game loop
  const update = () => {
    if (!state.gameStarted || state.gameEnded) return;

    // Process human player input
    if (state.keys["w"] && state.playerY > 0) state.playerY -= 7;
    if (state.keys["s"] && state.playerY < canvas.height - state.paddleHeight)
      state.playerY += 7;
    if (state.keys["ArrowUp"] && state.playerY > 0) state.playerY -= 7;
    if (state.keys["ArrowDown"] && state.playerY < canvas.height - state.paddleHeight)
      state.playerY += 7;

    // Process AI input (simulated keypress)
    const aiSpeed = difficultySpeeds[difficulty as keyof typeof difficultySpeeds];
    
    // AI always moves at full speed, never slows down due to confidence
    const effectiveSpeed = aiSpeed;
    
    if (state.aiKeys.ArrowUp && state.AiY > 0) 
      state.AiY -= effectiveSpeed;
    if (state.aiKeys.ArrowDown && state.AiY < canvas.height - state.paddleHeight) 
      state.AiY += effectiveSpeed;

    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    if (state.ballY <= 0 || state.ballY >= canvas.height)
      state.ballSpeedY *= -1;

    // Ball collision detection with paddles
    const hitLeftPaddle =
      state.ballX - state.ballSize <= state.paddleOffset + state.paddleWidth &&
      state.ballX - state.ballSize > state.paddleOffset &&
      state.ballY >= state.playerY &&
      state.ballY <= state.playerY + state.paddleHeight;
    
    const hitRightPaddle =
      state.ballX + state.ballSize >= canvas.width - (state.paddleOffset + state.paddleWidth) &&
      state.ballX + state.ballSize < canvas.width - state.paddleOffset &&
      state.ballY >= state.AiY &&
      state.ballY <= state.AiY + state.paddleHeight;
    
    if (hitLeftPaddle || hitRightPaddle) {
      // Ball direction changes
      state.ballSpeedX *= -1;
      
      // Add a slight angle change based on where the ball hits the paddle
      if (hitLeftPaddle) {
        const relativeIntersectY = (state.playerY + (state.paddleHeight / 2)) - state.ballY;
        const normalizedRelativeIntersectY = relativeIntersectY / (state.paddleHeight / 2);
        state.ballSpeedY = -normalizedRelativeIntersectY * 10;
      } else {
        const relativeIntersectY = (state.AiY + (state.paddleHeight / 2)) - state.ballY;
        const normalizedRelativeIntersectY = relativeIntersectY / (state.paddleHeight / 2);
        state.ballSpeedY = -normalizedRelativeIntersectY * 10;
        
        // Increase ball speed slightly on hard difficulty when AI hits it
        // But cap it to prevent it from getting too fast
        if (difficulty === 'hard') {
          state.ballSpeedX *= 1.05;
          if (Math.abs(state.ballSpeedX) > 15) state.ballSpeedX = (state.ballSpeedX > 0 ? 15 : -15);
        }
      }
    }

    // Scoring conditions
    if (state.ballX < 0) {
      state.scores.ai++;
      checkGameOver("ai");
      resetBall();
      dispatchScoreUpdate();
    }
    if (state.ballX > canvas.width) {
      state.scores.player++;
      checkGameOver("player");
      resetBall();
      dispatchScoreUpdate();
    }
  };

  const checkGameOver = (winner: "player" | "ai") => {
    if (state.scores[winner] >= 10) {
      state.gameEnded = true;
      winnerText.textContent = `${winner === "player" ? "Player 1" : "AI"} Wins!`;
      scoreText.textContent = `Final Score: ${state.scores.player} - ${state.scores.ai}`;
      popup.classList.remove("hidden");
      cancelAnimationFrame(animationFrameId);
      clearInterval(aiUpdateIntervalId);
    }
  };

  const draw = () => {
    // Clear canvas with dark background
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines for neon effect
    ctx.strokeStyle = "rgba(0, 100, 100, 0.1)";
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines - spaced further apart for larger table
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines - spaced further apart for larger table
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw center line with neon effect
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 6; // Thicker line for larger table
    ctx.setLineDash([15, 15]); // Larger dashes for larger table
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles with neon glow
    ctx.fillStyle = "#3b82f6"; // Cyan color
    
    // Add shadow for glow effect
    ctx.shadowBlur = 20; // Increased glow for better visibility
    ctx.shadowColor = "#3b82f6";
    
    // Left paddle (player)
    ctx.fillRect(state.paddleOffset, state.playerY, state.paddleWidth, state.paddleHeight);
    
    // Right paddle (AI) - different color for contrast
    ctx.shadowColor = "#ef4444"; // Pink shadow
    ctx.fillStyle = "#ef4444"; // Pink color
    ctx.fillRect(canvas.width - (state.paddleOffset + state.paddleWidth), state.AiY, state.paddleWidth, state.paddleHeight);
    
    // Ball with neon glow
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 25; // Increased glow
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ball trail
    ctx.shadowBlur = 15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 1; i <= 5; i++) { // Extended trail
      ctx.beginPath();
      ctx.arc(
        state.ballX - (state.ballSpeedX * i * 0.5), 
        state.ballY - (state.ballSpeedY * i * 0.5), 
        state.ballSize - (i * 1.5), 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Reset shadow for other elements
    ctx.shadowBlur = 0;

    const playerScore = document.getElementById("player-score");
    const aiScore = document.getElementById("ai-score");
    if (playerScore && aiScore) {
      playerScore.textContent = state.scores.player.toString();
      aiScore.textContent = state.scores.ai.toString();
    }
  };

  // Game loop
  const gameLoop = () => {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Continue drawing during countdown to show the table
  const drawDuringCountdown = () => {
    draw();
    if (!state.gameStarted && !state.gameEnded) {
      requestAnimationFrame(drawDuringCountdown);
    }
  };

  // Countdown logic
  const startCountdown = () => {
    // Make the overlay visible
    countdownOverlay.classList.remove("hidden");
    
    // Start drawing the game table in the background
    drawDuringCountdown();
    
    let counter = COUNTDOWN_DURATION;
    countdownOverlay.textContent = counter.toString();
    
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    
    countdownIntervalId = window.setInterval(() => {
      counter--;
      countdownOverlay.textContent = counter.toString();
      if (counter === 0) {
        clearInterval(countdownIntervalId);
        countdownOverlay.classList.add("hidden");
        state.gameStarted = true;
        startAIUpdateInterval();
        gameLoop();
      }
    }, 1000);
  };

  // Initialize the game
  setCanvasSize();
  // Position paddles at appropriate heights for the new canvas size
  resetPaddlePositions();
  // Initialize ball in center
  state.ballX = canvas.width / 2;
  state.ballY = canvas.height / 2;
  startCountdown();

  // Event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", setCanvasSize);

  // --- Cleanup function ---
  const cleanup = () => {
    // Set flag to stop game updates
    state.gameEnded = true;
    // Cancel the animation frame
    cancelAnimationFrame(animationFrameId);
    // Remove event listeners
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", setCanvasSize);
    // Clear countdown interval if active
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    // Clear AI update interval
    if (aiUpdateIntervalId) {
      clearInterval(aiUpdateIntervalId);
    }
  };

  // Expose cleanup so the parent can call it
  (container as any).destroy = cleanup;

  return container;
});