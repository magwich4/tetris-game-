<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tetris Game</title>
  <style>
    canvas {
      background-color: white;
      display: block;
      margin: auto;
    }
  </style>
</head>
<body>
  <canvas id="tetris" width="200" height="400"></canvas>
  <script>
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 20;
    const colors = [
      'black', // Empty space
      'purple', // I
      'cyan',   // S
      'red',    // Z
      'yellow', // T
      'green',  // L
      'orange', // J
      'blue',   // O
    ];

    // Shapes (7 Tetriminoes)
    const shapes = [
      [[1, 5, 9, 13], [4, 5, 6, 7]], // I shape
      [[4, 5, 9, 10], [2, 6, 5, 9]], // S shape
      [[6, 7, 9, 10], [1, 5, 6, 10]], // Z shape
      [[1, 2, 5, 9], [0, 4, 5, 6], [1, 5, 9, 8], [4, 5, 6, 10]], // T shape
      [[1, 2, 6, 10], [5, 6, 7, 9], [2, 6, 10, 11], [3, 5, 6, 7]], // L shape
      [[1, 4, 5, 6], [1, 4, 5, 9], [4, 5, 6, 9], [1, 5, 6, 9]], // J shape
      [[1, 2, 5, 6]], // O shape
    ];

    class Figure {
      constructor() {
        this.x = 3;
        this.y = 0;
        this.type = Math.floor(Math.random() * shapes.length);
        this.color = this.type + 1; // Use the color array
        this.rotation = 0;
      }

      getShape() {
        return shapes[this.type][this.rotation];
      }

      rotate() {
        this.rotation = (this.rotation + 1) % shapes[this.type].length;
      }
    }

    class Tetris {
      constructor() {
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.currentFigure = new Figure();
      }

      drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (this.board[row][col] !== 0) {
              ctx.fillStyle = colors[this.board[row][col]];
              ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
          }
        }
      }

      drawFigure() {
        const shape = this.currentFigure.getShape();
        shape.forEach(index => {
          const x = (index % 4) + this.currentFigure.x;
          const y = Math.floor(index / 4) + this.currentFigure.y;
          if (y >= 0) {
            ctx.fillStyle = colors[this.currentFigure.color];
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        });
      }

      rotateFigure() {
        this.currentFigure.rotate();
        if (this.checkCollision()) {
          this.currentFigure.rotate();
          this.currentFigure.rotate();
          this.currentFigure.rotate();
        }
      }

      moveFigure(dx, dy) {
        this.currentFigure.x += dx;
        this.currentFigure.y += dy;
        if (this.checkCollision()) {
          this.currentFigure.x -= dx;
          this.currentFigure.y -= dy;
          if (dy > 0) this.freezeFigure();
        }
      }

      checkCollision() {
        const shape = this.currentFigure.getShape();
        return shape.some(index => {
          const x = (index % 4) + this.currentFigure.x;
          const y = Math.floor(index / 4) + this.currentFigure.y;
          return x < 0 || x >= COLS || y >= ROWS || y < 0 || this.board[y][x] !== 0;
        });
      }

      freezeFigure() {
        const shape = this.currentFigure.getShape();
        shape.forEach(index => {
          const x = (index % 4) + this.currentFigure.x;
          const y = Math.floor(index / 4) + this.currentFigure.y;
          if (y >= 0) {
            this.board[y][x] = this.currentFigure.color;
          }
        });
        this.clearFullLines();
        this.currentFigure = new Figure();
        if (this.checkCollision()) {
          this.gameOver = true;
        }
      }

      clearFullLines() {
        for (let row = ROWS - 1; row >= 0; row--) {
          if (this.board[row].every(cell => cell !== 0)) {
            this.board.splice(row, 1);
            this.board.unshift(Array(COLS).fill(0));
            this.score += 10;
            row++;
          }
        }
      }

      update() {
        if (this.gameOver) {
          alert("Game Over! Score: " + this.score);
          return;
        }
        this.drawBoard();
        this.drawFigure();
      }
    }

    const game = new Tetris();
    let lastTime = 0;

    function gameLoop(timestamp) {
      if (lastTime === 0) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      if (deltaTime > 1000 / 60) { // 60 FPS
        game.update();
        lastTime = timestamp;
      }
      requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') game.rotateFigure();
      if (e.key === 'ArrowLeft') game.moveFigure(-1, 0);
      if (e.key === 'ArrowRight') game.moveFigure(1, 0);
      if (e.key === 'ArrowDown') game.moveFigure(0, 1);
      if (e.key === ' ') game.moveFigure(0, 1);
    });

    // Start game loop
    requestAnimationFrame(gameLoop);
  </script>
</body>
</html>

