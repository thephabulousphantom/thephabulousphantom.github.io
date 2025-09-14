export class Character {
  constructor(config) {
    this.bodyColor = config && config.bodyColor ? config.bodyColor : "#888888";
    this.faceTopColor = config && config.faceTopColor ? config.faceTopColor : "#bbbbbb";
    this.faceBottomColor = config && config.faceBottomColor ? config.faceBottomColor : "#666666";

    this.w = config && config.w ? config.w : 160;
    this.h = config && config.h ? config.h : 160;

    this.x = 0;
    this.y = 0;
    this.rotationRad = 0;
    this.headImage = null;
    this.bodyImage = null;

    this._laughing = false;
    this._laughCount = 0;
    this._laughTimer = 0;
    this._mouthOpen = 0;
    this._anchorRight = false;

    this._eating = false;
    this._eatTimer = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setAnchorRight(flag) {
    this._anchorRight = !!flag;
  }

  setRotation(rad) {
    this.rotationRad = rad || 0;
  }

  setHeadImage(img) {
    this.headImage = img || null;
  }

  setBodyImage(img) {
    this.bodyImage = img || null;
  }

  update(dt) {
    // Laughing animation (multi-cycle open/close)
    if (this._laughing) {
      this._laughTimer += dt;

      const cycle = 0.15;
      const cyclesNeeded = 3 * 2;

      const total = this._laughTimer / cycle;
      const phase = Math.floor(total);
      const inPhaseT = (total - phase);

      if (phase >= cyclesNeeded) {
        this._laughing = false;
        this._laughCount = 0;
        this._laughTimer = 0;
        this._mouthOpen = 0;
        return;
      }

      if (phase % 2 === 0) {
        this._mouthOpen = inPhaseT;
      } else {
        this._mouthOpen = 1.0 - inPhaseT;
      }
      return;
    }

    // Eating animation (single open then close)
    if (this._eating) {
      this._eatTimer += dt;

      const cycle = 0.15;
      const cyclesNeeded = 2; // open then close (one full open-close)

      const total = this._eatTimer / cycle;
      const phase = Math.floor(total);
      const inPhaseT = (total - phase);

      if (phase >= cyclesNeeded) {
        this._eating = false;
        this._eatTimer = 0;
        this._mouthOpen = 0;
        return;
      }

      if (phase % 2 === 0) {
        this._mouthOpen = inPhaseT;
      } else {
        this._mouthOpen = 1.0 - inPhaseT;
      }
      return;
    }
  }

  laugh() {
    this._laughing = true;
    this._laughCount = 0;
    this._laughTimer = 0;
    this._mouthOpen = 0;
  }

  eat() {
    if (this._eating || this._laughing) {
      return;
    }

    this._eating = true;
    this._eatTimer = 0;
    this._mouthOpen = 0;
  }

  isEating() {
    return this._eating;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  render(renderer) {
    const x = this.x;
    const y = this.y;
    const w = this.w;
    const h = this.h;

    const cx = x + Math.floor(w * 0.5);
    const cy = y + Math.floor(h * 0.5);

    renderer.push();
    renderer.translate(cx, cy);
    if (this.rotationRad) {
      renderer.rotate(this.rotationRad);
    }
    renderer.translate(-cx, -cy);

    const UNIT = 256;
    const HEAD_TOP = 190;
    const HEAD_BOTTOM = 66;
    const OVERLAP = 40;
    const TOTAL_H = UNIT + UNIT - OVERLAP; // 472

    const s = Math.min(w / UNIT, h / TOTAL_H);

    const drawW = Math.floor(UNIT * s);
    const drawHeadH = Math.floor(UNIT * s);
    const drawBodyH = Math.floor(UNIT * s);
    const drawOverlap = Math.floor(OVERLAP * s);
    const drawTotalH = drawHeadH + drawBodyH - drawOverlap;

    const baseX = Math.floor(x + (w - drawW) * 0.5);
    const baseY = Math.floor(y + (h - drawTotalH) * 0.5);

    const headX = baseX;
    const headY = baseY;
    const bodyX = baseX;
    const bodyY = baseY + drawHeadH - drawOverlap;

    if (this.bodyImage) {
      const img = this.bodyImage;
      const ctx = renderer.ctx;
      ctx.drawImage(img, 0, 0, 256, 256, bodyX, bodyY, drawW, drawBodyH);
    }

    const topH = Math.floor(HEAD_TOP * s);
    const bottomH = Math.floor(HEAD_BOTTOM * s);
    const headW = drawW;

    if (this.headImage) {
      const img = this.headImage;
      const sxTop = 0;
      const syTop = 0;
      const swTop = 256;
      const shTop = 190;
      const sxBot = 0;
      const syBot = 190;
      const swBot = 256;
      const shBot = 66;

      const ctx = renderer.ctx;

      ctx.drawImage(img, sxBot, syBot, swBot, shBot, headX, headY + topH, headW, bottomH);
    }

    const mouthMaxAngle = Math.PI / 4;
    const angle = mouthMaxAngle * this._mouthOpen;

    const pivotX = headX + Math.floor(200 * s);
    const pivotY = headY + topH;

    renderer.push();
    renderer.translate(pivotX, pivotY);
    renderer.rotate(angle);
    renderer.translate(-pivotX, -pivotY);
    if (this.headImage) {
      const img = this.headImage;
      const sxTop = 0;
      const syTop = 0;
      const swTop = 256;
      const shTop = 190;

      const ctx = renderer.ctx;
      ctx.drawImage(img, sxTop, syTop, swTop, shTop, headX, headY, headW, topH);
    }
    renderer.pop();

    

    renderer.pop();
  }
}
