export class NPC {
  constructor(kind, character, params) {

    this.kind = kind;
    this.character = character;

    // world position/velocity (center based)
    this.wx = params && params.wx ? params.wx : 0;
    this.wy = params && params.wy ? params.wy : 0;
    this.vx = params && params.vx ? params.vx : 0;
    this.vy = params && params.vy ? params.vy : 0;

    this.orientation = "landscape";

    this.alive = true;

    this.widthPx = params && params.widthPx ? params.widthPx : 120;
    this.heightPx = params && params.heightPx ? params.heightPx : 120;

    this._flipHV = false;
  }

  setOrientation(o) {
    this.orientation = o;
  }

  setFlipHV(flag) {
    this._flipHV = !!flag;
  }

  update(dt) {
    this.wx += this.vx * dt;
    this.wy += this.vy * dt;

    // Forward character animations
    this.character.update(dt);
  }

  getWorldPos() {
    return { x: this.wx, y: this.wy };
  }

  setScreenRect(x, y, w, h) {
    this.character.w = w;
    this.character.h = h;
    this.character.setPosition(x, y);
  }

  render(renderer) {
    if (this.orientation === "portrait") {
      // Flip horizontally+vertically when moving to the right
      const movingRight = this.vx > 0.0001;
      const movingLeft = this.vx < -0.0001;
      const cx = this.character.x + Math.floor(this.character.w * 0.5);
      const cy = this.character.y + Math.floor(this.character.h * 0.5);
      if (movingRight) {
        renderer.push();
        renderer.translate(cx, cy);
        renderer.scale(-1, -1);
        renderer.translate(-cx, -cy);
        this.character.render(renderer);
        renderer.pop();
        return;
      }
      // moving left or static -> normal draw
      this.character.render(renderer);
      return;
    }

    // landscape: no flipping for now (special actions later)
    this.character.render(renderer);
  }
}
