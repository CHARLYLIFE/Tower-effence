class GameScreen {
  enter() {
    this.backButton = { x: 15, y: 15, w: 70, h: 30 };
    
    // Recursos
    this.mana = 100;
    this.maxMana = 150;
    this.manaRegen = 8; // Regeneración moderada
    this.enemyGold = 0;
    this.score = 0;

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
    this.projectiles = [];

    // Parcelas y Torres Enemigas
    this.plots = [
      { id: 1, x: 140, y: 530, level: 1, type: 'Arquero', range: 80, damage: 14, attackCooldown: 0, cooldownMax: 0.7, costNext: 35 },
      { id: 2, x: 60,  y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 1.0, costNext: 30 },
      { id: 3, x: 220, y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 1.0, costNext: 45 },
      { id: 4, x: 140, y: 140, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 0.8, costNext: 55 }
    ];

    // UI: Dos botones de tropas abajo (Duende y Orco Tanque)
    this.spawnGoblinBtn = { x: 15,  y: 565, w: 150, h: 55 };
    this.spawnOrcBtn    = { x: 195, y: 565, w: 150, h: 55 };

    this.goblinCost = 20;
    this.orcCost = 45;
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
            this.score++; // ¡Invasión exitosa!
            this.troops.splice(i, 1);
            continue;
          }
        } else {
          t.x += (dx / dist) * t.speed * dt;
          t.y += (dy / dist) * t.speed * dt;
        }
      }

      if (t.hp <= 0) {
        this.enemyGold += t.bounty; // Recompensa para la IA según la tropa
        this.troops.splice(i, 1);
      }
    }

    // 3. Ataque de Torres Enemigas
    this.plots.forEach(plot => {
      if (plot.level > 0) {
        if (plot.attackCooldown > 0) {
          plot.attackCooldown -= dt;
        }

        let closestTroop = null;
        let minDistance = plot.range;

        this.troops.forEach(t => {
          const dist = Math.hypot(t.x - plot.x, t.y - plot.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestTroop = t;
          }
        });

        if (closestTroop && plot.attackCooldown <= 0) {
          plot.attackCooldown = plot.cooldownMax;
          this.projectiles.push({
            x: plot.x,
            y: plot.y,
            target: closestTroop,
            speed: 250,
            damage: plot.damage,
            color: plot.type === 'Arquero' ? '#fde047' : '#c084fc'
          });
        }
      }
    });

    // 4. Proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (!this.troops.includes(p.target)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        p.target.hp -= p.damage;
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    // 5. IA Enemiga expansión
    this.plots.forEach(plot => {
      if (this.enemyGold >= plot.costNext) {
        this.enemyGold -= plot.costNext;
        plot.level++;
        if (plot.level === 1) {
          plot.type = plot.id % 2 === 0 ? 'Mago' : 'Arquero';
          plot.range = 80;
          plot.damage = plot.type === 'Arquero' ? 14 : 22;
        } else {
          plot.range += 15;
          plot.damage += 8;
        }
        plot.costNext = Math.floor(plot.costNext * 1.6);
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

    // 3. Base Enemiga
    const base = this.path[this.path.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(base.x, base.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Parcelas y Torres
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

    // 5. Tropas
    this.troops.forEach(t => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(t.x, t.y + 6, t.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Barra de vida
      ctx.fillStyle = '#000000';
      ctx.fillRect(t.x - 12, t.y - t.radius - 10, 24, 4);
      ctx.fillStyle = '#22c55e';
      const hpWidth = Math.max(0, (t.hp / t.maxHp) * 24);
      ctx.fillRect(t.x - 12, t.y - t.radius - 10, hpWidth, 4);
    });

    // 6. Proyectiles
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

    // Botón Duende (Verde)
    ctx.fillStyle = this.mana >= this.goblinCost ? '#10b981' : '#334155';
    ctx.fillRect(this.spawnGoblinBtn.x, this.spawnGoblinBtn.y, this.spawnGoblinBtn.w, this.spawnGoblinBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DUENDE`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 24);
    ctx.font = '10px sans-serif';
    ctx.fillText(`Costo: ${this.goblinCost} 💧`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 42);

    // Botón Orco Tanque (Naranja/Marrón)
    ctx.fillStyle = this.mana >= this.orcCost ? '#d97706' : '#334155';
    ctx.fillRect(this.spawnOrcBtn.x, this.spawnOrcBtn.y, this.spawnOrcBtn.w, this.spawnOrcBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ORCO TANQUE`, this.spawnOrcBtn.x + 75, this.spawnOrcBtn.y + 24);
    ctx.font = '10px sans-serif';
    ctx.fillText(`Costo: ${this.orcCost} 💧`, this.spawnOrcBtn.x + 75, this.spawnOrcBtn.y + 42);
  }

  handleTouch(x, y) {
    const btn = this.backButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('menu');
      return;
    }

    // Invocar Duende (Rápido, económico, frágil)
    const gBtn = this.spawnGoblinBtn;
    if (x >= gBtn.x && x <= gBtn.x + gBtn.w && y >= gBtn.y && y <= gBtn.y + gBtn.h) {
      if (this.mana >= this.goblinCost) {
        this.mana -= this.goblinCost;

        this.troops.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 1,
          speed: 75,
          hp: 25,
          maxHp: 25,
          radius: 8,
          color: '#22c55e',
          bounty: 15
        });
      }
    }

    // Invocar Orco Tanque (Lento, resistente, absorbe daño)
    const oBtn = this.spawnOrcBtn;
    if (x >= oBtn.x && x <= oBtn.x + oBtn.w && y >= oBtn.y && y <= oBtn.y + oBtn.h) {
      if (this.mana >= this.mana >= 0 && this.mana >= this.orcCost) {
        this.mana -= this.orcCost;

        this.troops.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 1,
          speed: 45,
          hp: 90,
          maxHp: 90,
          radius: 12,
          color: '#b45309',
          bounty: 35
        });
      }
    }
  }

  exit() {}
}
