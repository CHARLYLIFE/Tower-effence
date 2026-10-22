class GameScreen {
  enter() {
    this.backButton = { x: 15, y: 15, w: 70, h: 30 };
    
    // Recursos
    this.mana = 100;
    this.maxMana = 100;
    this.manaRegen = 12;
    this.enemyGold = 0;
    this.score = 0; // Invasiones exitosas

    // Camino Táctico
    this.path = [
      { x: 180, y: 600 },
      { x: 180, y: 460 },
      { x: 100, y: 380 },
      { x: 100, y: 260 },
      { x: 180, y: 180 },
      { x: 180, y: 100 }  // Base Enemiga (Meta)
    ];

    this.troops = [];
    this.projectiles = []; // Proyectiles disparados por las torres

    // Parcelas y Torres Enemigas
    this.plots = [
      { id: 1, x: 140, y: 530, level: 1, type: 'Arquero', range: 75, damage: 8, attackCooldown: 0, cooldownMax: 0.8, costNext: 40 },
      { id: 2, x: 60,  y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0, attackCooldown: 0, cooldownMax: 1.2, costNext: 30 },
      { id: 3, x: 220, y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0, attackCooldown: 0, cooldownMax: 1.0, costNext: 45 },
      { id: 4, x: 140, y: 140, level: 0, type: 'Vacío',   range: 0,  damage: 0, attackCooldown: 0, cooldownMax: 1.0, costNext: 60 }
    ];

    // UI
    this.spawnGoblinBtn = { x: 15,  y: 565, w: 150, h: 55 };
    this.upgradeManaBtn = { x: 195, y: 565, w: 150, h: 55 };

    this.goblinLevel = 1;
    this.goblinCost = 20;
  }

  update(dt) {
    // 1. Regenerar maná
    if (this.mana < this.maxMana) {
      this.mana += this.manaRegen * dt;
      if (this.mana > this.maxMana) this.mana = this.maxMana;
    }

    // 2. Mover tropas
    for (let i = this.troops.length - 1; i >= 0; i--) {
      const t = this.troops[i];
      const targetNode = this.path[t.pathIndex];

      if (targetNode) {
        const dx = targetNode.x - t.x;
        const dy = targetNode.y - t.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 3) {
          t.pathIndex++;
          if (t.pathIndex >= this.path.length) {
            // ¡Tropa enemiga superó las defensas!
            this.score++;
            this.troops.splice(i, 1);
            continue;
          }
        } else {
          t.x += (dx / dist) * t.speed * dt;
          t.y += (dy / dist) * t.speed * dt;
        }
      }

      // Si la vida de la tropa llega a 0, muere
      if (t.hp <= 0) {
        this.enemyGold += 15; // Recompensa para la IA
        this.troops.splice(i, 1);
      }
    }

    // 3. Lógica de Torres Enemigas (Ataque y Cooldown)
    this.plots.forEach(plot => {
      if (plot.level > 0) {
        // Reducir cooldown de disparo
        if (plot.attackCooldown > 0) {
          plot.attackCooldown -= dt;
        }

        // Buscar la tropa más cercana dentro de su rango
        let closestTroop = null;
        let minDistance = plot.range;

        this.troops.forEach(t => {
          const dist = Math.hypot(t.x - plot.x, t.y - plot.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestTroop = t;
          }
        });

        // Si hay objetivo y la torre puede disparar
        if (closestTroop && plot.attackCooldown <= 0) {
          plot.attackCooldown = plot.cooldownMax; // Reiniciar cooldown

          // Crear proyectil dirigido a la tropa
          this.projectiles.push({
            x: plot.x,
            y: plot.y,
            target: closestTroop,
            speed: 220,
            damage: plot.damage,
            color: plot.type === 'Arquero' ? '#fde047' : '#c084fc'
          });
        }
      }
    });

    // 4. Actualizar Proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Si la tropa objetivo murió mientras el proyectil viajaba, desviar o eliminar
      if (!this.troops.includes(p.target)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        // Impacto en la tropa
        p.target.hp -= p.damage;
        this.projectiles.splice(i, 1);
      } else {
        // Perseguir a la tropa en movimiento
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    // 5. IA Enemiga: expansión y mejora de torres según oro acumulado
    this.plots.forEach(plot => {
      if (this.enemyGold >= plot.costNext) {
        this.enemyGold -= plot.costNext;
        plot.level++;
        if (plot.level === 1) {
          plot.type = plot.id % 2 === 0 ? 'Mago' : 'Arquero';
          plot.range = 75;
          plot.damage = plot.type === 'Arquero' ? 8 : 14;
        } else {
          plot.range += 12;
          plot.damage += 6; // Torres más fuertes al subir nivel
        }
        plot.costNext = Math.floor(plot.costNext * 1.7);
      }
    });
  }

  render(ctx) {
    // 1. Fondo
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 360, 640);

    // 2. Camino
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.path.forEach((pt, index) => {
      if (index === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Base Enemiga (Meta)
    const base = this.path[this.path.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(base.x, base.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Parcelas y Torres Enemigas
    this.plots.forEach(p => {
      if (p.level === 0) {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIBRE', p.x, p.y + 3);
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.range, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.type === 'Arquero' ? '#eab308' : '#a855f7';
        ctx.fillRect(p.x - 14, p.y - 14, 28, 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.type} L${p.level}`, p.x, p.y - 18);
      }
    });

    // 5. Tropas Activas y sus Barras de Vida
    this.troops.forEach(t => {
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(t.x, t.y + 6, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini barra de vida sobre la tropa
      ctx.fillStyle = '#000000';
      ctx.fillRect(t.x - 10, t.y - 18, 20, 4);
      ctx.fillStyle = '#22c55e';
      const hpWidth = Math.max(0, (t.hp / t.maxHp) * 20);
      ctx.fillRect(t.x - 10, t.y - 18, hpWidth, 4);
    });

    // 6. Proyectiles en el aire
    this.projectiles.forEach(pr => {
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. UI Superior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 360, 60);

    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENÚ', this.backButton.x + 35, this.backButton.y + 20);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`💧 ${Math.floor(this.mana)}`, 160, 36);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`👑 ${Math.floor(this.enemyGold)}`, 255, 36);

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`🎯 ${this.score}`, 345, 36);

    // 8. Panel Inferior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 540, 360, 100);

    ctx.fillStyle = this.mana >= this.goblinCost ? '#10b981' : '#334155';
    ctx.fillRect(this.spawnGoblinBtn.x, this.spawnGoblinBtn.y, this.spawnGoblinBtn.w, this.spawnGoblinBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DUENDE Lvl ${this.goblinLevel}`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 24);
    ctx.font = '10px sans-serif';
    ctx.fillText(`Costo: ${this.goblinCost} 💧`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 42);

    ctx.fillStyle = this.mana >= 50 ? '#8b5cf6' : '#334155';
    ctx.fillRect(this.upgradeManaBtn.x, this.upgradeManaBtn.y, this.upgradeManaBtn.w, this.upgradeManaBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+REGEN MANÁ', this.upgradeManaBtn.x + 75, this.upgradeManaBtn.y + 24);
    ctx.font = '10px sans-serif';
    ctx.fillText('Costo: 50 💧', this.upgradeManaBtn.x + 75, this.upgradeManaBtn.y + 42);
  }

  handleTouch(x, y) {
    const btn = this.backButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('menu');
      return;
    }

    const gBtn = this.spawnGoblinBtn;
    if (x >= gBtn.x && x <= gBtn.x + gBtn.w && y >= gBtn.y && y <= gBtn.y + gBtn.h) {
      if (this.mana >= this.goblinCost) {
        this.mana -= this.goblinCost;

        // Instanciar Duende con barra de vida
        this.troops.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 1,
          speed: 70,
          hp: 40,
          maxHp: 40,
          color: '#22c55e'
        });
      }
    }

    const mBtn = this.upgradeManaBtn;
    if (x >= mBtn.x && x <= mBtn.x + mBtn.w && y >= mBtn.y && y <= mBtn.y + mBtn.h) {
      if (this.mana >= 50) {
        this.mana -= 50;
        this.manaRegen += 6;
      }
    }
  }

  exit() {}
}
