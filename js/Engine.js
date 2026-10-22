class Engine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.stateManager = new StateManager(this);
    this.lastTime = 0;

    this.initEvents();
  }

  initEvents() {
    const handleInput = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      this.stateManager.handleTouch(x, y);
    };

    this.canvas.addEventListener('touchstart', handleInput, { passive: false });
    this.canvas.addEventListener('mousedown', handleInput);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(currentTime) {
    // Calculamos el dt y le ponemos un tope máximo (max 0.05s) para frenar aceleraciones
    let dt = (currentTime - this.lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; 
    this.lastTime = currentTime;

    this.stateManager.update(dt);
    this.stateManager.render(this.ctx);

    requestAnimationFrame((time) => this.loop(time));
  }
}
