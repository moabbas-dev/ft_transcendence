// import { createComponent } from "../../utils/StateManager.js";

// export const AIPongGame = createComponent((difficulty: string) => {
//   let animationFrameId: number;
//   const COUNTDOWN_DURATION = 3;

//   const state = {
//     paddleHeight: 100,
//     paddleWidth: 20,
//     ballSize: 10,
//     playerY: 250,
//     AiY: 250,
//     ballX: 400,
//     ballY: 300,
//     ballSpeedX: 5,
//     ballSpeedY: 4,
//     paddleOffset: 20,
//     scores: { player: 0, ai: 0 },
//     keys: {} as { [key: string]: boolean },
//     gameEnded: false,
//     gameStarted: false,
//     countdown: COUNTDOWN_DURATION,
//   };
  
//   // Function to update and save scores
//   const saveScores = () => {
//     localStorage.setItem("aiPongScores", JSON.stringify(state.scores));
//   };
//   // Load scores from Local Storage if available
//   saveScores();

//   // Create game container
//   const container = document.createElement("div");
//   container.className = "game-container flex items-center justify-center";

//   // Create countdown overlay
//   const countdownOverlay = document.createElement("div");
//   countdownOverlay.className = `
//     fixed  flex items-center justify-center bg-opacity-75 text-black text-9xl font-bold
//   `;
//   countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
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
//   canvas.className = "rounded-lg shadow-xl w-[80%] h-[80%]";
//   container.appendChild(canvas);
//   const ctx = canvas.getContext("2d")!;

//   const popup = document.createElement("div");
//   popup.className =
//     "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden";

//   const popupContent = document.createElement("div");
//   popupContent.className = "bg-white p-6 rounded-lg shadow-lg text-center";
//   popup.appendChild(popupContent);

//   const winnerText = document.createElement("p");
//   winnerText.className = "text-xl font-bold mb-4";
//   popupContent.appendChild(winnerText);

//   const scoreText = document.createElement("p");
//   scoreText.className = "mb-4";
//   popupContent.appendChild(scoreText);

//   const restartButton = document.createElement("button");
//   restartButton.className =
//     "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700";
//   restartButton.textContent = "Play Again";
//   restartButton.addEventListener("click", () => {
//     state.scores = { player: 0, ai: 0 };
//     state.gameEnded = false;
//     popup.classList.add("hidden");
//     resetBall();
//     gameLoop();
//     saveScores();
//   });
//   popupContent.appendChild(restartButton);
//   container.appendChild(popup);

//   // Adjust canvas size dynamically
//   const setCanvasSize = () => {
//     canvas.width = window.innerWidth * 0.8; // 80% of screen width
//     canvas.height = window.innerHeight * 0.8; // 80% of screen height
//   };

//   // AI difficulty settings
//   const difficultySpeeds = {
//     easy: 2,
//     medium: 4,
//     hard: 6,
//   };

//   // AI logic for Player 2
//   const updateAI = () => {
//     if (state.ballSpeedX > 0) {
//       const paddleCenter = state.AiY + state.paddleHeight / 2;
//       const diff = state.ballY - paddleCenter;

//       // FIX: Ensure TypeScript recognizes difficulty as a valid key
//       const aiSpeed =
//         difficultySpeeds[difficulty as keyof typeof difficultySpeeds];

//       if (Math.abs(diff) > aiSpeed) {
//         state.AiY += diff > 0 ? aiSpeed : -aiSpeed;
//       } else {
//         state.AiY += diff;
//       }

//       // Constrain AI paddle
//       state.AiY = Math.max(
//         0,
//         Math.min(state.AiY, canvas.height - state.paddleHeight)
//       );
//     }
//   };

//   // Handle key press for Player 1
//   const handleKeyDown = (e: KeyboardEvent) => (state.keys[e.key] = true);
//   const handleKeyUp = (e: KeyboardEvent) => (state.keys[e.key] = false);

//   // Reset the ball after scoring
//   const resetBall = () => {
//     state.ballX = canvas.width / 2;
//     state.ballY = canvas.height / 2;
//     state.ballSpeedX *= -1;
//     state.ballSpeedY = Math.random() * 6 - 3;
//   };

//   // Main game loop
//   const update = () => {
//     if (!state.gameStarted || state.gameEnded) return;

//     if (state.keys["w"] && state.playerY > 0) state.playerY -= 7;
//     if (state.keys["s"] && state.playerY < canvas.height - state.paddleHeight)
//       state.playerY += 7;

//     if (state.keys["ArrowUp"] && state.playerY > 0) state.playerY -= 7;
//     if (
//       state.keys["ArrowDown"] &&
//       state.playerY < canvas.height - state.paddleHeight
//     )
//       state.playerY += 7;

//     updateAI();

//     state.ballX += state.ballSpeedX;
//     state.ballY += state.ballSpeedY;

//     if (state.ballY <= 0 || state.ballY >= canvas.height)
//       state.ballSpeedY *= -1;

//     // Ball collision detection with paddles
//     const hitLeftPaddle =
//       state.ballX - state.ballSize <= state.paddleWidth &&
//       state.ballY >= state.playerY &&
//       state.ballY <= state.playerY + state.paddleHeight;

//     const hitRightPaddle =
//       state.ballX + state.ballSize >= canvas.width - state.paddleWidth &&
//       state.ballY >= state.AiY &&
//       state.ballY <= state.AiY + state.paddleHeight;

//     if (hitLeftPaddle || hitRightPaddle) {
//       state.ballSpeedX *= -1;
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
//       winnerText.textContent = `${
//         winner === "player" ? "Player 1" : "Player 2"
//       } Wins!`;
//       scoreText.textContent = `Final Score: ${state.scores.player} - ${state.scores.ai}`;
//       popup.classList.remove("hidden");
//       if (animationFrameId) cancelAnimationFrame(animationFrameId);
//     }
//   };

//   const draw = () => {
//     ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     ctx.fillStyle = "#fff";
//     ctx.fillRect(
//       state.paddleOffset,
//       state.playerY,
//       state.paddleWidth,
//       state.paddleHeight
//     );
//     ctx.fillRect(
//       canvas.width - (state.paddleOffset + state.paddleWidth),
//       state.AiY,
//       state.paddleWidth,
//       state.paddleHeight
//     );

//     // Draw ball
//     ctx.beginPath();
//     ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.shadowBlur = 15;
//     ctx.shadowColor = "rgba(255, 255, 255, 0.8)";

//     // Draw center line
//     ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
//     ctx.setLineDash([5, 5]);
//     ctx.beginPath();
//     ctx.moveTo(canvas.width / 2, 0);
//     ctx.lineTo(canvas.width / 2, canvas.height);
//     ctx.stroke();

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

//     const interval = setInterval(() => {
//       counter--;
//       countdownOverlay.textContent = counter.toString();
//       if (counter === 0) {
//         clearInterval(interval);
//         countdownOverlay.classList.add("hidden");
//         state.gameStarted = true;
//         gameLoop();
//       }
//     }, 1000);
//   };

//   // Initialize the game
//   setCanvasSize();
//   startCountdown();

//   // Event listeners
//   window.addEventListener("keydown", handleKeyDown);
//   window.addEventListener("keyup", handleKeyUp);
//   window.addEventListener("resize", setCanvasSize);


//   // Cleanup function to stop the game and remove event listeners
//   // const cleanup = () => {
//   //   cancelAnimationFrame(animationFrameId);
//   //   window.removeEventListener("keydown", handleKeyDown);
//   //   window.removeEventListener("keyup", handleKeyUp);
//   //   window.removeEventListener("resize", setCanvasSize);

//   //   localStorage.removeItem("aiPongScores");
//   // };

//   // (container as any).destroy = cleanup;


//   return container;
// });


import { createComponent } from "../../utils/StateManager.js";

export const AIPongGame = createComponent((difficulty: string) => {
  let animationFrameId: number;
  let countdownIntervalId: number; // store interval id for countdown
  const COUNTDOWN_DURATION = 3;

  const state = {
    paddleHeight: 100,
    paddleWidth: 20,
    ballSize: 10,
    playerY: 250,
    AiY: 250,
    ballX: 400,
    ballY: 300,
    ballSpeedX: 10,
    ballSpeedY: 10,
    paddleOffset: 20,
    scores: { player: 0, ai: 0 },
    keys: {} as { [key: string]: boolean },
    gameEnded: false,
    gameStarted: false,
    countdown: COUNTDOWN_DURATION,
  };
  
  // Function to update and save scores
  const saveScores = () => {
    localStorage.setItem("aiPongScores", JSON.stringify(state.scores));
  };
  saveScores();

  // Create game container
  const container = document.createElement("div");
  container.className = "game-container flex items-center justify-center";

  // Create countdown overlay
  const countdownOverlay = document.createElement("div");
  countdownOverlay.className = `
    fixed flex items-center justify-center bg-opacity-75 text-black text-9xl font-bold
  `;
  countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
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
  canvas.className = "rounded-lg shadow-xl w-[80%] h-[80%]";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  // Create popup for game over
  const popup = document.createElement("div");
  popup.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden";
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
  restartButton.className =
    "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700";
  restartButton.textContent = "Play Again";
  restartButton.addEventListener("click", () => {
    state.scores = { player: 0, ai: 0 };
    state.gameEnded = false;
    popup.classList.add("hidden");
    resetBall();
    gameLoop();
    saveScores();
  });
  popupContent.appendChild(restartButton);
  container.appendChild(popup);

  // Adjust canvas size dynamically
  const setCanvasSize = () => {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
  };

  // AI difficulty settings
  const difficultySpeeds = {
    easy: 2,
    medium: 4,
    hard: 6,
  };

  // AI logic for Player 2
  const updateAI = () => {
    if (state.ballSpeedX > 0) {
      const paddleCenter = state.AiY + state.paddleHeight / 2;
      const diff = state.ballY - paddleCenter;
      const aiSpeed =
        difficultySpeeds[difficulty as keyof typeof difficultySpeeds];

      if (Math.abs(diff) > aiSpeed) {
        state.AiY += diff > 0 ? aiSpeed : -aiSpeed;
      } else {
        state.AiY += diff;
      }
      state.AiY = Math.max(0, Math.min(state.AiY, canvas.height - state.paddleHeight));
    }
  };

  // Handle key press for Player 1
  const handleKeyDown = (e: KeyboardEvent) => (state.keys[e.key] = true);
  const handleKeyUp = (e: KeyboardEvent) => (state.keys[e.key] = false);

  // Reset the ball after scoring
  const resetBall = () => {
    state.ballX = canvas.width / 2;
    state.ballY = canvas.height / 2;
    state.ballSpeedX *= -1;
    state.ballSpeedY = Math.random() * 6 - 3;
  };

  // Main game loop
  const update = () => {
    if (!state.gameStarted || state.gameEnded) return;

    if (state.keys["w"] && state.playerY > 0) state.playerY -= 7;
    if (state.keys["s"] && state.playerY < canvas.height - state.paddleHeight)
      state.playerY += 7;
    if (state.keys["ArrowUp"] && state.playerY > 0) state.playerY -= 7;
    if (state.keys["ArrowDown"] && state.playerY < canvas.height - state.paddleHeight)
      state.playerY += 7;

    updateAI();

    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    if (state.ballY <= 0 || state.ballY >= canvas.height)
      state.ballSpeedY *= -1;

    // Ball collision detection with paddles
    const hitLeftPaddle =
      state.ballX - state.ballSize <= state.paddleWidth &&
      state.ballY >= state.playerY &&
      state.ballY <= state.playerY + state.paddleHeight;
    const hitRightPaddle =
      state.ballX + state.ballSize >= canvas.width - state.paddleWidth &&
      state.ballY >= state.AiY &&
      state.ballY <= state.AiY + state.paddleHeight;
    if (hitLeftPaddle || hitRightPaddle) {
      state.ballSpeedX *= -1;
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
      winnerText.textContent = `${winner === "player" ? "Player 1" : "Player 2"} Wins!`;
      scoreText.textContent = `Final Score: ${state.scores.player} - ${state.scores.ai}`;
      popup.classList.remove("hidden");
      cancelAnimationFrame(animationFrameId);
    }
  };

  const draw = () => {
    ctx.fillStyle = "rgba(17, 24, 39, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(state.paddleOffset, state.playerY, state.paddleWidth, state.paddleHeight);
    ctx.fillRect(canvas.width - (state.paddleOffset + state.paddleWidth), state.AiY, state.paddleWidth, state.paddleHeight);
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

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

  // Countdown logic
  const startCountdown = () => {
    countdownOverlay.classList.remove("hidden");
    let counter = COUNTDOWN_DURATION;
    countdownOverlay.textContent = counter.toString();
    countdownIntervalId = window.setInterval(() => {
      counter--;
      countdownOverlay.textContent = counter.toString();
      if (counter === 0) {
        clearInterval(countdownIntervalId);
        countdownOverlay.classList.add("hidden");
        state.gameStarted = true;
        gameLoop();
      }
    }, 1000);
  };

  // Initialize the game
  setCanvasSize();
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
  };

  // Expose cleanup so the parent can call it
  (container as any).destroy = cleanup;

  return container;
});
