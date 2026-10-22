class GameScreen {
  enter() {
    this.backButton = { x: 15, y: 15, w: 70, h: 30 };
    
    // Recursos del jugador
    this.mana = 100;
    this.maxMana = 100;
    this.manaRegen = 12; // Regeneración por segundo
    this.invasionGold = 0; // Oro ganado por avanzar

    // Recursos de la IA Enemiga
    this.enemyGold = 0;

    // Camino/Ruta (de abajo a arriba)
    this.path = [
      { x: 180, y: 600 },
      { x: 180, y: 450 },
      { x: 80,  y: 450 },
      { x: 80,  y: 250 },
      { x: 280, y: 250 },
      { x: 280, y: 100 },
      { x: 180, y: 100 }
    ];

    // Parcelas de construcción enemigas (Empiezan en Nivel 0 = Vacías, excepto la primera)
    this.plots = [
      { id: 1, x: 130, y: 520, level: 1, type: 'Arquero', range: 65, costNext: 40 }, // Única torre inicial (Nivel 1)
      { id: 2, x: 130, y: 350, level: 0, type: 'Vacío',   range: 0,  costNext: 30 },
      { id: 3, x: 230, y: 180, level: 0, type: 'Vacío',   range: 0,  costNext: 50 }
    ];

    // Botones de la UI de Invocación y Mejoras
    this.spawnGoblinBtn = { x: 15,  y: 565, w: 150, h: 55 };
    this.upgradeManaBtn = { x: 195, y: 565, w: 150, h: 55 };

    // Nivel actual de tus tropas
    this.goblinLevel = 1;
    this.goblinCost = 20;
  }

  update(dt) {
    // 1. Regenerar maná
    if (this.mana < this.maxMana) {
      this.mana += this.manaRegen * dt;
      if (this.mana > this.maxMana) this.mana = this.maxMana;
    }

    // 2. Lógica de la IA Enemiga (Mejorar/Construir torres si junta oro suficiente)
    this.plots.forEach(plot => {
      if (this.enemyGold >= plot.costNext) {
        this.enemyGold -= plot.costNext;
        plot.level++;
        if (plot.level === 1) {
          plot.type = plot.id % 2 === 0 ? 'Arquero' : 'Mago';
          plot.range = 70;
        } else {
          plot.range += 15; // Más rango al subir nivel
        }
        plot.costNext = Math.floor(plot.costNext * 1.8);
      }
    });
  }

  render(ctx) {
    // 1. Fondo del mapa
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 360, 640);

    // 2. Dibujar el Camino
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 36;
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

    // 3. Meta / Base Enemiga
    const base = this.path[this.path.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(base.x, base.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Dibujar Parcelas y Torres Enemigas
    this.plots.forEach(p => {
      if (p.level === 0) {
        // Parcela vacía (Cimiento)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIBRE', p.x, p.y + 3);
      } else {
        // Rango de ataque de la Torre
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.range, 0, Math.PI * 2);
        ctx.fill();

        // Torre según tipo
        ctx.fillStyle = p.type === 'Arquero' ? '#eab308' : '#a855f7';
        ctx.fillRect(p.x - 14, p.y - 14, 28, 28);

        // Nivel de la Torre
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.type} Lvl ${p.level}`, p.x, p.y - 18);
      }
    });

    // 5. Interface Superior (UI)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 360, 60);

    // Botón MENÚ
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENÚ', this.backButton.x + 35, this.backButton.y + 20);

    // Stats de Maná u Oro Enemigo
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`💧 MANÁ: ${Math.floor(this.mana)}`, 345, 25);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px sans-serif';
    ctx.fillText(`👑 ORO ENEMIGO: ${Math.floor(this.enemyGold)}`, 345, 45);

    // 6. Panel Inferior de Invocación y Progreso
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 540, 360, 100);

    // Botón Invocar Duende
    ctx.fillStyle = this.mana >= this.goblinCost ? '#10b981' : '#334155';
    ctx.fillRect(this.spawnGoblinBtn.x, this.spawnGoblinBtn.y, this.spawnGoblinBtn.w, this.spawnGoblinBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DUENDE Lvl ${this.goblinLevel}`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 24);
    ctx.font = '10px sans-serif';
    ctx.fillText(`Costo: ${this.goblinCost} 💧`, this.spawnGoblinBtn.x + 75, this.spawnGoblinBtn.y + 42);

    // Botón Mejorar Regeneración de Maná
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
    // Volver
    const btn = this.backButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('menu');
      return;
    }

    // Invocar Duende (Prueba de simulación de muerte/oro enemigo)
    const gBtn = this.spawnGoblinBtn;
    if (x >= gBtn.x && x <= gBtn.x + gBtn.w && y >= gBtn.y && y <= gBtn.y + gBtn.h) {
      if (this.mana >= this.goblinCost) {
        this.mana -= this.goblinCost;
        // Simulación: Al enviar tropa, el enemigo ganará oro progresivo cuando sus torres la destruyan
        this.enemyGold += 15; 
      }
    }

    // Mejorar Maná
    const mBtn = this.upgradeManaBtn;
    if (x >= mBtn.x && x <= mBtn.x + mBtn.w && y >= mBtn.y && y <= mBtn.y + mBtn.h) {
      if (this.mana >= 50) {
        this.mana -= 50;
        this.manaRegen += 5; // Aumenta la velocidad de recarga
      }
    }
  }

  exit() {}
}
