export class Pellet {
  constructor(image, params) {

    this.image = image;

    this.wx = params && params.wx ? params.wx : 0;
    this.wy = params && params.wy ? params.wy : 0;
    this.vx = params && params.vx ? params.vx : 0;
    this.vy = params && params.vy ? params.vy : 0;

    this.alive = true;

    this.sizePx = params && params.sizePx ? params.sizePx : 48;

    this.orientation = "landscape";

    this.bounces = 0;
  }

  setOrientation(o) {
    this.orientation = o;
  }

  update(dt) {
    this.wx += this.vx * dt;
    this.wy += this.vy * dt;
  }

  getWorldPos() {
    return { x: this.wx, y: this.wy };
  }

  render(renderer, screenRect) {
    if (!this.image) {
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

    renderer.ctx.drawImage(this.image, cx - Math.floor(screenRect.w * 0.5), cy - Math.floor(screenRect.h * 0.5), screenRect.w, screenRect.h);

    renderer.pop();
  }
}
