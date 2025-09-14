export class Sprite {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color || "#ffffff";

    this.vx = 0;
    this.vy = 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  render(renderer) {
    renderer.drawRect(this.x, this.y, this.w, this.h, this.color);
  }
}
