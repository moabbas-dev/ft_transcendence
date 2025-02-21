export class PongAnimation {

	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	ball: {
		x: number;
		y: number;
		radius: number;
		dx: number;
		dy: number;
	};
	paddles: {
		left: { y: number; height: number };
		right: { y: number; height: number };
	};
	animationFrame: number | null;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.resize();

		this.ball = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
			radius: 12,
			dx: 4,
			dy: 4
		};

		this.paddles = {
			left: { y: this.canvas.height / 2 - 50, height: 120 },
			right: { y: this.canvas.height / 2 - 50, height: 120 }
		};

		// Animation frame reference
		this.animationFrame = null;
		this.init();
	}

	resize() {
		if (window.matchMedia("(max-width: 640px)").matches) {
			this.canvas.width = window.innerHeight;
			this.canvas.height = window.innerWidth;
		} else {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
		}
	}

	init() {
		// Add resize listener
		window.addEventListener('resize', () => this.resize());

		// Start animation loop
		this.animate();
	}

	draw() {
		if (this.ctx === null)
			return
		// Clear canvas
		this.ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'; // Match bg-gray-900 with opacity
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw center line
		this.ctx.setLineDash([5, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();

		// Enable glow effect
		this.ctx.shadowBlur = 15;
		this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'; // White glow

		// Draw ball with glow
		this.ctx.beginPath();
		this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
		this.ctx.fillStyle = 'white'; // Ball color
		this.ctx.fill();

		// Draw paddles with glow
		this.ctx.fillRect(20, this.paddles.left.y, 20, this.paddles.left.height);
		this.ctx.fillRect(this.canvas.width - 30, this.paddles.right.y, 20, this.paddles.right.height);

		// Reset glow effect after drawing
		this.ctx.shadowBlur = 0;
	}


	update() {
		// Update ball position
		this.ball.x += this.ball.dx;
		this.ball.y += this.ball.dy;

		// Ball collision with top/bottom
		if (this.ball.y + this.ball.radius > this.canvas.height ||
			this.ball.y - this.ball.radius < 0) {
			this.ball.dy *= -1;
		}

		// Ball collision with paddles
		if (
			(this.ball.x - this.ball.radius < 30 &&
				this.ball.y > this.paddles.left.y &&
				this.ball.y < this.paddles.left.y + this.paddles.left.height) ||
			(this.ball.x + this.ball.radius > this.canvas.width - 30 &&
				this.ball.y > this.paddles.right.y &&
				this.ball.y < this.paddles.right.y + this.paddles.right.height)
		) {
			this.ball.dx *= -1;
		}

		// Reset ball if it goes out
		if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
			this.ball.x = this.canvas.width / 2;
			this.ball.y = this.canvas.height / 2;
		}

		// Move paddles
		this.paddles.left.y += (this.ball.y - (this.paddles.left.y + 50)) * 0.1;
		this.paddles.right.y += (this.ball.y - (this.paddles.right.y + 50)) * 0.1;	
	}

	animate() {
		this.update();
		this.draw();
		this.animationFrame = requestAnimationFrame(() => this.animate());
	}

	destroy() {
		if (this.animationFrame !== null) {
			cancelAnimationFrame(this.animationFrame);
		}
		window.removeEventListener('resize', this.resize);
	}
}
