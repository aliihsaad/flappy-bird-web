const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions explicitly to match container
canvas.width = 360;
canvas.height = 640;

const GRAVITY = 0.25;
const JUMP = -4.5;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_RATE = 90;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const GROUND_HEIGHT = 112;
const BIRD_X = 80;
const BIRD_RADIUS = 14;
const HEART_DELAY_FRAMES = 600; // Increased delay for hearts (~10 seconds at 60fps)

let birdY = (canvas.height - GROUND_HEIGHT) / 2;
let birdVelocity = 0;
let birdRotation = 0;
let pipes = [];
let items = [];
let score = 0;
let lives = 3;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameActive = false;
let frameCount = 0;
let gameStarted = false;
let pipesSpawned = 0;
let countdown = 0;
let countdownTimer = null;

// Update high score display initially
const highScoreDisplay = document.getElementById('high-score-display');
if (highScoreDisplay) highScoreDisplay.innerText = highScore;

function init() {
    pipes = [];
    items = [];
    score = 0;
    lives = 3;
    birdY = (canvas.height - GROUND_HEIGHT) / 2;
    birdVelocity = 0;
    birdRotation = 0;
    gameActive = false; // Wait for countdown
    gameStarted = true;
    frameCount = 0;
    pipesSpawned = 0;
    
    updateHUD();

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.add('hidden');

    startCountdown();
}

function startCountdown() {
    countdown = 3;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            gameActive = true;
        }
    }, 1000);
}

function updateHUD() {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.innerText = score;
    const livesDisplay = document.getElementById('lives-display');
    if (livesDisplay) livesDisplay.innerText = lives;
}

function spawnPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - GROUND_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
    pipesSpawned++;

    // Spawn a heart every 50 pipes
    if (pipesSpawned % 50 === 0) {
        const itemType = 'heart';
        items.push({
            x: canvas.width + PIPE_WIDTH / 2,
            y: topHeight + PIPE_GAP / 2,
            type: itemType,
            radius: 10,
            collected: false
        });
    }
}

function update() {
    if (!gameActive) return;

    frameCount++;

    birdVelocity += GRAVITY;
    birdY += birdVelocity;
    birdRotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, birdVelocity * 0.15));

    if (birdY + BIRD_RADIUS > canvas.height - GROUND_HEIGHT) {
        birdY = canvas.height - GROUND_HEIGHT - BIRD_RADIUS;
        handleDeath();
    }
    if (birdY - BIRD_RADIUS < 0) {
        birdY = BIRD_RADIUS;
        birdVelocity = 0;
    }

    if (frameCount % PIPE_SPAWN_RATE === 0) {
        spawnPipe();
    }

    // Update Items
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.x -= PIPE_SPEED;

        // Collision with bird
        const dx = item.x - BIRD_X;
        const dy = item.y - birdY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < BIRD_RADIUS + item.radius) {
            if (item.type === 'heart') {
                lives++;
            }
            updateHUD();
            items.splice(i, 1);
            continue;
        }

        if (item.x + item.radius < -20) {
            items.splice(i, 1);
        }
    }

    // Update Pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        const birdLeft = BIRD_X - BIRD_RADIUS + 4;
        const birdRight = BIRD_X + BIRD_RADIUS - 4;
        const birdTop = birdY - BIRD_RADIUS + 4;
        const birdBottom = birdY + BIRD_RADIUS - 4;

        if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
                handleDeath();
            }
        }

        if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
            pipe.passed = true;
            score++;
            updateHUD();
            const scoreDisplay = document.getElementById('score-display');
            if (scoreDisplay) {
                scoreDisplay.parentElement.classList.add('score-pop');
                setTimeout(() => scoreDisplay.parentElement.classList.remove('score-pop'), 300);
            }
        }

        if (pipe.x + PIPE_WIDTH < -50) {
            pipes.splice(i, 1);
        }
    }
}

function handleDeath() {
    lives--;
    updateHUD();
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset bird position and clear nearby pipes to give a chance
        birdY = (canvas.height - GROUND_HEIGHT) / 2;
        birdVelocity = 0;
        pipes = pipes.filter(p => p.x > BIRD_X + 100 || p.x < BIRD_X - 50);
        items = items.filter(it => it.x > BIRD_X + 100 || it.x < BIRD_X - 50);
        
        // Pause and countdown again on life loss
        gameActive = false;
        startCountdown();
    }
}

function draw() {
    // Sky Gradient
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4ec0ca');
    skyGradient.addColorStop(1, '#70c5ce');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    [ {x: 50, y: 100, s: 0.8}, {x: 200, y: 150, s: 1.2}, {x: 300, y: 80, s: 0.6} ].forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 20 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 15 * c.s, c.y - 10 * c.s, 20 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 30 * c.s, c.y, 20 * c.s, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Pipes - CLASSIC GREEN
    pipes.forEach(pipe => {
        const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        pipeGradient.addColorStop(0, '#73bf2e'); // Classic Green
        pipeGradient.addColorStop(0.5, '#9ce659'); // Lighter Green
        pipeGradient.addColorStop(1, '#558022'); // Darker Green
        
        ctx.fillStyle = pipeGradient;
        ctx.strokeStyle = '#543847';
        ctx.lineWidth = 3;
        
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, -5, PIPE_WIDTH, pipe.topHeight + 5);
        // Top pipe cap
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 24, PIPE_WIDTH + 8, 24);
        ctx.strokeRect(pipe.x - 4, pipe.topHeight - 24, PIPE_WIDTH + 8, 24);
        
        // Bottom pipe
        const bottomY = pipe.topHeight + PIPE_GAP;
        const bottomHeight = canvas.height - GROUND_HEIGHT - bottomY;
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);
        ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight + 5);
        // Bottom pipe cap
        ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 24);
        ctx.strokeRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 24);
    });

    // Draw Items
    items.forEach(item => {
        if (item.type === 'heart') {
            ctx.fillStyle = '#ff4d4d';
            ctx.beginPath();
            ctx.moveTo(item.x, item.y + 5);
            ctx.bezierCurveTo(item.x - 10, item.y - 5, item.x - 5, item.y - 12, item.x, item.y - 5);
            ctx.bezierCurveTo(item.x + 5, item.y - 12, item.x + 10, item.y - 5, item.x, item.y + 5);
            ctx.fill();
        }
    });

    // Ground
    const groundY = canvas.height - GROUND_HEIGHT;
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, groundY, canvas.width, GROUND_HEIGHT);
    
    // Grass pattern
    ctx.fillStyle = '#9ce659';
    ctx.fillRect(0, groundY, canvas.width, 15);
    ctx.fillStyle = '#73bf2e';
    for(let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, groundY + 15);
        ctx.lineTo(i + 10, groundY + 25);
        ctx.lineTo(i + 20, groundY + 15);
        ctx.fill();
    }

    ctx.strokeStyle = '#543847';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Bird
    ctx.save();
    ctx.translate(BIRD_X, birdY);
    ctx.rotate(birdRotation);
    
    // Body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(2, 2, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const birdGradient = ctx.createRadialGradient(-4, -4, 2, 0, 0, BIRD_RADIUS);
    birdGradient.addColorStop(0, '#fff060');
    birdGradient.addColorStop(1, '#f7d308');
    ctx.fillStyle = birdGradient;
    ctx.strokeStyle = '#543847';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crown - Only visible if score >= highScore and highScore > 0
    if (score >= highScore && highScore > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(-10, -18);
        ctx.lineTo(-5, -14);
        ctx.lineTo(0, -20);
        ctx.lineTo(5, -14);
        ctx.lineTo(10, -18);
        ctx.lineTo(8, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(6, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(-5, 2, 9, 6, birdVelocity * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beak
    ctx.fillStyle = '#f75308';
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.quadraticCurveTo(22, 0, 10, 4);
    ctx.lineTo(10, 8);
    ctx.quadraticCurveTo(18, 6, 10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw Countdown
    if (countdown > 0) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(countdown, canvas.width / 2, canvas.height / 2);
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    }
}

function gameOver() {
    if (!gameStarted) return;
    gameActive = false;
    gameStarted = false;
    if (countdownTimer) clearInterval(countdownTimer);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        const highScoreDisplay = document.getElementById('high-score-display');
        if (highScoreDisplay) highScoreDisplay.innerText = highScore;
    }

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        document.getElementById('message').innerText = 'Score: ' + score;
        document.getElementById('title').innerText = 'GAME OVER';
        document.querySelector('.btn-start').innerText = 'Try Again';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleInput() {
    if (!gameStarted) {
        init();
    } else if (gameActive) {
        birdVelocity = JUMP;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    handleInput();
});

window.handleInput = handleInput;

gameLoop();
