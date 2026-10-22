class MenuScreen {
  enter() {
    this.startButton = { x: 80, y: 380, w: 200, h: 50 };
  }

  update(dt) {
    // Reservado para animaciones del menú
  }

  render(ctx) {
    // Fondo oscuro
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 360, 640);

    // Título y Firma CHARLY
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHARLY', 180, 180);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('TOWER OFFENSE', 180, 220);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('¡Invade el Reino Enemigo!', 180, 250);

    // Botón de Iniciar Invasión
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(this.startButton.x, this.startButton.y, this.startButton.w, this.startButton.h, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('INICIAR INVASIÓN', 180, this.startButton.y + 32);
  }

  handleTouch(x, y) {
    const btn = this.startButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('game');
    }
  }

  exit() {}
}
