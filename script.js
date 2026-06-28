// NITRO DOOM RACING - Jogo de Corrida estilo Asphalt Nitro com gráficos DOOM

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da UI
const hud = document.getElementById('hud');
const startMenu = document.getElementById('start-menu');
const pauseMenu = document.getElementById('pause-menu');
const gameOverMenu = document.getElementById('gameover-menu');
const speedValue = document.getElementById('speed-value');
const nitroFill = document.getElementById('nitro-fill');
const currentLapEl = document.getElementById('current-lap');
const lapTimeEl = document.getElementById('lap-time');
const bestLapEl = document.getElementById('best-lap');
const posValue = document.getElementById('pos-value');
const totalTimeEl = document.getElementById('total-time');
const finalBestLapEl = document.getElementById('final-best-lap');
const finalPositionEl = document.getElementById('final-position');

// Botões
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', resumeGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('play-again-btn').addEventListener('click', restartGame);

// Configuração do Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Estado do Jogo
let gameState = 'menu'; // menu, playing, paused, gameover
let lastTime = 0;

// Controles
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    nitro: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' || e.key === 'Shift') keys.nitro = true;
    if (e.key === 'Escape' && gameState === 'playing') pauseGame();
    else if (e.key === 'Escape' && gameState === 'paused') resumeGame();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === ' ' || e.key === 'Shift') keys.nitro = false;
});

// Classe do Jogador
class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0; // Profundidade
        this.speed = 0;
        this.maxSpeed = 450;
        this.acceleration = 1.2;
        this.braking = 1.8;
        this.friction = 0.97;
        this.turnSpeed = 0.05;
        this.angle = 0;
        this.nitro = 100;
        this.nitroActive = false;
        this.nitroMultiplier = 2.2;
        this.lap = 1;
        this.totalLaps = 3;
        this.lapTime = 0;
        this.bestLap = Infinity;
        this.checkpoints = [false, false, false];
        this.position = 1;
        this.finished = false;
        this.finishTime = 0;
    }

    update(dt) {
        if (this.finished) {
            this.speed *= 0.95;
            return;
        }

        // Aceleração
        if (keys.up) {
            let accel = this.acceleration;
            if (this.nitroActive && this.nitro > 0) {
                accel *= this.nitroMultiplier;
                this.nitro -= 0.3;
            }
            this.speed += accel;
        }
        
        // Freio
        if (keys.down) {
            this.speed -= this.braking;
        }

        // Nitro
        this.nitroActive = keys.nitro && this.nitro > 0;
        if (!keys.nitro && this.nitro < 100) {
            this.nitro += 0.05;
        }

        // Curvas
        if (Math.abs(this.speed) > 10) {
            const turnMultiplier = Math.min(Math.abs(this.speed) / 100, 1);
            if (keys.left) {
                this.angle -= this.turnSpeed * turnMultiplier;
            }
            if (keys.right) {
                this.angle += this.turnSpeed * turnMultiplier;
            }
        }

        // Atrito e limites
        this.speed *= this.friction;
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed * (this.nitroActive ? this.nitroMultiplier : 1)));

        // Atualizar posição na pista
        this.updatePosition();

        // Tempo da volta
        if (!this.finished) {
            this.lapTime += dt;
        }
    }

    updatePosition() {
        // Movimento baseado no ângulo e velocidade
        const moveSpeed = this.speed * 0.15;
        this.x += Math.sin(this.angle) * moveSpeed;
        this.z += Math.cos(this.angle) * moveSpeed;

        // Manter na pista (limites laterais)
        const trackWidth = 800;
        if (this.x > trackWidth / 2) {
            this.x = trackWidth / 2;
            this.speed *= 0.9;
        }
        if (this.x < -trackWidth / 2) {
            this.x = -trackWidth / 2;
            this.speed *= 0.9;
        }

        // Sistema de voltas
        const trackLength = 15000;
        if (this.z > trackLength) {
            this.z -= trackLength;
            this.completeLap();
        }
        if (this.z < 0) {
            this.z += trackLength;
        }
    }

    completeLap() {
        if (this.checkpoints[0] && this.checkpoints[1] && this.checkpoints[2]) {
            if (this.lapTime < this.bestLap) {
                this.bestLap = this.lapTime;
            }
            
            this.lap++;
            this.lapTime = 0;
            this.checkpoints = [false, false, false];

            if (this.lap > this.totalLaps) {
                this.finished = true;
                this.finishTime = performance.now() - gameStartTime;
                endGame();
            }
        }
    }

    checkCheckpoint(num) {
        if (!this.checkpoints[num]) {
            this.checkpoints[num] = true;
        }
    }
}

// Carros inimigos
class Opponent {
    constructor(color, startX, skill) {
        this.x = startX;
        this.z = 0;
        this.speed = 0;
        this.maxSpeed = 320 + skill * 15;
        this.angle = 0;
        this.color = color;
        this.skill = skill;
        this.finished = false;
    }

    update(dt, playerZ) {
        if (this.finished) {
            this.speed *= 0.95;
            return;
        }

        // IA simples
        const targetSpeed = this.maxSpeed * (0.85 + Math.random() * 0.15);
        if (this.speed < targetSpeed) {
            this.speed += 0.5;
        }

        // Seguir a pista com alguma variação
        const trackCenter = Math.sin(this.z * 0.001) * 200;
        if (this.x < trackCenter - 50) {
            this.angle += 0.02;
        } else if (this.x > trackCenter + 50) {
            this.angle -= 0.02;
        }

        // Evitar o jogador
        const distZ = Math.abs(this.z - playerZ);
        const distX = Math.abs(this.x - player.x);
        if (distZ < 200 && distX < 100) {
            if (this.x < player.x) {
                this.angle -= 0.03;
            } else {
                this.angle += 0.03;
            }
        }

        // Atualizar posição
        const moveSpeed = this.speed * 0.15;
        this.x += Math.sin(this.angle) * moveSpeed;
        this.z += Math.cos(this.angle) * moveSpeed;

        // Limites
        const trackWidth = 800;
        if (this.x > trackWidth / 2 - 50) {
            this.x = trackWidth / 2 - 50;
            this.angle -= 0.05;
        }
        if (this.x < -trackWidth / 2 + 50) {
            this.x = -trackWidth / 2 + 50;
            this.angle += 0.05;
        }

        // Voltas
        const trackLength = 15000;
        if (this.z > trackLength) {
            this.z -= trackLength;
            this.lap = (this.lap || 1) + 1;
            if (this.lap > 3) {
                this.finished = true;
            }
        }
        if (this.z < 0) {
            this.z += trackLength;
        }
    }
}

// Pista
const trackSegments = [];
const segmentLength = 100;
const totalSegments = 100;

function generateTrack() {
    trackSegments.length = 0;
    for (let i = 0; i < totalSegments; i++) {
        const progress = i / totalSegments;
        trackSegments.push({
            x: Math.sin(progress * Math.PI * 4) * 300,
            y: Math.sin(progress * Math.PI * 8) * 50,
            z: i * segmentLength,
            curve: Math.sin(progress * Math.PI * 4) * 0.02,
            color: i % 2 === 0 ? '#3a3a3a' : '#4a4a4a'
        });
    }
}

// Instâncias
let player;
let opponents = [];
let gameStartTime = 0;
let particles = [];

// Sistema de partículas para nitro e efeitos
class Particle {
    constructor(x, y, z, color, life) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.vz = (Math.random() - 0.5) * 10;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        this.life -= dt;
    }

    isDead() {
        return this.life <= 0;
    }
}

function spawnParticles(x, y, z, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, z, color, 500 + Math.random() * 500));
    }
}

// Renderização pseudo-3D estilo DOOM
function render() {
    // Limpar tela com gradiente estilo DOOM
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    skyGradient.addColorStop(0, '#2a0a0a');
    skyGradient.addColorStop(1, '#4a1a1a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    const groundGradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
    groundGradient.addColorStop(0, '#1a0a0a');
    groundGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // Horizonte com efeito de neblina
    ctx.fillStyle = 'rgba(60, 20, 20, 0.5)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    // Calcular projeção 3D
    const fov = 800;
    const cameraHeight = 150;
    const horizonY = canvas.height / 2;

    // Ordenar segmentos por Z (do mais distante para o mais próximo)
    const sortedSegments = [...trackSegments].sort((a, b) => {
        const distA = Math.abs(a.z - player.z);
        const distB = Math.abs(b.z - player.z);
        return distB - distA;
    });

    // Renderizar pista
    sortedSegments.forEach((segment, index) => {
        // Calcular distância relativa considerando loop da pista
        let relZ = segment.z - player.z;
        if (relZ < 0) relZ += totalSegments * segmentLength;
        
        if (relZ < 100 || relZ > 3000) return;

        // Projeção 3D
        const scale = fov / relZ;
        const screenX = canvas.width / 2 + (segment.x - player.x) * scale;
        const screenY = horizonY + (segment.y + cameraHeight) * scale;
        const screenWidth = 800 * scale;
        const screenHeight = segmentLength * scale * 0.5;

        // Cor com neblina
        const fogFactor = Math.min(relZ / 3000, 1);
        const r = Math.floor(58 + (26 - 58) * fogFactor);
        const g = Math.floor(58 + (26 - 58) * fogFactor);
        const b = Math.floor(58 + (26 - 58) * fogFactor);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // Desenhar segmento
        ctx.beginPath();
        ctx.moveTo(screenX - screenWidth / 2, screenY);
        ctx.lineTo(screenX + screenWidth / 2, screenY);
        ctx.lineTo(screenX + screenWidth / 2, screenY + screenHeight);
        ctx.lineTo(screenX - screenWidth / 2, screenY + screenHeight);
        ctx.closePath();
        ctx.fill();

        // Bordas da pista (vermelhas estilo DOOM)
        ctx.fillStyle = `rgba(139, 0, 0, ${1 - fogFactor})`;
        ctx.fillRect(screenX - screenWidth / 2 - 10 * scale, screenY, 10 * scale, screenHeight);
        ctx.fillRect(screenX + screenWidth / 2, screenY, 10 * scale, screenHeight);
    });

    // Renderizar oponentes
    opponents.forEach(opp => {
        let relZ = opp.z - player.z;
        if (relZ < 0) relZ += totalSegments * segmentLength;
        
        if (relZ > 0 && relZ < 2000) {
            const scale = fov / relZ;
            const screenX = canvas.width / 2 + (opp.x - player.x) * scale;
            const screenY = horizonY + cameraHeight * scale;
            const carWidth = 80 * scale;
            const carHeight = 50 * scale;

            // Desenhar carro inimigo
            ctx.fillStyle = opp.color;
            ctx.fillRect(screenX - carWidth / 2, screenY - carHeight, carWidth, carHeight);
            
            // Detalhes do carro
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX - carWidth / 4, screenY - carHeight * 0.8, carWidth / 2, carHeight * 0.3);
        }
    });

    // Efeitos de nitro
    if (player.nitroActive && player.nitro > 0) {
        spawnParticles(player.x - 30, 50, player.z, '#00ffff', 2);
        spawnParticles(player.x + 30, 50, player.z, '#00ffff', 2);
    }

    // Renderizar partículas
    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => {
        let relZ = p.z - player.z;
        if (relZ < 0) relZ += totalSegments * segmentLength;
        
        if (relZ > 0 && relZ < 1500) {
            const scale = fov / relZ;
            const screenX = canvas.width / 2 + (p.x - player.x) * scale;
            const screenY = horizonY + (p.y + cameraHeight) * scale;
            const alpha = p.life / p.maxLife;
            
            ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.arc(screenX, screenY, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Efeito de velocidade (motion blur nas bordas)
    if (player.speed > 200) {
        const blurIntensity = (player.speed - 200) / 100;
        ctx.fillStyle = `rgba(139, 0, 0, ${blurIntensity * 0.3})`;
        ctx.fillRect(0, 0, 50, canvas.height);
        ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
    }
}

function updateHUD() {
    speedValue.textContent = Math.floor(player.speed);
    nitroFill.style.width = `${player.nitro}%`;
    
    if (player.nitro < 30) {
        nitroFill.style.background = 'linear-gradient(90deg, #ff0000, #ff6600)';
    } else {
        nitroFill.style.background = 'linear-gradient(90deg, #0066ff, #00ccff, #00ffff)';
    }

    currentLapEl.textContent = `VOLTA ${Math.min(player.lap, player.totalLaps)}/${player.totalLaps}`;
    
    const minutes = Math.floor(player.lapTime / 60000);
    const seconds = Math.floor((player.lapTime % 60000) / 1000);
    const ms = Math.floor((player.lapTime % 1000) / 10);
    lapTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;

    if (player.bestLap !== Infinity) {
        const bestMin = Math.floor(player.bestLap / 60000);
        const bestSec = Math.floor((player.bestLap % 60000) / 1000);
        const bestMs = Math.floor((player.bestLap % 1000) / 10);
        bestLapEl.textContent = `MELHOR: ${bestMin.toString().padStart(2, '0')}:${bestSec.toString().padStart(2, '0')}.${bestMs.toString().padStart(2, '0')}`;
    }

    // Calcular posição
    let position = 1;
    opponents.forEach(opp => {
        const oppLap = opp.lap || 1;
        if (oppLap > player.lap || (oppLap === player.lap && opp.z > player.z)) {
            position++;
        }
    });
    player.position = position;
    
    const suffix = position === 1 ? 'º' : 'º';
    posValue.textContent = `${position}${suffix}`;
    posValue.style.color = position === 1 ? '#00ff00' : '#ff4444';
}

function update(dt) {
    if (gameState !== 'playing') return;

    player.update(dt);
    
    opponents.forEach(opp => {
        opp.update(dt, player.z);
    });

    updateHUD();
}

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState === 'playing') {
        update(dt);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'playing';
    startMenu.classList.remove('active');
    hud.style.display = 'block';
    
    player = new Player();
    opponents = [
        new Opponent('#8b0000', -200, 0.7),
        new Opponent('#0066cc', 200, 0.8),
        new Opponent('#00aa00', -100, 0.9),
        new Opponent('#cc6600', 100, 0.85)
    ];
    
    generateTrack();
    particles = [];
    gameStartTime = performance.now();
    lastTime = performance.now();
    
    requestAnimationFrame(gameLoop);
}

function pauseGame() {
    gameState = 'paused';
    pauseMenu.classList.add('active');
}

function resumeGame() {
    gameState = 'playing';
    pauseMenu.classList.remove('active');
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOverMenu.classList.remove('active');
    pauseMenu.classList.remove('active');
    startGame();
}

function endGame() {
    gameState = 'gameover';
    hud.style.display = 'none';
    gameOverMenu.classList.add('active');
    
    const totalMin = Math.floor(player.finishTime / 60000);
    const totalSec = Math.floor((player.finishTime % 60000) / 1000);
    const totalMs = Math.floor((player.finishTime % 1000) / 10);
    totalTimeEl.textContent = `${totalMin.toString().padStart(2, '0')}:${totalSec.toString().padStart(2, '0')}.${totalMs.toString().padStart(2, '0')}`;

    if (player.bestLap !== Infinity) {
        const bestMin = Math.floor(player.bestLap / 60000);
        const bestSec = Math.floor((player.bestLap % 60000) / 1000);
        const bestMs = Math.floor((player.bestLap % 1000) / 10);
        finalBestLapEl.textContent = `${bestMin.toString().padStart(2, '0')}:${bestSec.toString().padStart(2, '0')}.${bestMs.toString().padStart(2, '0')}`;
    } else {
        finalBestLapEl.textContent = '--:--.--';
    }

    const suffix = player.position === 1 ? 'º' : 'º';
    finalPositionEl.textContent = `${player.position}${suffix}`;
}

// Adicionar scanlines para efeito retro
const scanlines = document.createElement('div');
scanlines.className = 'scanlines';
document.body.appendChild(scanlines);

console.log('🏁 NITRO DOOM RACING - Pronto para correr! 🏁');