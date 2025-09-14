export class Input {
  constructor(renderer) {
    this.renderer = renderer;

    this.keysDown = new Set();
    this._pressedOnce = new Set();

    this.pointerStates = [];
    this._tapQueue = [];
    this._pointerDownMeta = new Map();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this._install();
  }

  _install() {
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    const canvas = this.renderer.canvas;
    // Use non-passive listeners so we can preventDefault to stop page panning/zooming
    canvas.addEventListener("pointerdown", this._onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", this._onPointerMove, { passive: false });
    canvas.addEventListener("pointerup", this._onPointerUp, { passive: false });
    canvas.addEventListener("pointercancel", this._onPointerUp, { passive: false });
    canvas.addEventListener("pointerout", this._onPointerUp, { passive: false });
    canvas.addEventListener("pointerleave", this._onPointerUp, { passive: false });
  }

  destroy() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);

    const canvas = this.renderer.canvas;
    canvas.removeEventListener("pointerdown", this._onPointerDown);
    canvas.removeEventListener("pointermove", this._onPointerMove);
    canvas.removeEventListener("pointerup", this._onPointerUp);
    canvas.removeEventListener("pointercancel", this._onPointerUp);
    canvas.removeEventListener("pointerout", this._onPointerUp);
    canvas.removeEventListener("pointerleave", this._onPointerUp);
  }

  isDown(code) {
    return this.keysDown.has(code);
  }

  _onKeyDown(e) {
    if (!this.keysDown.has(e.code)) {
      this._pressedOnce.add(e.code);
    }
    this.keysDown.add(e.code);
  }

  _onKeyUp(e) {
    this.keysDown.delete(e.code);
  }

  consumeKeyPress(code) {
    if (this._pressedOnce.has(code)) {
      this._pressedOnce.delete(code);
      return true;
    }

    return false;
  }

  _normalizePointer(ev) {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    const px = x / rect.width;
    const py = y / rect.height;

    return { x: x, y: y, px: px, py: py };
  }

  _getPointerIndex(id) {
    for (let i = 0; i < this.pointerStates.length; i++) {
      if (this.pointerStates[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  _onPointerDown(ev) {
    if (ev && typeof ev.preventDefault === "function") { ev.preventDefault(); }
    this.renderer.canvas.setPointerCapture(ev.pointerId);

    const n = this._normalizePointer(ev);

    this.pointerStates.push({ id: ev.pointerId, down: true, x: n.x, y: n.y, px: n.px, py: n.py, downX: n.x, downY: n.y, downPx: n.px, downPy: n.py });
    this._pointerDownMeta.set(ev.pointerId, { t: performance.now(), x: n.x, y: n.y });
  }

  _onPointerMove(ev) {
    if (ev && typeof ev.preventDefault === "function") { ev.preventDefault(); }
    const idx = this._getPointerIndex(ev.pointerId);
    if (idx === -1) {
      return;
    }

    const n = this._normalizePointer(ev);
    const ps = this.pointerStates[idx];
    ps.x = n.x;
    ps.y = n.y;
    ps.px = n.px;
    ps.py = n.py;
  }

  _onPointerUp(ev) {
    if (ev && typeof ev.preventDefault === "function") { ev.preventDefault(); }
    const idx = this._getPointerIndex(ev.pointerId);
    if (idx === -1) {
      return;
    }

    const meta = this._pointerDownMeta.get(ev.pointerId);
    const now = performance.now();
    const n = this._normalizePointer(ev);
    if (meta) {
      const dt = now - meta.t;
      const dx = n.x - meta.x;
      const dy = n.y - meta.y;
      const dist2 = dx * dx + dy * dy;
      if (dt <= 250 && dist2 <= 25 * 25) {
        this._tapQueue.push({ x: n.x, y: n.y, px: n.px, py: n.py, t: now, downX: meta.x, downY: meta.y });
      }
      this._pointerDownMeta.delete(ev.pointerId);
    }

    this.pointerStates.splice(idx, 1);
  }

  consumeTaps() {
    const taps = this._tapQueue.slice();
    this._tapQueue.length = 0;
    return taps;
  }

  getDirectionalState() {
    const state = {
      p1: { up: false, down: false, left: false, right: false, action: false, actionKey: false, actionTouch: false },
      p2: { up: false, down: false, left: false, right: false, action: false, actionKey: false, actionTouch: false }
    };

    if (this.isDown("KeyW")) { state.p1.up = true; }
    if (this.isDown("KeyS")) { state.p1.down = true; }
    if (this.isDown("KeyA")) { state.p1.left = true; }
    if (this.isDown("KeyD")) { state.p1.right = true; }
    if (this.isDown("Space")) { state.p1.action = true; state.p1.actionKey = true; }

    if (this.isDown("ArrowUp")) { state.p2.up = true; }
    if (this.isDown("ArrowDown")) { state.p2.down = true; }
    if (this.isDown("ArrowLeft")) { state.p2.left = true; }
    if (this.isDown("ArrowRight")) { state.p2.right = true; }
    if (this.isDown("Enter")) { state.p2.action = true; state.p2.actionKey = true; }

    for (let i = 0; i < this.pointerStates.length; i++) {
      const p = this.pointerStates[i];

      const isLandscape = this.renderer.orientation === "landscape";

      if (isLandscape) {
        if (p.px < 0.5) {
          this._applyTouchToPlayer(state.p1, p);
        } else {
          this._applyTouchToPlayer(state.p2, p);
        }
      } else {
        if (p.py < 0.5) {
          this._applyTouchToPlayer(state.p1, p);
        } else {
          this._applyTouchToPlayer(state.p2, p);
        }
      }
    }

    return state;
  }

  _applyTouchToPlayer(playerState, p) {
    const cx = p.px < 0.5 ? p.px * 2.0 : (p.px - 0.5) * 2.0;
    const cy = p.py < 0.5 ? p.py * 2.0 : (p.py - 0.5) * 2.0;

    const dx = cx - 0.5;
    const dy = cy - 0.5;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (ax > ay) {
      if (dx < -0.15) { playerState.left = true; }
      if (dx > 0.15) { playerState.right = true; }
    } else {
      if (dy < -0.15) { playerState.up = true; }
      if (dy > 0.15) { playerState.down = true; }
    }

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.2) {
      playerState.action = true;
      playerState.actionTouch = true;
    }
  }
}
