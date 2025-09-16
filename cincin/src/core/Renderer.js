export class Renderer {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.targetAspect = 16 / 9;
    this.logicalWidth = 1600;
    this.logicalHeight = Math.round(this.logicalWidth / this.targetAspect);

    this.displayWidth = 0;
    this.displayHeight = 0;
    this.dpr = 1;

    this.viewportX = 0;
    this.viewportY = 0;
    this.viewportWidth = 0;
    this.viewportHeight = 0;

    this.orientation = "landscape";

    this.clearColor = "#000000";
    this.tileColor1 = "#0b5";
    this.tileColor2 = "#083";
    this.tileSizePx = 32;
    
    this.activeTileScale = 1.0;
    this.logicalScaleX = 1.0;
    this.logicalScaleY = 1.0;

    document.body.style.margin = "0";
    // Ensure page background doesn't show through any subpixel seams
    if (document.documentElement && document.documentElement.style) {
      document.documentElement.style.background = "#000";
      document.documentElement.style.overflow = "hidden";
    }
    document.body.style.background = "#000";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";
    document.body.style.userSelect = "none";
    // Append canvas and harden interaction settings
    document.body.appendChild(this.canvas);

    const c = this.canvas;
    c.style.display = "block";
    c.style.touchAction = "none"; // disable browser gestures
    c.style.userSelect = "none";
    c.style.webkitUserSelect = "none";
    c.style.msUserSelect = "none";
    c.style.webkitTouchCallout = "none";
    c.style.webkitTapHighlightColor = "transparent";

    // Block context menu, drag and wheel scrolling on the canvas
    c.addEventListener("contextmenu", function(e) { e.preventDefault(); }, { passive: false });
    c.addEventListener("dragstart", function(e) { e.preventDefault(); }, { passive: false });
    c.addEventListener("wheel", function(e) { e.preventDefault(); }, { passive: false });
  }

  tileImageViewport(img) {
    if (!img) {
      return;
    }

    const ctx = this.ctx;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      return;
    }

    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) {
      return;
    }

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (typeof pattern.setTransform === "function") {
      const s = this.activeTileScale;
      const m = new DOMMatrix();
      m.a = s;
      m.d = s;
      pattern.setTransform(m);
    }
    ctx.fillStyle = pattern;
    ctx.beginPath();
    ctx.rect(this.viewportX - 1, this.viewportY - 1, this.viewportWidth + 2, this.viewportHeight + 2);
    ctx.clip();
    ctx.fillRect(this.viewportX - 1, this.viewportY - 1, this.viewportWidth + 2, this.viewportHeight + 2);
    ctx.restore();
  }

  setActiveTileScale(scale) {
    this.activeTileScale = Math.max(0.01, scale || 1.0);
  }

  resizeToDisplay() {
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;

    this.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

    this.displayWidth = clientWidth;
    this.displayHeight = clientHeight;

    this.canvas.style.width = this.displayWidth + "px";
    this.canvas.style.height = this.displayHeight + "px";

    this.canvas.width = Math.floor(this.displayWidth * this.dpr);
    this.canvas.height = Math.floor(this.displayHeight * this.dpr);

    this.orientation = this.displayWidth >= this.displayHeight ? "landscape" : "portrait";

    // Adjust target aspect and logical dimensions based on orientation
    if (this.orientation === "landscape") {
      // 16:9 logical field
      this.targetAspect = 16 / 9;
      this.logicalWidth = 1600;
      this.logicalHeight = Math.round(this.logicalWidth / this.targetAspect);
    } else {
      // 9:16 logical field
      this.targetAspect = 9 / 16;
      this.logicalWidth = 900;
      this.logicalHeight = Math.round(this.logicalWidth / this.targetAspect);
    }

    const screenAspect = this.displayWidth / this.displayHeight;

    if (screenAspect > this.targetAspect) {
      this.viewportHeight = this.displayHeight;
      this.viewportWidth = Math.floor(this.viewportHeight * this.targetAspect);
      this.viewportX = Math.floor((this.displayWidth - this.viewportWidth) / 2);
      this.viewportY = 0;
    } else {
      this.viewportWidth = this.displayWidth;
      this.viewportHeight = Math.floor(this.viewportWidth / this.targetAspect);
      this.viewportX = 0;
      this.viewportY = Math.floor((this.displayHeight - this.viewportHeight) / 2);
    }

    this._applyContextState();
  }

  _applyContextState() {
    const ctx = this.ctx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.imageSmoothingEnabled = false;
  }

  beginFrame() {
    const ctx = this.ctx;

    ctx.save();

    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


    const scaleX = (this.viewportWidth * this.dpr) / this.logicalWidth;
    const scaleY = (this.viewportHeight * this.dpr) / this.logicalHeight;
    this.logicalScaleX = scaleX;
    this.logicalScaleY = scaleY;
    const offsetX = this.viewportX * this.dpr;
    const offsetY = this.viewportY * this.dpr;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleX, scaleY);
  }

  endFrame() {
    const ctx = this.ctx;

    ctx.restore();
  }

  drawRect(x, y, w, h, color) {
    const ctx = this.ctx;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  drawText(text, x, y, color, font, align) {
    const ctx = this.ctx;

    ctx.fillStyle = color || "#fff";
    ctx.font = font || "48px sans-serif";
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  strokeRect(x, y, w, h, color, width) {
    const ctx = this.ctx;

    ctx.strokeStyle = color || "#000";
    ctx.lineWidth = width || 2;
    ctx.strokeRect(x, y, w, h);
  }

  push() {
    this.ctx.save();
  }

  pop() {
    this.ctx.restore();
  }

  translate(x, y) {
    this.ctx.translate(x, y);
  }

  rotate(rad) {
    this.ctx.rotate(rad);
  }

  canvasToLogical(x, y) {

    const vx = this.viewportX;
    const vy = this.viewportY;
    const vw = this.viewportWidth;
    const vh = this.viewportHeight;

    const sx = x - vx;
    const sy = y - vy;

    if (sx < 0 || sy < 0 || sx > vw || sy > vh) {
      return null;
    }

    const lx = (sx / vw) * this.logicalWidth;
    const ly = (sy / vh) * this.logicalHeight;

    return { x: Math.floor(lx), y: Math.floor(ly) };
  }

  screenPush() {
    const ctx = this.ctx;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  screenPop() {
    this.ctx.restore();
  }

  scale(sx, sy) {
    this.ctx.scale(sx, sy);
  }

  tileImageScreen(img) {
    if (!img) {
      return;
    }

    const ctx = this.ctx;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      return;
    }

    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) {
      return;
    }

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // Apply pattern scale in screen space (no logical compensation here)
    if (typeof pattern.setTransform === "function") {
      const s = this.activeTileScale;
      const m = new DOMMatrix();
      m.a = s;
      m.d = s;
      pattern.setTransform(m);
    }
    ctx.fillStyle = pattern;
    // Draw with a small bleed to avoid 1px gaps due to rounding
    ctx.fillRect(-1, -1, this.displayWidth + 2, this.displayHeight + 2);
    ctx.restore();
  }

  drawImageScreen(img, x, y, w, h) {
    if (!img) {
      return;
    }

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      return;
    }

    const ctx = this.ctx;

    // draw in screen space: assumes screenPush() is active
    ctx.drawImage(img, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  tileImageLogical(img, width, height) {
    if (!img) {
      return;
    }

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      return;
    }

    const ctx = this.ctx;
    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) {
      return;
    }

    ctx.save();
    // Apply pattern scale so tile size can be adjusted
    if (typeof pattern.setTransform === "function") {
      const s = this.activeTileScale;
      const m = new DOMMatrix();
      m.a = s;
      m.d = s;
      pattern.setTransform(m);
    }
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
