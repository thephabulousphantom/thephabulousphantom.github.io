export class SceneManager {
  constructor() {
    this.current = null;
  }

  setScene(scene, renderer, input, app, loader) {
    if (this.current) {
      this.current.onExit();
    }

    this.current = scene;

    if (this.current) {
      // Clear any pending inputs and suppress new inputs briefly to avoid accidental actions across scenes
      if (input && typeof input.reset === "function") {
        input.reset();
      }
      if (input && typeof input.suppressFor === "function") {
        input.suppressFor(1000); // 1 second suppression window
      }
      this.current.onEnter({ renderer: renderer, input: input, app: app, loader: loader });
      this.current.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }
  }
}
