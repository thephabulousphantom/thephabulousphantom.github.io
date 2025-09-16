export class Pellet {
  constructor(image, params) {

    // Backward compatibility: if image is provided, use it as a single-frame animation.
    this.image = image;
    this.frames = (params && params.frames && Array.isArray(params.frames)) ? params.frames.slice() : (image ? [image] : []);
    this.frameIndex = 0;
    this.frameTimer = 0;
    const fps = params && typeof params.fps === "number" && params.fps > 0 ? params.fps : 10;
    this.frameDuration = 1.0 / fps;

    this.wx = params && params.wx ? params.wx : 0;
    this.wy = params && params.wy ? params.wy : 0;
    this.vx = params && params.vx ? params.vx : 0;
    this.vy = params && params.vy ? params.vy : 0;

    this.alive = true;

    this.sizePx = params && params.sizePx ? params.sizePx : 48;

    this.orientation = "landscape";

    this.bounces = 0;
    this.valueBounces = 0;
  }

  setOrientation(o) {
    this.orientation = o;
  }

  update(dt) {
    this.wx += this.vx * dt;
    this.wy += this.vy * dt;

    // Advance animation frames
    if (this.frames && this.frames.length > 1) {
      this.frameTimer += dt;
      while (this.frameTimer >= this.frameDuration) {
        this.frameTimer -= this.frameDuration;
        this.frameIndex += 1;
        if (this.frameIndex >= this.frames.length) {
          this.frameIndex = 0;
        }
      }
    }
  }

  getWorldPos() {
    return { x: this.wx, y: this.wy };
  }

  render(renderer, screenRect) {
    const img = this._currentImage();
    if (!img) {
      renderer.drawRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h, "#ff0");
      return;
    }

    const cx = screenRect.x + Math.floor(screenRect.w * 0.5);
    const cy = screenRect.y + Math.floor(screenRect.h * 0.5);

    const a = Math.atan2(this.vy, this.vx) - Math.PI * 0.5;

    renderer.push();
    renderer.translate(cx, cy);
    renderer.rotate(a);
    renderer.translate(-cx, -cy);

    renderer.ctx.drawImage(img, cx - Math.floor(screenRect.w * 0.5), cy - Math.floor(screenRect.h * 0.5), screenRect.w, screenRect.h);

    renderer.pop();
  }

  _currentImage() {
    if (this.frames && this.frames.length > 0) {
      const idx = Math.max(0, Math.min(this.frameIndex, this.frames.length - 1));
      const f = this.frames[idx];
      if (f) {
        return f;
      }
    }
    return this.image || null;
  }
}
