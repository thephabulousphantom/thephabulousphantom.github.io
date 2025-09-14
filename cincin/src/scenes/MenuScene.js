import { GameScene } from "./GameScene.js";
import { Character } from "../entities/Character.js";

export class MenuScene {
  constructor() {

    this.renderer = null;
    this.input = null;
    this.app = null;

    this.width = 0;
    this.height = 0;
    this.orientation = "landscape";

    this.title = "Нахрани службеника";

    // High scores removed from menu

    this.player1ColorIndex = 0;
    this.player2ColorIndex = 1;
    this.availableColors = ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#2ecc71", "#e67e22"];

    this.selected = false;

    this.characterConfigs = [
      { bodyColor: "#e74c3c", faceTopColor: "#f4d03f", faceBottomColor: "#c0392b" },
      { bodyColor: "#3498db", faceTopColor: "#85c1e9", faceBottomColor: "#2e86c1" },
      { bodyColor: "#2ecc71", faceTopColor: "#abebc6", faceBottomColor: "#27ae60" },
      { bodyColor: "#9b59b6", faceTopColor: "#d2b4de", faceBottomColor: "#8e44ad" }
    ];

    this.p1Index = 0;
    this.p2Index = 1;
    this.p1Avatar = new Character(this.characterConfigs[this.p1Index]);
    this.p2Avatar = new Character(this.characterConfigs[this.p2Index]);

    this._p1Bounds = { x: 0, y: 0, w: 0, h: 0 };
    this._p2Bounds = { x: 0, y: 0, w: 0, h: 0 };

    this._p1ScreenBounds = { x: 0, y: 0, w: 0, h: 0 };
    this._p2ScreenBounds = { x: 0, y: 0, w: 0, h: 0 };

    this._headImages = [];
    this._bodyImages = [];

    this._playImage = null;
    this._playBounds = { x: 0, y: 0, w: 0, h: 0 };
    this._titleImage = null;
  }

  async _loadTiles() {

    try {
      const active = await this.loader.loadImage("./img/tiles/behaton.png");
      const inactive = await this.loader.loadImage("./img/tiles/background-inactive.png");
      this._activeTile = active;
      this._inactiveTile = inactive;
    } catch (e) {
    }
  }

  async _loadHeads() {

    try {
      const h1 = await this.loader.loadImage("./img/characters/player1-head.png");
      const h2 = await this.loader.loadImage("./img/characters/player2-head.png");
      const h3 = await this.loader.loadImage("./img/characters/player3-head.png");
      const h4 = await this.loader.loadImage("./img/characters/player4.head.png");
      this._headImages = [h1, h2, h3, h4];

      if (this.p1Avatar) {
        const img1 = this._headImages[this.p1Index];
        if (img1) { this.p1Avatar.setHeadImage(img1); }
      }

      if (this.p2Avatar) {
        const img2 = this._headImages[this.p2Index];
        if (img2) { this.p2Avatar.setHeadImage(img2); }
      }
    } catch (e) {
    }
  }

  async _loadBodies() {

    try {
      const b1 = await this.loader.loadImage("./img/characters/player1-body.png");
      const b2 = await this.loader.loadImage("./img/characters/player2-body.png");
      const b3 = await this.loader.loadImage("./img/characters/player3-body.png");
      const b4 = await this.loader.loadImage("./img/characters/player4-body.png");
      this._bodyImages = [b1, b2, b3, b4];

      if (this.p1Avatar) {
        const bimg1 = this._bodyImages[this.p1Index];
        if (bimg1) { this.p1Avatar.setBodyImage(bimg1); }
      }

      if (this.p2Avatar) {
        const bimg2 = this._bodyImages[this.p2Index];
        if (bimg2) { this.p2Avatar.setBodyImage(bimg2); }
      }
    } catch (e) {
    }
  }

  async _loadUI() {

    try {
      this._playImage = await this.loader.loadImage("./img/ui/play.png");
      this._titleImage = await this.loader.loadImage("./img/ui/title.png");
    } catch (e) {
    }
  }

  onEnter(ctx) {

    this.renderer = ctx.renderer;
    this.input = ctx.input;
    this.app = ctx.app;
    this.loader = ctx.loader;

    if (this.renderer && typeof this.renderer.setActiveTileScale === "function") {
      this.renderer.setActiveTileScale(0.1);
    }

    this._activeTile = null;
    this._inactiveTile = null;

    this._loadTiles();

    this._loadHeads();

    this._loadBodies();

    this._loadUI();
  }

  onExit() {

  }

  onResize(w, h, orientation) {

    this.width = w;
    this.height = h;
    this.orientation = orientation;
  }

  update(dt, t) {

    const dir = this.input.getDirectionalState();

    if (this.input.consumeKeyPress("KeyA")) { this._cycleAvatar(1, -1); }
    if (this.input.consumeKeyPress("KeyD")) { this._cycleAvatar(1, 1); }

    if (this.input.consumeKeyPress("ArrowLeft")) { this._cycleAvatar(2, -1); }
    if (this.input.consumeKeyPress("ArrowRight")) { this._cycleAvatar(2, 1); }

    const taps = this.input.consumeTaps();
    for (let i = 0; i < taps.length; i++) {
      const tap = taps[i];
      const sx = tap.x;
      const sy = tap.y;

      if (this._contains(this._p1ScreenBounds, sx, sy)) {
        this._cycleAvatar(1, 1);
        continue;
      }

      if (this._contains(this._p2ScreenBounds, sx, sy)) {
        this._cycleAvatar(2, 1);
        continue;
      }

      if (this._contains(this._playBounds, sx, sy)) {
        if (!this.selected) {
          this.selected = true;
          this._startGame();
        }
      }
    }

    if (this.input.consumeKeyPress("Enter") || this.input.consumeKeyPress("Space")) {
      if (!this.selected) {
        this.selected = true;
        this._startGame();
      }
    }

    if (this.p1Avatar) {
      this.p1Avatar.update(dt);
    }

    if (this.p2Avatar) {
      this.p2Avatar.update(dt);
    }
  }

  render(renderer) {

    // If renderer state changed since last onResize, resync our cached values to avoid stale layout
    if (this.orientation !== renderer.orientation || this.width !== renderer.logicalWidth || this.height !== renderer.logicalHeight) {
      this.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }

    const dw = this.renderer.displayWidth;
    const dh = this.renderer.displayHeight;
    const cx = Math.floor(dw * 0.5);
    const orientation = this.renderer.orientation;

    if (this._inactiveTile) {
      this.renderer.setInactiveTileImage(this._inactiveTile);
    }

    const p1 = this.p1Avatar;
    const p2 = this.p2Avatar;

    let p1x = 0;
    let p1y = 0;
    let p2x = 0;
    let p2y = 0;

    renderer.screenPush();

    if (this._activeTile) {
      this.renderer.tileImageScreen(this._activeTile);
    }

    const base = Math.min(dw, dh);
    const titleFS = Math.floor(base * 0.08);
    const tipsFS = Math.max(12, Math.floor(base * 0.018));

    if (orientation === "landscape") {

      // Compute title sizing
      let titleW = 0, titleH = 0;
      if (this._titleImage) {
        const tiw = this._titleImage.naturalWidth || this._titleImage.width || 1;
        const tih = this._titleImage.naturalHeight || this._titleImage.height || 1;
        const taspect = tiw / Math.max(1, tih);
        titleW = Math.floor(base * 0.6);
        titleH = Math.floor(titleW / Math.max(0.01, taspect));
      }

      // Characters
      p1.w = p1.h = Math.floor(Math.min(dw, dh) * 0.36);
      p2.w = p2.h = p1.w;

      p1x = Math.floor(dw * 0.15 - p1.w * 0.5);
      p1y = Math.floor(dh * 0.5 - p1.h * 0.5);
      p2x = Math.floor(dw * 0.85 - p2.w * 0.5);
      p2y = Math.floor(dh * 0.5 - p2.h * 0.5);

      p1.setRotation(0);
      p2.setRotation(0);
      p1.setAnchorRight(true);
      p2.setAnchorRight(false);

      // Compute play button sizing
      let bw = Math.floor(base * 0.22);
      let bh = Math.floor(bw * 0.35);
      if (this._playImage) {
        const piw = this._playImage.naturalWidth || this._playImage.width || bw;
        const pih = this._playImage.naturalHeight || this._playImage.height || bh;
        const paspect = piw / Math.max(1, pih);
        bh = Math.floor(bw / Math.max(0.01, paspect));
      }

      // Initial centers (previous layout)
      const initialTitleCenterY = this._titleImage ? Math.floor(dh * 0.12) + Math.floor(titleH * 0.5) : Math.floor(dh * 0.20);
      const initialBtnCenterY = Math.floor(dh * 0.52);

      // Shift both so their midpoint is screen center
      const midpoint = Math.floor(dh * 0.5);
      const currentMid = Math.floor((initialTitleCenterY + initialBtnCenterY) * 0.5);
      const delta = midpoint - currentMid;
      const titleCenterY = initialTitleCenterY + delta;
      const btnCenterY = initialBtnCenterY + delta;

      // Draw title
      if (this._titleImage) {
        const bx = Math.floor(cx - titleW * 0.5);
        const by = Math.floor(titleCenterY - titleH * 0.5);
        this.renderer.drawImageScreen(this._titleImage, bx, by, titleW, titleH);
      } else {
        renderer.drawText(this.title, cx, titleCenterY, "#ffffff", titleFS + "px sans-serif", "center");
      }

      // Draw button
      const bbx = Math.floor(cx - bw * 0.5);
      const bby = Math.floor(btnCenterY - bh * 0.5);
      this._playBounds = { x: bbx, y: bby, w: bw, h: bh };
      if (this._playImage) {
        this.renderer.drawImageScreen(this._playImage, bbx, bby, bw, bh);
      } else {
        this.renderer.drawRect(bbx, bby, bw, bh, "#ffffff");
      }

      // High scores removed
    } else {

      // Compute title sizing (portrait)
      let titleW = 0, titleH = 0;
      if (this._titleImage) {
        const tiw = this._titleImage.naturalWidth || this._titleImage.width || 1;
        const tih = this._titleImage.naturalHeight || this._titleImage.height || 1;
        const taspect = tiw / Math.max(1, tih);
        titleW = Math.floor(base * 0.75);
        titleH = Math.floor(titleW / Math.max(0.01, taspect));
      }

      p1.w = p1.h = Math.floor(Math.min(dw, dh) * 0.48);
      p2.w = p2.h = p1.w;

      p1x = Math.floor(dw * 0.5 - p1.w * 0.5);
      p1y = Math.floor(dh * 0.14 - p1.h * 0.5);
      p2x = Math.floor(dw * 0.5 - p2.w * 0.5);
      p2y = Math.floor(dh * 0.86 - p2.h * 0.5);

      if (p1y < 0) { p1y = 0; }
      if (p2y + p2.h > dh) { p2y = dh - p2.h; }

      p1.setRotation(Math.PI);
      p2.setRotation(0);
      p1.setAnchorRight(true);
      p2.setAnchorRight(false);

      // Compute play button sizing
      let bw = Math.floor(base * 0.26);
      let bh = Math.floor(bw * 0.35);
      if (this._playImage) {
        const piw = this._playImage.naturalWidth || this._playImage.width || bw;
        const pih = this._playImage.naturalHeight || this._playImage.height || bh;
        const paspect = piw / Math.max(1, pih);
        bh = Math.floor(bw / Math.max(0.01, paspect));
      }

      // Initial centers (previous layout)
      const initialTitleCenterY = this._titleImage ? Math.floor(dh * 0.22) + Math.floor(titleH * 0.5) : Math.floor(dh * 0.36);
      const initialBtnCenterY = Math.floor(dh * 0.52);

      // Shift both so their midpoint is screen center
      const midpoint = Math.floor(dh * 0.5);
      const currentMid = Math.floor((initialTitleCenterY + initialBtnCenterY) * 0.5);
      const delta = midpoint - currentMid;
      const titleCenterY = initialTitleCenterY + delta;
      const btnCenterY = initialBtnCenterY + delta;

      // Draw title
      if (this._titleImage) {
        const bx = Math.floor(cx - titleW * 0.5);
        const by = Math.floor(titleCenterY - titleH * 0.5);
        this.renderer.drawImageScreen(this._titleImage, bx, by, titleW, titleH);
      } else {
        renderer.drawText(this.title, cx, titleCenterY, "#ffffff", titleFS + "px sans-serif", "center");
      }

      // Draw button
      const bbx = Math.floor(cx - bw * 0.5);
      const bby = Math.floor(btnCenterY - bh * 0.5);
      this._playBounds = { x: bbx, y: bby, w: bw, h: bh };
      if (this._playImage) {
        this.renderer.drawImageScreen(this._playImage, bbx, bby, bw, bh);
      } else {
        this.renderer.drawRect(bbx, bby, bw, bh, "#ffffff");
      }

      // High scores removed
    }

    p1.setPosition(p1x, p1y);
    p2.setPosition(p2x, p2y);

    this._p1ScreenBounds = { x: p1x, y: p1y, w: p1.w, h: p1.h };
    this._p2ScreenBounds = { x: p2x, y: p2y, w: p2.w, h: p2.h };

    if (this.orientation === "landscape") {
      const c1x = p1x + Math.floor(p1.w * 0.5);
      const c1y = p1y + Math.floor(p1.h * 0.5);
      renderer.push();
      renderer.translate(c1x, c1y);
      renderer.scale(-1, 1);
      renderer.translate(-c1x, -c1y);
      p1.render(renderer);
      renderer.pop();
    } else {
      p1.render(renderer);
    }
    p2.render(renderer);

    const tips = "P1: A/D or Tap  |  P2: Left/Right or Tap  |  Enter/Space to Start";
    renderer.drawText(tips, cx, dh - Math.floor(tipsFS * 0.8), "#ffffff", tipsFS + "px sans-serif", "center");

    renderer.screenPop();
  }

  _cycleAvatar(player, dir) {

    if (player === 1) {
      this.p1Index = (this.p1Index + dir + this.characterConfigs.length) % this.characterConfigs.length;
      this.p1Avatar = new Character(this.characterConfigs[this.p1Index]);
      this.p1Avatar.laugh();
      const img = this._headImages[this.p1Index];
      if (img) { this.p1Avatar.setHeadImage(img); }
      const bimg = this._bodyImages[this.p1Index];
      if (bimg) { this.p1Avatar.setBodyImage(bimg); }
    } else {
      this.p2Index = (this.p2Index + dir + this.characterConfigs.length) % this.characterConfigs.length;
      this.p2Avatar = new Character(this.characterConfigs[this.p2Index]);
      this.p2Avatar.laugh();
      const img = this._headImages[this.p2Index];
      if (img) { this.p2Avatar.setHeadImage(img); }
      const bimg = this._bodyImages[this.p2Index];
      if (bimg) { this.p2Avatar.setBodyImage(bimg); }
    }
  }

  _startGame() {

    const colors = {
      p1: { ...this.characterConfigs[this.p1Index], headImage: this._headImages[this.p1Index], bodyImage: this._bodyImages[this.p1Index] },
      p2: { ...this.characterConfigs[this.p2Index], headImage: this._headImages[this.p2Index], bodyImage: this._bodyImages[this.p2Index] }
    };

    this.app.setScene(new GameScene(colors));
  }

  _contains(b, x, y) {

    return x >= b.x && y >= b.y && x <= b.x + b.w && y <= b.y + b.h;
  }
}
