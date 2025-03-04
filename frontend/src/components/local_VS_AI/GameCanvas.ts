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

export class GameCanvas {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private props: GameCanvasProps;

  constructor(props: GameCanvasProps) {
    this.props = props;
    
    // Create container
    this.container = document.createElement("div");
    this.container.className = "relative w-full h-full";

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.className = "rounded-lg shadow-xl";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.container.appendChild(this.canvas);

    // Get 2D context
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D rendering context");
    }
    this.ctx = ctx;

    // Bind methods to ensure correct 'this' context
    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.draw = this.draw.bind(this);

    // Initialize canvas size
    window.addEventListener("resize", this.setCanvasSize);
    // Set initial size after component is mounted
    setTimeout(this.setCanvasSize, 0);
  }

  // Method to set canvas size dynamically
  private setCanvasSize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Notify parent of resize if callback provided
    if (this.props.onResize) {
      this.props.onResize(this.canvas.width, this.canvas.height);
    }
  }

  // Draw method to render game state
  public draw() {
    const state = this.props.gameState;

    // Clear canvas with dark background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines for neon effect
    this.ctx.strokeStyle = "rgba(0, 100, 100, 0.1)";
    this.ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let y = 0; y < this.canvas.height; y += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw vertical grid lines
    for (let x = 0; x < this.canvas.width; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw center line with neon effect
    this.ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    this.ctx.lineWidth = 6;
    this.ctx.setLineDash([15, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles with neon glow
    this.ctx.fillStyle = "#3b82f6"; // Blue color

    // Add shadow for glow effect
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#3b82f6";

    // Left paddle (player)
    this.ctx.fillRect(
      state.paddleOffset,
      state.playerY,
      state.paddleWidth,
      state.paddleHeight
    );

    // Right paddle (AI) - different color for contrast
    this.ctx.shadowColor = "#ef4444"; // Red shadow
    this.ctx.fillStyle = "#ef4444"; // Red color
    this.ctx.fillRect(
      this.canvas.width - (state.paddleOffset + state.paddleWidth),
      state.AiY,
      state.paddleWidth,
      state.paddleHeight
    );

    // Ball with neon glow
    this.ctx.shadowColor = "#ffffff";
    this.ctx.shadowBlur = 25;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw ball trail
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let i = 1; i <= 5; i++) {
      this.ctx.beginPath();
      this.ctx.arc(
        state.ballX - state.ballSpeedX * i * 0.5,
        state.ballY - state.ballSpeedY * i * 0.5,
        state.ballSize - i * 1.5,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Reset shadow for other elements
    this.ctx.shadowBlur = 0;
  }

  // Expose methods to interact with the canvas
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getWidth(): number {
    return this.canvas.width;
  }

  public getHeight(): number {
    return this.canvas.height;
  }

  // Cleanup method to remove event listeners
  public destroy() {
    window.removeEventListener("resize", this.setCanvasSize);
  }

  // Method to get the container element
  public getContainer(): HTMLDivElement {
    return this.container;
  }

  // Static method to create the component (similar to the original createComponent)
  static create(props: GameCanvasProps): HTMLDivElement {
    const gameCanvas = new GameCanvas(props);
    return gameCanvas.getContainer();
  }
}

// Usage would be similar to the original functional component
// const container = GameCanvas.create(gameStateProps);