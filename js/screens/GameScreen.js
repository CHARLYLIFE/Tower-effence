class GameScreen {
  enter() {
    this.backButton = { x: 15, y: 15, w: 70, h: 30 };
    
    // Recursos
    this.mana = 100;
    this.maxMana = 150;
    this.manaRegen = 8;
    this.enemyGold = 0;
    this.score = 0;

    // Camino Táctico Detallado
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

    // Parcelas y Torres Enemigas Estilizadas
    this.plots = [
      { id: 1, x: 140, y: 530, level: 1, type: 'Arquero', range: 80, damage: 14, attackCooldown: 0, cooldownMax: 0.7, costNext: 35 },
      { id: 2, x: 60,  y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 1.0, costNext: 30 },
      { id: 3, x: 220, y: 320, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 1.0, costNext: 45 },
      { id: 4, x: 140, y: 140, level: 0, type: 'Vacío',   range: 0,  damage: 0,  attackCooldown: 0, cooldownMax: 0.8, costNext: 55 }
    ];

    // UI Inferior
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

    // 2. Mover tropas con animación de paso
    for (let i = this.troops.length - 1; i >= 0; i--) {
      const t = this.troops[i];
      const targetNode = this.path[t.pathIndex];

      // Animación de rebote al caminar
      t.animTime += dt * 12;

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
        this.enemyGold += t.bounty;
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
            speed: 260,
            damage: plot.damage,
            color: plot.type === 'Arquero' ? '#fde047' : '#e879f9'
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
    // 1. Fondo Texturizado del Terreno
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 360, 640);

    // Detalles sutiles de pasto/terreno táctico
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(15, 75, 330, 450);

    // 2. Camino Táctico con Bordes Elegantes
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.path.forEach((pt, index) => {
      if (index === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 36;
    ctx.stroke();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    this.path.forEach((pt, index) => {
      if (index === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Resetear guiones

    // 3. Base Enemiga (El Castillo del Reino)
    const base = this.path[this.path.length - 1];
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(base.x - 24, base.y - 24, 48, 48);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(base.x - 18, base.y - 18, 36, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CASTILLO', base.x, base.y + 4);

    // 4. Parcelas y Torres Estilizadas
    this.plots.forEach(p => {
      if (p.level === 0) {
        // Cimiento / Parcela Vacía Pro
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LOTE', p.x, p.y + 3);
      } else {
        // Rango de Ataque traslúcido elegante
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Base de la Torre
        ctx.fillStyle = '#334155';
        ctx.fillRect(p.x - 16, p.y - 16, 32, 32);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 16, p.y - 16, 32, 32);

        // Núcleo de la Torre (Arquero o Mago)
        ctx.fillStyle = p.type === 'Arquero' ? '#eab308' : '#a855f7';
        ctx.fillRect(p.x - 10, p.y - 10, 20, 20);

        // Etiqueta de Nivel Pro
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.type[0]} L${p.level}`, p.x, p.y - 20);
      }
    });

    // 5. Tropas Animadas con Arte Vectorial Pro
    this.troops.forEach(t => {
      // Sombra dinámica bajo la unidad
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(t.x, t.y + 8, t.radius, t.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rebote vertical al caminar basado en animTime
      const bounce = Math.sin(t.animTime) * 2;
      const drawY = t.y + bounce;

      if (t.type === 'goblin') {
        // --- DUENDE VECTORES PRO ---
        ctx.fillStyle = '#15803d'; // Cuerpo verde oscuro
        ctx.beginPath();
        ctx.arc(t.x, drawY, t.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e'; // Cabeza / Casco
        ctx.beginPath();
        ctx.arc(t.x, drawY - 4, t.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // --- ORCO TANQUE VECTORES PRO ---
        ctx.fillStyle = '#78350f'; // Armadura marrón pesada
        ctx.beginPath();
        ctx.arc(t.x, drawY, t.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#b45309'; // Cuerpo robusto
        ctx.beginPath();
        ctx.arc(t.x, drawY - 2, t.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Borde brillante de unidad
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Barra de vida elegante estilo RPG
      ctx.fillStyle = '#020617';
      ctx.fillRect(t.x - 14, drawY - t.radius - 12, 28, 5);
      ctx.fillStyle = '#22c55e';
      const hpWidth = Math.max(0, (t.hp / t.maxHp) * 28);
      ctx.fillRect(t.x - 14, drawY - t.radius - 12, hpWidth, 5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(t.x - 14, drawY - t.radius - 12, 28, 5);
    });

    // 6. Proyectiles con estela luminosa
    this.projectiles.forEach(pr => {
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 7. Interfaz Superior (HUD Profesional)
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 360, 60);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(360, 60);
    ctx.stroke();

    // Botón MENÚ
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENÚ', this.backButton.x + 35, this.backButton.y + 20);

    // Recursos HUD
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`💧 ${Math.floor(this.mana)}`, 165, 36);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`👑 ${Math.floor(this.enemyGold)}`, 260, 36);

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`🎯 ${this.score}`, 345, 36);

    // 8. Panel Inferior Táctico (Botones de Invocación Pro)
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 540, 360, 100);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 540);
    ctx.lineTo(360, 540);
    ctx.stroke();

    // Botón Duende
    ctx.fillStyle = this.mana >= this.goblinCost ? '#059669' : '#1e293b';
    ctx.fillRect(this.spawnGoblinBtn.x, this.spawnGoblinBtn.y, this.spawnGoblinBtn.w, this.spawnGoblinBtn.h);
    ctx.strokeStyle = this.mana >= this.goblinCost ? '#34d399' : '#475569';
    ctx.strokeRect(this.spawnGoblinBtn.x, this.spawnGoblinBtn.y, this.spawnGoblinBtn.w, this.spawnGoblinBtn.h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ DUENDE`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 22);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Costo: ${this.goblinCost} Maná`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 40);

    // Botón Orco Tanque
    ctx.fillStyle = this.mana >= this.orcCost ? '#b45309' : '#1e293b';
    ctx.fillRect(this.spawnOrcBtn.x, this.spawnOrcBtn.y, this.spawnOrcBtn.w, this.spawnOrcBtn.h);
    ctx.strokeStyle = this.mana >= this.orcCost ? '#fbbf24' : '#475569';
    ctx.strokeRect(this.spawnOrcBtn.x, this.spawnOrcBtn.y, this.spawnOrcBtn.w, this.spawnOrcBtn.h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🛡️ ORCO TANQUE`, this.spawnOrcBtn.x + 75, this.spawnOrcBtn.y + 22);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Costo: ${this.orcCost} Maná`, this.spawnOrcBtn.x + 75, this.spawnOrcBtn.y + 40);
  }

  handleTouch(x, y) {
    const btn = this.backButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('menu');
      return;
    }

    // Invocar Duende
    const gBtn = this.spawnGoblinBtn;
    if (x >= gBtn.x && x <= gBtn.x + gBtn.w && y >= gBtn.y && y <= gBtn.y + gBtn.h) {
      if (this.mana >= this.goblinCost) {
        this.mana -= this.goblinCost;

        this.troops.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 1,
          speed: 75,
          hp: 30,
          maxHp: 30,
          radius: 8,
          type: 'goblin',
          animTime: Math.random() * 10,
          bounty: 15
        });
      }
    }

    // Invocar Orco Tanque
    const oBtn = this.spawnOrcBtn;
    if (x >= oBtn.x && x <= oBtn.x + oBtn.w && y >= oBtn.y && y <= oBtn.y + oBtn.h) {
      if (this.mana >= this.orcCost) {
        this.mana -= this.orcCost;

        this.troops.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 1,
          speed: 45,
          hp: 100,
          maxHp: 100,
          radius: 12,
          type: 'orc',
          animTime: Math.random() * 10,
          bounty: 35
        });
      }
    }
  }

  exit() {}
}
