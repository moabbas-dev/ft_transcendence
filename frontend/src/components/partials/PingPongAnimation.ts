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
		window.addEventListener('resize', () => this.resize());

		this.animate();
	}

	draw() {
		if (this.ctx === null)
			return
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.setLineDash([5, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		this.ctx.lineWidth = 2;
		this.ctx.stroke();

		this.ctx.shadowBlur = 15;
		this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

		this.ctx.beginPath();
		this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
		this.ctx.fillStyle = 'white';
		this.ctx.fill();

		this.ctx.fillRect(20, this.paddles.left.y, 20, this.paddles.left.height);
		this.ctx.fillRect(this.canvas.width - 30, this.paddles.right.y, 20, this.paddles.right.height);

		this.ctx.shadowBlur = 0;
	}


	update() {
		this.ball.x += this.ball.dx;
		this.ball.y += this.ball.dy;

		if (this.ball.y + this.ball.radius > this.canvas.height ||
			this.ball.y - this.ball.radius < 0) {
			this.ball.dy *= -1;
		}

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

		if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
			this.ball.x = this.canvas.width / 2;
			this.ball.y = this.canvas.height / 2;
		}

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
