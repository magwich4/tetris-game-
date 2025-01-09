// JavaScript (tetris.js)
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const blockSize = 30;
const rows = 20;
const cols = 10;

// Create the game board
let board = [];
for (let r = 0; r < rows; r++) {
  board[r] = [];
  for (let c = 0; c < cols; c++) {
    board[r][c] = 0;
  }
}

// Define the Tetris pieces
const pieces = [
  { // I
    shapes: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]]
    ],
    color: 'cyan'
  },
  // Add more pieces here (J, L, O, S, T, Z)
];

// Create a random piece
function createPiece() {
  const randomIndex = Math.floor(Math.random() * pieces.length);
  return {
    ...pieces[randomIndex],
    x: 4,
    y: -2,
    shapeIndex: 0
  };
}

let currentPiece = createPiece();

// Draw the game board
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c];
        ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
      }
    }
  }
}

// Draw the current piece
function drawPiece() {
  const shape = currentPiece.shapes[currentPiece.shapeIndex];
  shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = currentPiece.color;
        ctx.fillRect((currentPiece.x + x) * blockSize, (currentPiece.y + y) * blockSize, blockSize, blockSize);
      }
    });
  });
}

// Game loop
function gameLoop() {
  // Move piece down
  // Check for collisions
  // Rotate piece
  // Handle game over
  drawBoard();
  drawPiece();
}

setInterval(gameLoop, 1000);
