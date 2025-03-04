import { createComponent } from "../../utils/StateManager.js";
import { GameResultsPopUp } from "./GameResultsPopUp.js";
import { CountdownOverlay } from "./CountdownOverlay.js";
import { InputHandler } from "./InputHandler.js";
import { ScoreManager } from "./ScoreManager.js";
import { AIController } from "./AIController.js";
import { GameCanvas } from "./GameCanvas.js";

export const AIPongGame = createComponent((difficulty: "easy" | "medium" | "hard") => {
  let animationFrameId: number;

  // Initial ball speed constants - used to reset to consistent values
  const INITIAL_BALL_SPEED_X = 8;
  const INITIAL_BALL_SPEED_Y = 5;
  const COUNTDOWN_DURATION = 5;

  const state = {
    paddleHeight: 120,
    paddleWidth: 20,
    ballSize: 12,
    playerY: 250,
    AiY: 250,
    ballX: 400,
    ballY: 300,
    ballSpeedX: INITIAL_BALL_SPEED_X,
    ballSpeedY: INITIAL_BALL_SPEED_Y,
    paddleOffset: 30,
    scores: { player: 0, ai: 0 },
    keys: {} as { [key: string]: boolean },
    gameEnded: false,
    gameStarted: false
  };
  
  // Create game container
  const container = document.createElement("div");
  container.className = "game-container flex items-center justify-center";
  container.style.width = "95vw";
  container.style.height = "85vh";

  // Create GameCanvas
  const gameCanvasInstance = new GameCanvas({
    gameState: state,
    onResize: (width: number, height: number) => {
      // Handle canvas resize
      resetPaddlePositions(width, height);
      resetBall(true, width, height);
    }
  });
  const gameCanvas = gameCanvasInstance.getContainer();
  container.appendChild(gameCanvas);

  // Create ScoreManager
  const scoreManager = ScoreManager({
    winningScore: 10,
    onScoreUpdate: (scores: any) => {
      // Update UI elements
      const playerScore = document.getElementById("player-score");
      const aiScore = document.getElementById("ai-score");
      if (playerScore && aiScore) {
        playerScore.textContent = scores.player.toString();
        aiScore.textContent = scores.ai.toString();
      }
      state.scores = scores;
    },
    onGameOver: (winner: any, scores: any) => {
      state.gameEnded = true;
      // Update and show popup
      gameResultsPopup.updateResults(winner, scores);
      gameResultsPopup.setVisibility(true);
      cancelAnimationFrame(animationFrameId);
      // Stop AI updates
      (aiController as any).stopAIUpdates();
    }
  });
  container.appendChild(scoreManager);

  // Create AI Controller
  const aiController = AIController({
    difficulty,
    canvasWidth: gameCanvasInstance.getWidth(),
    canvasHeight: gameCanvasInstance.getHeight(),
    paddleHeight: state.paddleHeight,
    paddleWidth: state.paddleWidth,
    paddleOffset: state.paddleOffset,
    onAIStateChange: (aiState : any) => {
      state.AiY = aiState.paddleY;
    }
  });
  container.appendChild(aiController);

  // Create countdown overlay component
  const countdownOverlay = CountdownOverlay({
    initialDuration: COUNTDOWN_DURATION,
    onCountdownComplete: () => {
      state.gameStarted = true;
      (aiController as any).startAIUpdates();
      gameLoop();
    }
  });
  container.appendChild(countdownOverlay);

  // Create InputHandler for keyboard input
  const inputHandler = InputHandler({
    onKeyStateChange: (keys: any) => {
      state.keys = keys;
    }
  });
  container.appendChild(inputHandler);

  // Create game results popup
  const gameResultsPopup = GameResultsPopUp({
    isVisible: false,
    winner: null,
    scores: { player: 0, ai: 0 },
    onRestart: () => {
      // Reset game logic
      (scoreManager as any).resetScores();
      state.gameEnded = false;
      state.gameStarted = false;
      resetBall(true, gameCanvasInstance.getWidth(), gameCanvasInstance.getHeight());
      resetPaddlePositions(gameCanvasInstance.getWidth(), gameCanvasInstance.getHeight());
      // Restart countdown
      (countdownOverlay as any).resetCountdown();
      // Hide popup
      gameResultsPopup.setVisibility(false);
    }
  });
  container.appendChild(gameResultsPopup);

  // Function to reset paddle positions to middle of the table
  const resetPaddlePositions = (width?: number, height?: number) => {
    const canvasWidth = width || gameCanvasInstance.getWidth();
    const canvasHeight = height || gameCanvasInstance.getHeight();

    state.playerY = (canvasHeight - state.paddleHeight) / 2;
    (aiController as any).setAIPosition((canvasHeight - state.paddleHeight) / 2);
  };

  // Reset the ball after scoring
  const resetBall = (forceReset = false, width?: number, height?: number) => {
    const canvasWidth = width || gameCanvasInstance.getWidth();
    const canvasHeight = height || gameCanvasInstance.getHeight();

    state.ballX = canvasWidth / 2;
    state.ballY = canvasHeight / 2;
    
    resetPaddlePositions(canvasWidth, canvasHeight);
    
    if (forceReset) {
      state.ballSpeedX = INITIAL_BALL_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
      state.ballSpeedY = (Math.random() * 6 - 3);
    } else {
      state.ballSpeedX *= -1;
      
      if (Math.abs(state.ballSpeedX) > 15) {
        state.ballSpeedX = (state.ballSpeedX > 0 ? 12 : -12);
      }
      
      state.ballSpeedY = Math.random() * 6 - 3;
    }

    // Update AI controller with new ball trajectory
    (aiController as any).updateAIDecision(state.ballX, state.ballY, state.ballSpeedX, state.ballSpeedY);
  };

  // Main game loop update function
  const update = () => {
    if (!state.gameStarted || state.gameEnded) return;

    // Process human player input
    if ((inputHandler as any).isKeyPressed("w") && state.playerY > 0) state.playerY -= 7;
    if ((inputHandler as any).isKeyPressed("s") && state.playerY < gameCanvasInstance.getHeight() - state.paddleHeight) state.playerY += 7;
    if ((inputHandler as any).isKeyPressed("ArrowUp") && state.playerY > 0) state.playerY -= 7;
    if ((inputHandler as any).isKeyPressed("ArrowDown") && state.playerY < gameCanvasInstance.getHeight() - state.paddleHeight) state.playerY += 7;

    // Update AI paddle position 
    (aiController as any).updateAIPosition(gameCanvasInstance.getHeight());

    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    if (state.ballY <= 0 || state.ballY >= gameCanvasInstance.getHeight())
      state.ballSpeedY *= -1;

    // Ball collision detection with paddles
    const hitLeftPaddle =
      state.ballX - state.ballSize <= state.paddleOffset + state.paddleWidth &&
      state.ballX - state.ballSize > state.paddleOffset &&
      state.ballY >= state.playerY &&
      state.ballY <= state.playerY + state.paddleHeight;
    
    const hitRightPaddle =
      state.ballX + state.ballSize >= gameCanvasInstance.getWidth() - (state.paddleOffset + state.paddleWidth) &&
      state.ballX + state.ballSize < gameCanvasInstance.getWidth() - state.paddleOffset &&
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
        if (difficulty === 'hard') {
          state.ballSpeedX *= 1.05;
          if (Math.abs(state.ballSpeedX) > 15) state.ballSpeedX = (state.ballSpeedX > 0 ? 15 : -15);
        }
      }

      // Update AI decision with new ball trajectory
      (aiController as any).updateAIDecision(state.ballX, state.ballY, state.ballSpeedX, state.ballSpeedY);
    }

    // Scoring conditions
    if (state.ballX < 0) {
      // Call ScoreManager to update AI score
      (scoreManager as any).updateScore("ai");
      resetBall();
    }
    if (state.ballX > gameCanvasInstance.getWidth()) {
      // Call ScoreManager to update player score
      (scoreManager as any).updateScore("player");
      resetBall();
    }
  };

  // Game loop
  const gameLoop = () => {
    update();
    gameCanvasInstance.draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Continue drawing during countdown to show the table
  const drawDuringCountdown = () => {
    gameCanvasInstance.draw();
    if (!state.gameStarted && !state.gameEnded) {
      requestAnimationFrame(drawDuringCountdown);
    }
  };

  // Initialize the game
  resetPaddlePositions();
  
  // Initialize ball in center
  state.ballX = gameCanvasInstance.getWidth() / 2;
  state.ballY = gameCanvasInstance.getHeight() / 2;
  
  // Start drawing the game table in the background while countdown is active
  drawDuringCountdown();
  // Start the countdown
  (countdownOverlay as any).startCountdown();

  // --- Cleanup function ---
  const cleanup = () => {
    // Set flag to stop game updates
    state.gameEnded = true;
    // Cancel the animation frame
    cancelAnimationFrame(animationFrameId);
    // Stop AI updates
    (aiController as any).stopAIUpdates();
    // Clean up the countdown component
    (countdownOverlay as any).destroy();
    // Clean up the input handler
    (inputHandler as any).destroy();
    // Clean up the AI controller
    (aiController as any).destroy();
    // Clean up the game canvas
    gameCanvasInstance.destroy();
  };

  // Expose cleanup so the parent can call it
  (container as any).destroy = cleanup;

  return container;
});