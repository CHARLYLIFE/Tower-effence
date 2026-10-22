class StateManager {
  constructor(engine) {
    this.engine = engine;
    this.states = {};
    this.currentState = null;
  }

  addState(name, stateObject) {
    this.states[name] = stateObject;
    stateObject.manager = this;
    stateObject.engine = this.engine;
  }

  switchState(name, params = {}) {
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }
    this.currentState = this.states[name];
    if (this.currentState && this.currentState.enter) {
      this.currentState.enter(params);
    }
  }

  update(dt) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(dt);
    }
  }

  render(ctx) {
    if (this.currentState && this.currentState.render) {
      this.currentState.render(ctx);
    }
  }

  handleTouch(x, y) {
    if (this.currentState && this.currentState.handleTouch) {
      this.currentState.handleTouch(x, y);
    }
  }
}
