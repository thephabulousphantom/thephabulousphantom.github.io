export class Application {
  constructor(params) {
    this.canvas = params.canvas;
    this.renderer = params.renderer;
    this.sceneManager = params.sceneManager;
    this.input = params.input;
    this.loader = params.loader;
    this.config = params.config || {};

    this._running = false;
    this._lastTime = 0;
    this._boundTick = this._tick.bind(this);

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  start() {
    if (this._running) {
      return;
    }

    this._running = true;
    this._lastTime = performance.now();

    document.addEventListener("visibilitychange", this._onVisibilityChange, { passive: true });
    window.addEventListener("resize", this._onResize, { passive: true });

    this._onResize();

    requestAnimationFrame(this._boundTick);
  }

  stop() {
    if (!this._running) {
      return;
    }

    this._running = false;

    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    window.removeEventListener("resize", this._onResize);
  }

  setScene(scene) {
    this.sceneManager.setScene(scene, this.renderer, this.input, this, this.loader);
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this._running = false;
      return;
    }

    if (!this._running) {
      this._running = true;
      this._lastTime = performance.now();
      requestAnimationFrame(this._boundTick);
    }
  }

  _onResize() {
    this.renderer.resizeToDisplay();

    // Force a fresh context state to avoid any stale transforms during orientation flips
    this.renderer._applyContextState();

    // Defer scene resize by one frame to ensure browser has finalized layout
    const self = this;
    requestAnimationFrame(function onNextFrame() {
      if (self.sceneManager.current) {
        self.sceneManager.current.onResize(self.renderer.logicalWidth, self.renderer.logicalHeight, self.renderer.orientation);
      }
    });
  }

  _tick(now) {
    if (!this._running) {
      return;
    }

    const dt = Math.min(0.066, (now - this._lastTime) / 1000);
    this._lastTime = now;

    if (this.sceneManager.current) {
      this.sceneManager.current.update(dt, now / 1000);
    }

    this.renderer.beginFrame();

    if (this.sceneManager.current) {
      this.sceneManager.current.render(this.renderer);
    }

    this.renderer.endFrame();

    requestAnimationFrame(this._boundTick);
  }
}
