import { Background } from "../entities/Background.js";
import { Character } from "../entities/Character.js";

export class GameScene {
  constructor(colors) {

    this.renderer = null;
    this.input = null;

    this.width = 0;
    this.height = 0;
    this.orientation = "landscape";

    this.bg = new Background(80, "#0e9", "#0b7");

    const p1Cfg = colors && colors.p1 ? colors.p1 : { bodyColor: "#e74c3c", faceTopColor: "#f4d03f", faceBottomColor: "#c0392b" };
    const p2Cfg = colors && colors.p2 ? colors.p2 : { bodyColor: "#3498db", faceTopColor: "#85c1e9", faceBottomColor: "#2e86c1" };

    this.p1 = new Character({ bodyColor: p1Cfg.bodyColor, faceTopColor: p1Cfg.faceTopColor, faceBottomColor: p1Cfg.faceBottomColor, w: 100, h: 100 });
    this.p2 = new Character({ bodyColor: p2Cfg.bodyColor, faceTopColor: p2Cfg.faceTopColor, faceBottomColor: p2Cfg.faceBottomColor, w: 100, h: 100 });

    if (p1Cfg.headImage) {
      this.p1.setHeadImage(p1Cfg.headImage);
    }

    if (p2Cfg.headImage) {
      this.p2.setHeadImage(p2Cfg.headImage);
    }

    if (p1Cfg.bodyImage) {
      this.p1.setBodyImage(p1Cfg.bodyImage);
    }

    if (p2Cfg.bodyImage) {
      this.p2.setBodyImage(p2Cfg.bodyImage);
    }

    // Virtual world dimensions (relative space independent of screen)
    this.worldW = 2000;
    this.worldH = 1125; // 16:9 baseline

    // World-space positions
    this.p1Pos = { x: 0, y: 0 };
    this.p2Pos = { x: 0, y: 0 };

    // Physics parameters
    this.maxSpeed = 1200; // world units per second
    this.accel = 2800;    // acceleration when holding a direction
    this.decel = 3600;    // deceleration when no input

    // We move along a single axis depending on orientation
    this.p1Vel = 0;
    this.p2Vel = 0;

    // Track whether a given active pointer started on a head hot-zone, and for which player ("p1", "p2")
    this._pointerStartedOnHead = new Map();
  }

  async _loadTiles() {

    try {
      const active = await this.loader.loadImage("./img/tiles/behaton.png");
      const inactive = await this.loader.loadImage("./img/tiles/background-inactive.png");
      this.bg.setTileImage(active);
      if (this.renderer && inactive) {
        this.renderer.setInactiveTileImage(inactive);
      }
    } catch (e) {
    }
  }

  onEnter(ctx) {

    this.renderer = ctx.renderer;
    this.input = ctx.input;
    this.loader = ctx.loader;

    if (this.renderer && typeof this.renderer.setActiveTileScale === "function") {
      this.renderer.setActiveTileScale(0.1);
    }

    this.p1.laugh();
    this.p2.laugh();

    this._loadTiles();

    // Initialize world positions near edges
    this._layoutPlayers();
  }

  onExit() {

  }

  onResize(w, h, orientation) {

    this.width = w;
    this.height = h;
    this.orientation = orientation;

    this._layoutPlayers();
  }

  update(dt, t) {

    // Tick character animations (laugh/eat)
    this.p1.update(dt);
    this.p2.update(dt);

    // Keyboard mapping: in landscape we use up/down (vertical movement).
    // In portrait we use left/right (horizontal movement).
    const kb = this.input.getDirectionalState();
    const desired = { p1: 0, p2: 0 };

    if (this.orientation === "landscape") {
      if (kb.p1.up) { desired.p1 = -1; }
      if (kb.p1.down) { desired.p1 = 1; }
      if (kb.p2.up) { desired.p2 = -1; }
      if (kb.p2.down) { desired.p2 = 1; }
    } else {
      if (kb.p1.left) { desired.p1 = -1; }
      if (kb.p1.right) { desired.p1 = 1; }
      if (kb.p2.left) { desired.p2 = -1; }
      if (kb.p2.right) { desired.p2 = 1; }
    }

    // Action buttons (keyboard) trigger eat; ignore touch 'action' to avoid repeats while held
    if (kb.p1.actionKey) { this.p1.eat(); }
    if (kb.p2.actionKey) { this.p2.eat(); }

    // Pointer mapping using halves of the playing area, but suppress movement
    // for any pointer that STARTED over a head hot zone. Start state is latched at pointerdown.
    const pointers = this.input.pointerStates;

    // Latch start-on-head for newly seen pointers; also collect active ids for cleanup
    const activeIds = new Set();
    for (let i = 0; i < pointers.length; i++) {
      const p = pointers[i];
      activeIds.add(p.id);
      if (!this._pointerStartedOnHead.has(p.id)) {
        const lp = this.renderer.canvasToLogical(p.downX, p.downY);
        let startedOnHead = false;
        let which = null;
        if (lp) {
          if (this._pointInHeadHot(this.p1, lp.x, lp.y)) { startedOnHead = true; which = "p1"; }
          else if (this._pointInHeadHot(this.p2, lp.x, lp.y)) { startedOnHead = true; which = "p2"; }
        }
        this._pointerStartedOnHead.set(p.id, startedOnHead ? which : false);
      }
    }
    // Cleanup entries for pointers that have been lifted
    const iter = this._pointerStartedOnHead.keys();
    for (let k = iter.next(); !k.done; k = iter.next()) {
      const id = k.value;
      if (!activeIds.has(id)) {
        this._pointerStartedOnHead.delete(id);
      }
    }

    // If any pointer started on a player's head, freeze that player's movement this frame
    let headLockP1 = false;
    let headLockP2 = false;
    for (let i = 0; i < pointers.length; i++) {
      const v = this._pointerStartedOnHead.get(pointers[i].id);
      if (v === "p1") { headLockP1 = true; }
      if (v === "p2") { headLockP2 = true; }
    }
    if (headLockP1) { desired.p1 = 0; this.p1Vel = 0; }
    if (headLockP2) { desired.p2 = 0; this.p2Vel = 0; }

    for (let i = 0; i < pointers.length; i++) {
      const p = pointers[i];

      if (this._pointerStartedOnHead.get(p.id)) {
        continue;
      }

      if (this.orientation === "landscape") {
        // Left half belongs to P1, right half to P2; within each, top triggers up, bottom triggers down
        if (p.px < 0.5) {
          desired.p1 = (p.py < 0.5) ? -1 : 1;
        } else {
          desired.p2 = (p.py < 0.5) ? -1 : 1;
        }
      } else {
        // Top half belongs to P1, bottom half to P2; within each, left triggers left, right triggers right
        if (p.py < 0.5) {
          desired.p1 = (p.px < 0.5) ? -1 : 1;
        } else {
          desired.p2 = (p.px < 0.5) ? -1 : 1;
        }
      }
    }

    // Handle taps: only trigger eat if the initial press began on a head hot-zone
    // and the tap was short (Input already filters) regardless of movement.
    const taps = this.input.consumeTaps();
    for (let i = 0; i < taps.length; i++) {
      const tap = taps[i];
      const lDown = this.renderer.canvasToLogical(tap.downX, tap.downY);
      if (!lDown) {
        continue;
      }
      if (this._pointInHeadHot(this.p1, lDown.x, lDown.y)) {
        this.p1.eat();
        continue;
      }
      if (this._pointInHeadHot(this.p2, lDown.x, lDown.y)) {
        this.p2.eat();
        continue;
      }
    }

    this._applyPhysics(dt, desired);
  }

  render(renderer) {

    // If renderer orientation or logical size changed since last onResize, resync layout.
    if (this.orientation !== renderer.orientation || this.width !== renderer.logicalWidth || this.height !== renderer.logicalHeight) {
      this.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }

    this.bg.render(renderer, this.width, this.height);

    // Compute screen-space rectangles from world positions (center positions)
    const p1s = this._worldToScreenFor(this.p1Pos.x, this.p1Pos.y, this.p1.w, this.p1.h);
    const p2s = this._worldToScreenFor(this.p2Pos.x, this.p2Pos.y, this.p2.w, this.p2.h);

    this.p1.setPosition(p1s.x, p1s.y);
    this.p2.setPosition(p2s.x, p2s.y);

    // Flip P1 horizontally in landscape
    if (this.orientation === "landscape") {
      const c1x = p1s.x + Math.floor(this.p1.w * 0.5);
      const c1y = p1s.y + Math.floor(this.p1.h * 0.5);
      renderer.push();
      renderer.translate(c1x, c1y);
      renderer.scale(-1, 1);
      renderer.translate(-c1x, -c1y);
      this.p1.render(renderer);
      renderer.pop();
    } else {
      this.p1.render(renderer);
    }
    this.p2.render(renderer);
  }

  _layoutPlayers() {
    // Match MenuScene proportions using SCREEN pixels, then convert to logical via viewport mapping
    const r = this.renderer;
    const vw = r ? r.viewportWidth : this.width;
    const vh = r ? r.viewportHeight : this.height;
    const vx = r ? r.viewportX : 0;
    const vy = r ? r.viewportY : 0;

    const base = Math.min(vw, vh);
    const sx = this.width / Math.max(1, vw);
    const sy = this.height / Math.max(1, vh);

    function toLogicalX(px) { return Math.floor((px - vx) * sx); }
    function toLogicalY(py) { return Math.floor((py - vy) * sy); }

    if (this.orientation === "landscape") {
      const sizePx = Math.floor(base * 0.36);
      const sizeLx = Math.floor(sizePx * sx);
      const sizeLy = Math.floor(sizePx * sy);
      const sizeL = Math.min(sizeLx, sizeLy);
      this.p1.w = sizeL; this.p1.h = sizeL;
      this.p2.w = sizeL; this.p2.h = sizeL;

      const p1cxPx = Math.floor(vw * 0.15 + vx);
      const p1cyPx = Math.floor(vh * 0.50 + vy);
      const p2cxPx = Math.floor(vw * 0.85 + vx);
      const p2cyPx = Math.floor(vh * 0.50 + vy);

      const p1cx = toLogicalX(p1cxPx);
      const p1cy = toLogicalY(p1cyPx);
      const p2cx = toLogicalX(p2cxPx);
      const p2cy = toLogicalY(p2cyPx);

      const w1 = this._logicalCenterToWorld(p1cx, p1cy);
      const w2 = this._logicalCenterToWorld(p2cx, p2cy);
      this.p1Pos.x = w1.x; this.p1Pos.y = w1.y;
      this.p2Pos.x = w2.x; this.p2Pos.y = w2.y;

      this.p1.setRotation(0);
      this.p2.setRotation(0);
    } else {
      const sizePx = Math.floor(base * 0.48);
      const sizeLx = Math.floor(sizePx * sx);
      const sizeLy = Math.floor(sizePx * sy);
      const sizeL = Math.min(sizeLx, sizeLy);
      this.p1.w = sizeL; this.p1.h = sizeL;
      this.p2.w = sizeL; this.p2.h = sizeL;

      const p1cxPx = Math.floor(vw * 0.50 + vx);
      const p1cyPx = Math.floor(vh * 0.14 + vy);
      const p2cxPx = Math.floor(vw * 0.50 + vx);
      const p2cyPx = Math.floor(vh * 0.86 + vy);

      const p1cx = toLogicalX(p1cxPx);
      const p1cy = toLogicalY(p1cyPx);
      const p2cx = toLogicalX(p2cxPx);
      const p2cy = toLogicalY(p2cyPx);

      const w1 = this._logicalCenterToWorld(p1cx, p1cy);
      const w2 = this._logicalCenterToWorld(p2cx, p2cy);
      this.p1Pos.x = w1.x; this.p1Pos.y = w1.y;
      this.p2Pos.x = w2.x; this.p2Pos.y = w2.y;

      this.p1.setRotation(Math.PI);
      this.p2.setRotation(0);
    }
  }

  _applyPhysics(dt, desired) {
    // desired: -1, 0, 1 for each player along active axis
    // Change direction resets velocity to 0
    function sign(n) { return n < 0 ? -1 : (n > 0 ? 1 : 0); }

    // P1
    if (desired.p1 !== 0 && sign(this.p1Vel) !== desired.p1) {
      this.p1Vel = 0;
    }
    if (desired.p1 !== 0) {
      this.p1Vel += desired.p1 * this.accel * dt;
      if (this.p1Vel > this.maxSpeed) { this.p1Vel = this.maxSpeed; }
      if (this.p1Vel < -this.maxSpeed) { this.p1Vel = -this.maxSpeed; }
    } else {
      if (this.p1Vel > 0) { this.p1Vel = Math.max(0, this.p1Vel - this.decel * dt); }
      else if (this.p1Vel < 0) { this.p1Vel = Math.min(0, this.p1Vel + this.decel * dt); }
    }

    // P2
    if (desired.p2 !== 0 && sign(this.p2Vel) !== desired.p2) {
      this.p2Vel = 0;
    }
    if (desired.p2 !== 0) {
      this.p2Vel += desired.p2 * this.accel * dt;
      if (this.p2Vel > this.maxSpeed) { this.p2Vel = this.maxSpeed; }
      if (this.p2Vel < -this.maxSpeed) { this.p2Vel = -this.maxSpeed; }
    } else {
      if (this.p2Vel > 0) { this.p2Vel = Math.max(0, this.p2Vel - this.decel * dt); }
      else if (this.p2Vel < 0) { this.p2Vel = Math.min(0, this.p2Vel + this.decel * dt); }
    }

    // Integrate along the active axis
    if (this.orientation === "landscape") {
      this.p1Pos.y += this.p1Vel * dt;
      this.p2Pos.y += this.p2Vel * dt;
    } else {
      this.p1Pos.x += this.p1Vel * dt;
      this.p2Pos.x += this.p2Vel * dt;
    }

    // Clamp so players cannot leave the visible world area (center-based clamp)
    // Use the visual "hot" zone instead of the full 256x256 image bounds.
    const hs1 = this._hotLogicalSize(this.p1);
    const hs2 = this._hotLogicalSize(this.p2);

    const halfW1 = this._charWorldSizeX(hs1.w);
    const halfH1 = this._charWorldSizeY(hs1.h);
    const halfW2 = this._charWorldSizeX(hs2.w);
    const halfH2 = this._charWorldSizeY(hs2.h);

    this.p1Pos.x = Math.max(halfW1, Math.min(this.worldW - halfW1, this.p1Pos.x));
    this.p1Pos.y = Math.max(halfH1, Math.min(this.worldH - halfH1, this.p1Pos.y));
    this.p2Pos.x = Math.max(halfW2, Math.min(this.worldW - halfW2, this.p2Pos.x));
    this.p2Pos.y = Math.max(halfH2, Math.min(this.worldH - halfH2, this.p2Pos.y));
  }

  _clampToArena(s) {
    // Intentionally left empty – players can leave the visible screen
  }

  _hotLogicalSize(char) {
    // Character is rendered by fitting UNIT width and TOTAL_H height into char.w/char.h using scale s
    // Hot zone is 128 (width) x 256 (height) per part; two parts overlap by OVERLAP vertically.
    const UNIT = 256;
    const OVERLAP = 40;
    const TOTAL_H = UNIT + UNIT - OVERLAP; // 472

    const s = Math.min(char.w / UNIT, char.h / TOTAL_H);

    // Base hot zone (unrotated): width shrinks to 128*s, height stays TOTAL_H*s
    const hotW = Math.floor(128 * s);
    const hotH = Math.floor(TOTAL_H * s);

    // Adjust for rotation by 90/270 degrees where axes swap.
    const rot = char.rotationRad || 0;
    const turns = Math.round((rot / (Math.PI * 0.5))) % 4;
    if (turns === 1 || turns === 3) {
      return { w: hotH, h: hotW };
    }

    return { w: hotW, h: hotH };
  }

  _computeRenderScale(char) {
    const UNIT = 256;
    const OVERLAP = 40;
    const TOTAL_H = UNIT + UNIT - OVERLAP; // 472

    return Math.min(char.w / UNIT, char.h / TOTAL_H);
  }

  _headHotRect(char) {
    // Compute the unrotated head hot-zone rect in logical coordinates
    // Head area in render spans drawHeadH vertically starting at baseY
    const UNIT = 256;
    const OVERLAP = 40;
    const TOTAL_H = UNIT + UNIT - OVERLAP; // 472
    const s = this._computeRenderScale(char);

    const drawW = Math.floor(UNIT * s);
    const drawHeadH = Math.floor(UNIT * s);
    const drawTotalH = Math.floor(TOTAL_H * s);

    const baseX = Math.floor(char.x + (char.w - drawW) * 0.5);
    const baseY = Math.floor(char.y + (char.h - drawTotalH) * 0.5);

    const headX = baseX;
    const headY = baseY;

    // Centered 128x256 hot zone inside the head area
    const hotW = Math.floor(128 * s);
    const hotH = Math.floor(256 * s);
    const hotX = Math.floor(headX + (drawW - hotW) * 0.5);
    const hotY = Math.floor(headY + (drawHeadH - hotH) * 0.5);

    return { x: hotX, y: hotY, w: hotW, h: hotH };
  }

  _pointInHeadHot(char, lx, ly) {
    // Inverse-rotate point around character center, then test against unrotated rect
    const cx = char.x + Math.floor(char.w * 0.5);
    const cy = char.y + Math.floor(char.h * 0.5);
    const rot = char.rotationRad || 0;

    const dx = lx - cx;
    const dy = ly - cy;

    const cos = Math.cos(-rot);
    const sin = Math.sin(-rot);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;

    const ux = cx + rx;
    const uy = cy + ry;

    const r = this._headHotRect(char);
    return (ux >= r.x && uy >= r.y && ux < (r.x + r.w) && uy < (r.y + r.h));
  }

  _charWorldSizeX(pxWidth) {
    // Convert pixel width to world width and return half (used for centering)
    const sx = pxWidth / this.width;
    return Math.max(1, Math.floor(0.5 * sx * this.worldW));
  }

  _charWorldSizeY(pxHeight) {
    // Convert pixel height to world height and return half (used for centering)
    const sy = pxHeight / this.height;
    return Math.max(1, Math.floor(0.5 * sy * this.worldH));
  }

  _worldToScreenFor(wx, wy, pw, ph) {
    if (this.orientation === "landscape") {
      const x = Math.floor((wx / this.worldW) * this.width);
      const y = Math.floor((wy / this.worldH) * this.height);
      return { x: x - Math.floor(pw * 0.5), y: y - Math.floor(ph * 0.5) };
    } else {
      // In portrait, keep world axes aligned to screen axes for simplicity
      const x = Math.floor((wx / this.worldW) * this.width);
      const y = Math.floor((wy / this.worldH) * this.height);
      return { x: x - Math.floor(pw * 0.5), y: y - Math.floor(ph * 0.5) };
    }
  }

  _logicalCenterToWorld(cx, cy) {
    const wx = (cx / this.width) * this.worldW;
    const wy = (cy / this.height) * this.worldH;
    return { x: Math.floor(wx), y: Math.floor(wy) };
  }
}
