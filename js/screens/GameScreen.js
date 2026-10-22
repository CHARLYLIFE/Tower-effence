class GameScreen {
  enter() {
    this.backButton = { x: 15, y: 15, w: 70, h: 30 };
  }

  update(dt) {
    // Aquí actualizaremos las tropas y torres en la Fase 2
  }

  render(ctx) {
    // Fondo de área de batalla
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 360, 640);

    // Barra superior de interfaz
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 360, 60);

    // Botón de Volver al Menú
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENÚ', this.backButton.x + 35, this.backButton.y + 20);

    // Estado actual
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FASE DE COMBATE', 220, 37);
  }

  handleTouch(x, y) {
    const btn = this.backButton;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      this.manager.switchState('menu');
    }
  }

  exit() {}
}
