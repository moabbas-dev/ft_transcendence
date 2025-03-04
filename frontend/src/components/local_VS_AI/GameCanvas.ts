import { createComponent } from "../../utils/StateManager.js";

interface GameState {
  paddleHeight: number;
  paddleWidth: number;
  ballSize: number;
  playerY: number;
  AiY: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddleOffset: number;
  scores: { player: number; ai: number };
  gameEnded: boolean;
  gameStarted: boolean;
}

interface GameCanvasProps {
  gameState: GameState;
  onResize?: (width: number, height: number) => void;
}

export const GameCanvas = createComponent((props: GameCanvasProps) => {
  // Create canvas
  const container = document.createElement("div");
  container.className = "relative w-full h-full";

  const canvas = document.createElement("canvas");
  canvas.className = "rounded-lg shadow-xl";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  // Adjust canvas size dynamically
  const setCanvasSize = () => {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Notify parent of resize if callback provided
    if (props.onResize) {
      props.onResize(canvas.width, canvas.height);
    }
  };

  // Draw function
  const draw = () => {
    const state = props.gameState;

    // Clear canvas with dark background
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines for neon effect
    ctx.strokeStyle = "rgba(0, 100, 100, 0.1)";
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw vertical grid lines
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw center line with neon effect
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 6;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles with neon glow
    ctx.fillStyle = "#3b82f6"; // Blue color

    // Add shadow for glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#3b82f6";

    // Left paddle (player)
    ctx.fillRect(
      state.paddleOffset,
      state.playerY,
      state.paddleWidth,
      state.paddleHeight
    );

    // Right paddle (AI) - different color for contrast
    ctx.shadowColor = "#ef4444"; // Red shadow
    ctx.fillStyle = "#ef4444"; // Red color
    ctx.fillRect(
      canvas.width - (state.paddleOffset + state.paddleWidth),
      state.AiY,
      state.paddleWidth,
      state.paddleHeight
    );

    // Ball with neon glow
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball trail
    ctx.shadowBlur = 15;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(
        state.ballX - state.ballSpeedX * i * 0.5,
        state.ballY - state.ballSpeedY * i * 0.5,
        state.ballSize - i * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Reset shadow for other elements
    ctx.shadowBlur = 0;
  };

  // Initialize canvas size
  window.addEventListener("resize", setCanvasSize);
  // Set initial size after component is mounted
  setTimeout(setCanvasSize, 0);

  // Expose methods to the parent component
  (container as any).draw = draw;
  (container as any).getCanvas = () => canvas;
  (container as any).getContext = () => ctx;
  (container as any).getWidth = () => canvas.width;
  (container as any).getHeight = () => canvas.height;

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener("resize", setCanvasSize);
  };

  (container as any).destroy = cleanup;

  return container;
});
