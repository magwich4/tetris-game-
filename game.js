const colors = [
    (0, 0, 0),
    (120, 37, 179),
    (100, 179, 179),
    (80, 34, 22),
    (80, 134, 22),
    (180, 34, 22),
    (180, 34, 122),
];

class Figure {
    x = 0;
    y = 0;

    figures = [
        [[1, 5, 9, 13], [4, 5, 6, 7]],
        [[4, 5, 9, 10], [2, 6, 5, 9]],
        [[6, 7, 9, 10], [1, 5, 6, 10]],
        [[1, 2, 5, 9], [0, 4, 5, 6], [1, 5, 9, 8], [4, 5, 6, 10]],
        [[1, 2, 6, 10], [5, 6, 7, 9], [2, 6, 10, 11], [3, 5, 6, 7]],
        [[1, 4, 5, 6], [1, 4, 5, 9], [4, 5, 6, 9], [1, 5, 6, 9]],
        [[1, 2, 5, 6]],
    ];

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = Math.floor(Math.random() * this.figures.length);
        this.color = Math.floor(Math.random() * (colors.length - 1)) + 1;
        this.rotation = 0;
    }

    image() {
        return this.figures[this.type][this.rotation];
    }

    rotate() {
        this.rotation = (this.rotation + 1) % this.figures[this.type].length;
    }
}

class Tetris {
    constructor(height, width) {
        this.level = 2;
        this.score = 0;
        this.state = "start";
        this.field = [];
        this.height = height;
        this.width = width;
        this.x = 100;
        this.y = 60;
        this.zoom = 20;
        this.figure = null;

        for (let i = 0; i < height; i++) {
            this.field.push(new Array(width).fill(0));
        }
    }

    newFigure() {
        this.figure = new Figure(3, 0);
    }

    intersects() {
        let intersection = false;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i * 4 + j in this.figure.image()) {
                    if (
                        i + this.figure.y > this.height - 1 ||
                        j + this.figure.x > this.width - 1 ||
                        j + this.figure.x < 0 ||
                        this.field[i + this.figure.y][j + this.figure.x] > 0
                    ) {
                        intersection = true;
                    }
                }
            }
        }
        return intersection;
    }

    breakLines() {
        let lines = 0;
        for (let i = 1; i < this.height; i++) {
            let zeros = 0;
            for (let j = 0; j < this.width; j++) {
                if (this.field[i][j] === 0) {
                    zeros++;
                }
            }
            if (zeros === 0) {
                lines++;
                for (let i1 = i; i1 >= 1; i1--) {
                    for (let j = 0; j < this.width; j++) {
                        this.field[i1][j] = this.field[i1 - 1][j];
                    }
                }
            }
        }
        this.score += lines ** 2;
    }

    goSpace() {
        while (!this.intersects()) {
            this.figure.y++;
        }
        this.figure.y--;
        this.freeze();
    }

    goDown() {
        this.figure.y++;
        if (this.intersects()) {
            this.figure.y--;
            this.freeze();
        }
    }

    freeze() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i * 4 + j in this.figure.image()) {
                    this.field[i + this.figure.y][j + this.figure.x] = this.figure.color;
                }
            }
        }
        this.breakLines();
        this.newFigure();
        if (this.intersects()) {
            this.state = "gameover";
        }
    }

    goSide(dx) {
        let oldX = this.figure.x;
        this.figure.x += dx;
        if (this.intersects()) {
            this.figure.x = oldX;
        }
    }

    rotate() {
        let oldRotation = this.figure.rotation;
        this.figure.rotate();
        if (this.intersects()) {
            this.figure.rotation = oldRotation;
        }
    }
}

// Initialize the game engine
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 500;

const game = new Tetris(20, 10);
game.newFigure();

let counter = 0;
let pressingDown = false;
const fps = 25;

function update() {
    if (game.figure === null) {
        game.newFigure();
    }
    counter++;
    if (counter > 100000) counter = 0;

    if (counter % (fps / game.level / 2) === 0 || pressingDown) {
        if (game.state === 'start') {
            game.goDown();
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < game.height; i++) {
        for (let j = 0; j < game.width; j++) {
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(game.x + game.zoom * j, game.y + game.zoom * i, game.zoom, game.zoom);
            if (game.field[i][j] > 0) {
                ctx.fillStyle = colors[game.field[i][j]];
                ctx.fillRect(game.x + game.zoom * j + 1, game.y + game.zoom * i + 1, game.zoom - 2, game.zoom - 1);
            }
        }
    }

    if (game.figure !== null) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let p = i * 4 + j;
                if (p in game.figure.image()) {
                    ctx.fillStyle = colors[game.figure.color];
                    ctx.fillRect(game.x + game.zoom * (j + game.figure.x) + 1,
                        game.y + game.zoom * (i + game.figure.y) + 1, game.zoom - 2, game.zoom - 2);
                }
            }
        }
    }

    if (game.state === "gameover") {
        ctx.fillStyle = 'orange';
        ctx.font = '65px Calibri';
        ctx.fillText('Game Over', 50, 200);
        ctx.fillText('Press ESC', 100, 265);
    }

    requestAnimationFrame(update);
}

update();

// Handle keyboard input
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') game.rotate();
    if (e.key === 'ArrowDown') pressingDown = true;
    if (e.key === 'ArrowLeft') game.goSide(-1);
    if (e.key === 'ArrowRight') game.goSide(1);
    if (e.key === ' ') game.goSpace();
    if (e.key === 'Escape') game.__init__(20, 10);
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowDown') pressingDown = false;
});
