import logger from '../utils/logger.js'


class GameRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.players = [];
    this.gameInterval = null;
    this.scores = [0, 0];
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    this.paddleHeight = 100;
    this.paddleWidth = 15;
    this.gameStarted = false;
    
    // Initialize ball
    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      dx: Math.random() > 0.5 ? 5 : -5,  // Random initial direction
      dy: Math.random() * 4 - 2,         // Random initial vertical velocity
      speed: 5,
      radius: 10
    };
  }
  
  addPlayer(playerId) {
    // Check if player is already in the room
    const existingPlayer = this.players.find(p => p.id === playerId);
    if (existingPlayer) {
      return existingPlayer.paddleIndex + 1; // Return existing player number (1 or 2)
    }
    
    // Check if room is full
    if (this.players.length >= 2) {
      logger.info(`Room ${this.roomId} is full, cannot add player ${playerId}`);
      return 0; // Return 0 instead of -1 to indicate room is full
    }
    
    const position = this.canvasHeight / 2 - this.paddleHeight / 2;
    const paddleIndex = this.players.length; // 0 for first player (left), 1 for second player (right)
    this.players.push({ id: playerId, position, paddleIndex });
    
    const playerNumber = paddleIndex + 1; // 1 for player 1, 2 for player 2
    logger.info(`Added player ${playerId} as player ${playerNumber} to room ${this.roomId}`);
    return playerNumber;
  }
  
  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(player => player.id === playerId);
    
    if (playerIndex !== -1) {
      logger.info(`Removing player ${playerId} from room ${this.roomId}`);
      this.players.splice(playerIndex, 1);
      
      // Stop the game if a player disconnects
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      
      this.gameStarted = false;
    }
  }
  
  updatePlayerPosition(playerId, position) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.position = position;
      
      // Send updated position to opponent
      const opponent = this.players.find(p => p.id !== playerId);
      if (opponent) {
        this.io.to(opponent.id).emit('opponent-move', position);
      }
    }
  }
  
  startGame() {
    if (this.gameStarted) {
      logger.info(`Game already started in room ${this.roomId}`);
      return;
    }
    
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    this.resetBall();
    this.gameStarted = true;
    logger.info(`Starting game in room ${this.roomId}`);
    
    // Update game state 60 times per second
    this.gameInterval = setInterval(() => this.updateGameState(), 1000 / 60);
  }
  
  restartGame() {
    this.scores = [0, 0];
    this.io.to(this.roomId).emit('score-update', this.scores);
    
    if (!this.gameStarted) {
      this.startGame();
    } else {
      this.resetBall();
    }
  }
  
  resetBall() {
    this.ball.x = this.canvasWidth / 2;
    this.ball.y = this.canvasHeight / 2;
    this.ball.dx = Math.random() > 0.5 ? 5 : -5;
    this.ball.dy = Math.random() * 4 - 2;
    this.ball.speed = 5;
  }
  
  updateGameState() {
    // Move the ball
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Bounce off top and bottom walls
    if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvasHeight) {
      this.ball.dy = -this.ball.dy;
    }
    
    // Get paddles with default positions in case a player is missing
    const paddles = [
      { position: this.canvasHeight / 2 - this.paddleHeight / 2 }, // Default for player 1 (left)
      { position: this.canvasHeight / 2 - this.paddleHeight / 2 }  // Default for player 2 (right)
    ];
    
    // Update with actual player positions
    this.players.forEach(player => {
      paddles[player.paddleIndex].position = player.position;
    });
    
    // Check for left paddle collision (Player 1)
    if (
      this.ball.x - this.ball.radius <= this.paddleWidth &&
      this.ball.y >= paddles[0].position &&
      this.ball.y <= paddles[0].position + this.paddleHeight
    ) {
      // Calculate angle based on where ball hits paddle
      const hitPosition = (this.ball.y - paddles[0].position) / this.paddleHeight;
      const angle = (hitPosition - 0.5) * Math.PI / 2; // -45 to 45 degrees
      
      this.ball.dx = Math.cos(angle) * this.ball.speed;
      this.ball.dy = Math.sin(angle) * this.ball.speed;
      
      // Make sure dx is positive (moving right)
      if (this.ball.dx < 0) this.ball.dx = -this.ball.dx;
      
      // Increase speed slightly
      this.ball.speed += 0.2;
    }
    
    // Check for right paddle collision (Player 2)
    if (
      this.ball.x + this.ball.radius >= this.canvasWidth - this.paddleWidth &&
      this.ball.y >= paddles[1].position &&
      this.ball.y <= paddles[1].position + this.paddleHeight
    ) {
      // Calculate angle based on where ball hits paddle
      const hitPosition = (this.ball.y - paddles[1].position) / this.paddleHeight;
      const angle = (hitPosition - 0.5) * Math.PI / 2; // -45 to 45 degrees
      
      this.ball.dx = Math.cos(angle) * this.ball.speed;
      this.ball.dy = Math.sin(angle) * this.ball.speed;
      
      // Make sure dx is negative (moving left)
      if (this.ball.dx > 0) this.ball.dx = -this.ball.dx;
      
      // Increase speed slightly
      this.ball.speed += 0.2;
    }
    
    // Check for scoring
    if (this.ball.x - this.ball.radius < 0) {
      // Player 2 scores
      this.scores[1]++;
      this.io.to(this.roomId).emit('score-update', this.scores);
      this.resetBall();
    } else if (this.ball.x + this.ball.radius > this.canvasWidth) {
      // Player 1 scores
      this.scores[0]++;
      this.io.to(this.roomId).emit('score-update', this.scores);
      this.resetBall();
    }
    
    // Send game state to clients
    this.io.to(this.roomId).emit('game-update', {
      ball: this.ball,
      paddles: paddles
    });
  }
}

export default GameRoom;