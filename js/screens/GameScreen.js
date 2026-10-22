// =================================================================
// ARCHIVO: js/screen/GameScreen.js (COMPLETO)
// =================================================================

class Goblin {
    constructor(path) {
        this.path = path;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.speed = 60; // Píxeles por segundo

        this.hp = 100;
        this.maxHp = 100;
        this.cost = 25;
        this.reachedEnd = false;

        // Carga de la hoja de sprites desde assets
        this.sprite = new Image();
        this.sprite.src = 'assets/images/goblin_spritesheet.png';

        this.totalFrames = 4;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // FPS de la animación

        this.width = 48;
        this.height = 48;
    }

    update(deltaTime) {
        // Movimiento por el camino
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

        // Animación de fotogramas
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 1 / this.animationSpeed) {
            this.animationTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
    }

    draw(ctx) {
        // Si la imagen cargó, recortar frame de la hoja
        if (this.sprite.complete && this.sprite.naturalWidth > 0) {
            const frameWidth = this.sprite.naturalWidth / this.totalFrames;
            const frameHeight = this.sprite.naturalHeight;

            ctx.drawImage(
                this.sprite,
                this.currentFrame * frameWidth, 0,
                frameWidth, frameHeight,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width, this.height
            );
        } else {
            // Círculo provisional por si tarda en descargar
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 16, 0, Math.PI * 2);
            ctx.fill();
        }

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

class GameScreen {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = performance.now();

        this.mana = 150;
        this.maxMana = 150;
        this.manaRegenRate = 12;

        this.units = [];

        // Puntos del camino para la oleada
        this.path = [
            { x: 50, y: 480 },
            { x: 50, y: 180 },
            { x: 310, y: 180 },
            { x: 310, y: 40 }
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
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Regeneración de Mana
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegenRate * deltaTime);
        }

        // Actualizar posiciones
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];
            unit.update(deltaTime);
            if (unit.reachedEnd) {
                this.units.splice(i, 1);
            }
        }

        this.draw();
        requestAnimationFrame((time) => this.update(time));
    }

    draw() {
        // Limpiar pantalla y dibujar mapa
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawPath();
        this.units.forEach(unit => unit.draw(this.ctx));
        this.drawUI();
    }

    drawPath() {
        // Borde exterior del camino
        this.ctx.strokeStyle = '#0f172a';
        this.ctx.lineWidth = 38;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();

        // Sendero de tierra
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 30;
        this.ctx.stroke();
    }

    drawUI() {
        // Barra de Mana superior
        const barWidth = 200;
        const barHeight = 16;
        const x = (this.canvas.width - barWidth) / 2;
        const y = 12;

        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        this.ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        const manaRatio = this.mana / this.maxMana;
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(x, y, barWidth * manaRatio, barHeight);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`MANA: ${Math.floor(this.mana)} / ${this.maxMana}`, this.canvas.width / 2, y + 12);
    }

    initLoop() {
        requestAnimationFrame((time) => this.update(time));
    }
}
