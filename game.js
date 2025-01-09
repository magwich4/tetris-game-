const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

// Tetromino shapes and colors
const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Game state
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let score = 0;
let gameOver = false;
let gameLoop = null;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
    }

    rotate() {
        const rotated = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            const row = [];
            for (let j = this.shape.length - 1; j >= 0; j--) {
                row.push(this.shape[j][i]);
            }
            rotated.push(row);
        }
        return rotated;
    }
}

function createNewPiece() {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return new Piece(SHAPES[randomShape], COLORS[randomShape]);
}

function isValidMove(piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                if (newX < 0 || newX >= BOARD_WIDTH || 
                    newY >= BOARD_HEIGHT ||
                    (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function mergePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const newY = currentPieceY + row;
                if (newY < 0) {
                    gameOver = true;
                    return;
                }
                board[newY][currentPieceX + col] = currentPiece.color;
            }
        }
    }
    checkLines();
}

function checkLines() {
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            score += 100;
            updateScore();
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    ctx.fillRect(
                        (currentPieceX + col) * BLOCK_SIZE,
                        (currentPieceY + row) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }

    // Draw game over text
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    }
}

function moveDown() {
    if (!currentPiece) return;
    
    if (isValidMove(currentPiece, currentPieceX, currentPieceY + 1)) {
        currentPieceY++;
    } else {
        mergePiece();
        if (!gameOver) {
            currentPiece = createNewPiece();
            currentPieceX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentPieceY = -currentPiece.shape.length;
        }
    }
    draw();
}

function moveLeft() {
    if (currentPiece && isValidMove(currentPiece, currentPieceX - 1, currentPieceY)) {
        currentPieceX--;
        draw();
    }
}

function moveRight() {
    if (currentPiece && isValidMove(currentPiece, currentPieceX + 1, currentPieceY)) {
        currentPieceX++;
        draw();
    }
}

function rotate() {
    if (!currentPiece) return;
    
    const rotated = currentPiece.rotate();
    const tempPiece = new Piece(rotated, currentPiece.color);
    
    if (isValidMove(tempPiece, currentPieceX, currentPieceY)) {
        currentPiece.shape = rotated;
        draw();
    }
}

function handleKeyPress(event) {
    if (gameOver) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
}

function startGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    currentPiece = createNewPiece();
    currentPieceX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPieceY = -currentPiece.shape.length;
    score = 0;
    gameOver = false;
    updateScore();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (!gameOver) moveDown();
    }, 1000);
    
    document.addEventListener('keydown', handleKeyPress);
    draw();
}

// Initialize game
window.onload = () => {
    startGame();
    document.getElementById('restart').addEventListener('click', startGame);
};
