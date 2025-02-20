import { createComponent } from "../../utils/StateManager";

export const LocalPongGame = createComponent(() => {
  let animationFrameId: number;
  let countdownTimer: number = 3;
  const COUNTDOWN_DURATION = 3; // seconds

  const state = {
    paddleHeight: 100,
    paddleWidth: 20,
    ballSize: 10,
    player1Y: 250,
    player2Y: 250,
    ballX: 400,
    ballY: 300,
    ballSpeedX: 5,
    ballSpeedY: 4,
    paddleOffset: 20,
    scores: { player1: 0, player2: 0 },
    keys: {} as { [key: string]: boolean },
    gameEnded: false,
    gameStarted: false,
    countdown: COUNTDOWN_DURATION,
  };

    // Load scores from Local Storage if available
    const savedScores = localStorage.getItem("pongScores");
    if (savedScores) {
      state.scores = JSON.parse(savedScores);
    }

  // Create game container
  const container = document.createElement("div");
  container.className =
    "game-container flex items-center justify-center";

    // Create countdown overlay
    const countdownOverlay = document.createElement("div");
    countdownOverlay.className = "fixed  flex items-center justify-center bg-opacity-75 text-black text-9xl font-bold";
    countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
    container.appendChild(countdownOverlay);
    
      // Function to update and save scores
  const saveScores = () => {
    localStorage.setItem("pongScores", JSON.stringify(state.scores));
  };

    // Dispatch event to update UI and save scores
    const dispatchScoreUpdate = () => {
      saveScores();
      const scoreEvent = new CustomEvent("scoreUpdate", {
        detail: { player1: state.scores.player1, player2: state.scores.player2 },
      });
      document.dispatchEvent(scoreEvent);
    };

    // Add countdown logic
    const startCountdown = () => {
      state.gameStarted = false;
      state.countdown = COUNTDOWN_DURATION;
      countdownOverlay.classList.remove("hidden");
  
      const updateCountdown = () => {
        state.countdown--;
        countdownOverlay.textContent = state.countdown.toString();
        
        if (state.countdown <= 0) {
          countdownOverlay.classList.add("hidden");
          state.gameStarted = true;
          gameLoop();
          return;
        }
  
        countdownTimer = window.setTimeout(updateCountdown, 1000);
      };
      state.countdown = COUNTDOWN_DURATION;
      countdownTimer = window.setTimeout(updateCountdown, 1000);
    }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.className = "rounded-lg shadow-xl w-[80%] h-[80%]"; // Set a good size
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  const popup = document.createElement("div");
  popup.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden";
  
  const popupContent = document.createElement("div");
  popupContent.className = "bg-white p-6 rounded-lg shadow-lg text-center";
  popup.appendChild(popupContent);
  
  const winnerText = document.createElement("p");
  winnerText.className = "text-xl font-bold mb-4";
  popupContent.appendChild(winnerText);
  
  const scoreText = document.createElement("p");
  scoreText.className = "mb-4";
  popupContent.appendChild(scoreText);
  
  const restartButton = document.createElement("button");
  restartButton.className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700";
  restartButton.textContent = "Play Again";
  restartButton.addEventListener("click", () => {
    state.scores = { player1: 0, player2: 0 };
    state.gameEnded = false;
    popup.classList.add("hidden");
    resetBall("player1");
    gameLoop();
    saveScores();
  });
  popupContent.appendChild(restartButton);
  container.appendChild(popup);

  // Adjust canvas size dynamically
  const setCanvasSize = () => {
    canvas.width = window.innerWidth * 0.8; // 80% of screen width
    canvas.height = window.innerHeight * 0.8; // 80% of screen height
  };

  // Handle key press
  const handleKeyDown = (e: KeyboardEvent) => (state.keys[e.key] = true);
  const handleKeyUp = (e: KeyboardEvent) => (state.keys[e.key] = false);

  // Reset the ball after scoring
  const resetBall = (scoredBy: "player1" | "player2") => {
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    state.ballSpeedX = scoredBy === "player1" ? -5 : 5; // Ball moves towards the other player
    state.ballSpeedY = Math.random() * 6 - 3; // Randomized Y movement
  };

  // Main update logic
  const update = () => {
    if (!state.gameStarted || state.gameEnded) return;

    if (state.gameEnded) return;
    // Player 1 Controls (W, S)
    if (state.keys["w"] && state.player1Y > 0) state.player1Y -= 7;
    if (state.keys["s"] && state.player1Y < canvas.height - state.paddleHeight)
      state.player1Y += 7;

    // Player 2 Controls (Arrow Up, Arrow Down)
    if (state.keys["ArrowUp"] && state.player2Y > 0) state.player2Y -= 7;
    if (
      state.keys["ArrowDown"] &&
      state.player2Y < canvas.height - state.paddleHeight
    )
      state.player2Y += 7;

    // Move the ball
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    // Ball collision with top and bottom walls
    if (state.ballY <= 0 || state.ballY >= canvas.height)
      state.ballSpeedY *= -1;

    // Paddle collision detection
    const hitLeftPaddle =
      state.ballX - state.ballSize <= state.paddleWidth &&
      state.ballY >= state.player1Y &&
      state.ballY <= state.player1Y + state.paddleHeight;

    const hitRightPaddle =
      state.ballX + state.ballSize >= canvas.width - state.paddleWidth &&
      state.ballY >= state.player2Y &&
      state.ballY <= state.player2Y + state.paddleHeight;

    if (hitLeftPaddle) {
      state.ballSpeedX = Math.abs(state.ballSpeedX); // Ensure positive direction
      state.ballX = state.paddleWidth + state.ballSize; // Prevent sticking
    }

    if (hitRightPaddle) {
      state.ballSpeedX = -Math.abs(state.ballSpeedX); // Ensure negative direction
      state.ballX = canvas.width - state.paddleWidth - state.ballSize; // Prevent sticking
    }

    // Scoring conditions
    if (state.ballX < 0) {
        state.scores.player2++;
        checkGameOver("player2");
        resetBall("player2");
        dispatchScoreUpdate();
      }
      if (state.ballX > canvas.width) {
        state.scores.player1++;
        checkGameOver("player1");
        resetBall("player1");
        dispatchScoreUpdate();
      }
  };

  const checkGameOver = (winner: "player1" | "player2") => {
    if (state.scores[winner] >= 10) {
      state.gameEnded = true;
      winnerText.textContent = `${winner === "player1" ? "Player 1" : "Player 2"} Wins!`;
      scoreText.textContent = `Final Score: ${state.scores.player1} - ${state.scores.player2}`;
      popup.classList.remove("hidden");
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  };

  // Modified restart handler
  restartButton.addEventListener("click", () => {
    state.scores = { player1: 0, player2: 0 };
    state.gameEnded = false;
    popup.classList.add("hidden");
    // Reset positions
    state.player1Y = canvas.height / 2 - state.paddleHeight / 2;
    state.player2Y = canvas.height / 2 - state.paddleHeight / 2;
    resetBall("player1");
    // Restart loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    startCountdown(); // Restart countdown
  });

  // Rendering the game
  const draw = () => {
    ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(state.paddleOffset, state.player1Y, state.paddleWidth, state.paddleHeight);
    ctx.fillRect(canvas.width - (state.paddleOffset + state.paddleWidth), state.player2Y, state.paddleWidth, state.paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // // Draw scores
    // ctx.font = '24px "Press Start 2P"';
    // ctx.textAlign = "center";
    // ctx.fillText(state.scores.player1.toString(), canvas.width / 4, 50);
    // ctx.fillText(state.scores.player2.toString(), (canvas.width * 3) / 4, 50);

    const player1Score = document.getElementById("player1-score");
    const player2Score = document.getElementById("player2-score");

    if (player1Score && player2Score) {
        player1Score.textContent = state.scores.player1.toString();
        player2Score.textContent = state.scores.player2.toString();
    }
  };

  // Main game loop
  const gameLoop = () => {
    if (!state.gameStarted || state.gameEnded) return;

    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  // Event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", setCanvasSize);

  // Initialize the game
  setCanvasSize();
  startCountdown(); // Restart countdown


  // Cleanup function when component unmounts
  
  return container;
});