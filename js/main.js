window.addEventListener('load', () => {
  const engine = new Engine('gameCanvas');

  // Registrar los estados/pantallas
  engine.stateManager.addState('menu', new MenuScreen());
  engine.stateManager.addState('game', new GameScreen());

  // Arrancar en el menú principal
  engine.stateManager.switchState('menu');
  engine.start();
});
