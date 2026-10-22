// =================================================================
// ARCHIVO: js/GameScreen.js (COMPLETO)
// Sistema de Juego, Canvas, Unidades Animadas y Economía
// =================================================================

// --- CLASE UNIDAD: GOBLIN (DUENDE ANIMADO) ---
class Goblin {
    constructor(path) {
        // Posición e inicio en el camino
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.speed = 60; // Píxeles por segundo

        // Atributos de juego
        this.hp = 100;
        this.maxHp = 100;
        this.cost = 25;
        this.reachedEnd = false;

        // Carga de la imagen de sprites
        this.sprite = new Image();
        this.sprite.src = 'assets/images/goblin_spritesheet.png'; // Ruta en tu GitHub

        // Configuración de animación (Sprite Sheet 4x1)
        this.totalFrames = 4;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // Fotogramas por segundo

        // Dimensiones del personaje en pantalla
        this.width = 48;
        this.height = 48;
    }

    update(deltaTime) {
        // 1. Movimiento por los puntos del camino
        if (this.pathIndex < this.path.length - 1) {
            const target = this.path[this.pathIndex + 1];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 3) {
                this.pathIndex++;
            } else {
                this.x += (dx / distance) * this.speed * deltaTime;
                this.y += (dy / distance) * this.speed * deltaTime;
            }
        } else {
            this.reachedEnd = true;
        }

        // 2. Animación de fotogramas
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 1 / this.animationSpeed) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
    }

    draw(ctx) {
        // Renderizado del sprite animado si la imagen ya cargó
        if (this.sprite.complete && this.sprite.naturalWidth !== 0) {
            const frameWidth = this.sprite.naturalWidth / this.totalFrames;
            const frameHeight = this.sprite.naturalHeight;

            ctx.drawImage(
                this.sprite,
                this.currentFrame * frameWidth, 0, // Recorte X, Y en la hoja
                frameWidth, frameHeight,           // Ancho y alto de 1 frame
                this.x - this.width / 2,           // Posición X en Canvas (centrado)
                this.y - this.height / 2,          // Posición Y en Canvas (centrado)
                this.width, this.height            // Tamaño final renderizado
            );
        } else {
            // Respaldo de color por si tarda en cargar
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 16, 0, Math.PI * 2);
            ctx.fill();
        }

        // Barra de vida superior
        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = 32;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 8;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, barWidth, barHeight);

        const healthRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = healthRatio > 0.5 ? '#22c55e' : '#ef4444';
        ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
    }
}

// --- CLASE PRINCIPAL DEL JUEGO ---
class GameScreen {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = performance.now();

        // Sistema de Mana y Economía
        this.mana = 150;
        this.maxMana = 150;
        this.manaRegenRate = 12; // Mana recuperado por segundo

        // Lista de unidades en pantalla
        this.units = [];

        // Camino del mapa (Puntos tácticos)
        this.path = [
            { x: 40, y: 550 },
            { x: 40, y: 200 },
            { x: 320, y: 200 },
            { x: 320, y: 50 }
        ];

        this.initLoop();
    }

    spawnGoblin() {
        const goblinCost = 25;
        if (this.mana >= goblinCost) {
            this.mana -= goblinCost;
            this.units.push(new Goblin(this.path));
        }
    }

    update(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Regeneración continua de Mana
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegenRate * deltaTime);
        }

        // Actualizar unidades y eliminar las que llegaron al final
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];
            unit.update(deltaTime);
            if (unit.reachedEnd) {
                this.units.splice(i, 1);
            }
        }

        // Dibujar frame
        this.draw();

        requestAnimationFrame((time) => this.update(time));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Dibujar el Camino
        this.drawPath();

        // 2. Dibujar Unidades Animadas
        this.units.forEach(unit => unit.draw(this.ctx));

        // 3. Dibujar Interfaz de Mana (HUD)
        this.drawUI();
    }

    drawPath() {
        this.ctx.strokeStyle = '#2a323d';
        this.ctx.lineWidth = 36;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();

        // Borde interno del camino
        this.ctx.strokeStyle = '#3b4252';
        this.ctx.lineWidth = 30;
        this.ctx.stroke();
    }

    drawUI() {
        // Barra de Mana en la parte superior
        const barWidth = 200;
        const barHeight = 16;
        const x = (this.canvas.width - barWidth) / 2;
        const y = 15;

        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        this.ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // Relleno de Mana
        const manaRatio = this.mana / this.maxMana;
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(x, y, barWidth * manaRatio, barHeight);

        // Texto de Mana
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`MANA: ${Math.floor(this.mana)} / ${this.maxMana}`, this.canvas.width / 2, y + 12);
    }

    initLoop() {
        requestAnimationFrame((time) => this.update(time));
    }
}
