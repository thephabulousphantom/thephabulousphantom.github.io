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
      this.current.onEnter({ renderer: renderer, input: input, app: app, loader: loader });
      this.current.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }
  }
}
