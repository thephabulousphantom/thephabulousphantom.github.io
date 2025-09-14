export class Background {
  constructor(tileSize, color1, color2) {
    this.tileSize = tileSize || 64;
    this.color1 = color1 || "#0f0";
    this.color2 = color2 || "#0c0";
    this.image = null;
  }

  update(dt) {
  }

  render(renderer, width, height) {
    if (this.image) {
      if (typeof renderer.tileImageScreen === "function") {
        renderer.tileImageScreen(this.image);
      } else if (typeof renderer.tileImageViewport === "function") {
        renderer.tileImageViewport(this.image);
      } else {
        renderer.tileImageLogical(this.image, width, height);
      }
      return;
    }
    // No image yet — avoid drawing placeholder tiles to prevent flicker
  }

  setTileImage(img) {
    this.image = img;
  }
}
