import { MenuScene } from "./MenuScene.js";
import { Character } from "../entities/Character.js";

export class GameOverScene {
  constructor(params) {

    this.renderer = null;
    this.input = null;
    this.app = null;
    this.loader = null;

    this.width = 0;
    this.height = 0;
    this.orientation = "landscape";

    this._tile = null;

    // winner info
    this.winnerId = params && params.winnerId ? params.winnerId : "p1"; // "p1" | "p2"
    this.winnerScore = params && typeof params.winnerScore === "number" ? params.winnerScore : 0;
    this.winnerAvatar = params && params.winnerAvatar ? params.winnerAvatar : "player1"; // "player1".."player4"

    const cfg = params && params.winnerConfig ? params.winnerConfig : {};
    this.avatar = new Character({ bodyColor: cfg.bodyColor || "#888", faceTopColor: cfg.faceTopColor || "#bbb", faceBottomColor: cfg.faceBottomColor || "#666", w: 200, h: 200 });
    if (cfg.headImage) { this.avatar.setHeadImage(cfg.headImage); }
    if (cfg.bodyImage) { this.avatar.setBodyImage(cfg.bodyImage); }
    if (cfg.bodyFrames) { this.avatar.setBodyFrames(cfg.bodyFrames); }

    this._message = "";
    this._messageLoaded = false;

    // Text layout & scrolling
    this._textBox = { x: 0, y: 0, w: 0, h: 0 };
    this._lines = [];
    this._lineHeight = 24;
    this._totalTextHeight = 0;
    this._scroll = 0;
    this._scrollSpeed = 15; // px per second (slower)
    this._scrollDir = 1; // 1 = down, -1 = up (bounce)
  }

  async _loadTiles() {

    try {
      const active = await this.loader.loadImage("./img/tiles/behaton.png");
      this._tile = active;
    } catch (e) {
    }
  }

  async _loadMessage() {

    try {
      const resp = await fetch("./src/npc/avatar_messages.json", { cache: "no-cache" });
      if (!resp.ok) {
        throw new Error("failed json");
      }
      const data = await resp.json();
      const key = this.winnerAvatar && typeof this.winnerAvatar === "string" ? this.winnerAvatar : "player1";
      const msg = data && data[key] ? String(data[key]) : "";
      this._message = msg;
      this._messageLoaded = true;
    } catch (e) {
      this._message = "";
      this._messageLoaded = true;
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

    this._loadTiles();

    this._loadMessage();
  }

  onExit() {

  }

  onResize(w, h, orientation) {

    this.width = w;
    this.height = h;
    this.orientation = orientation;

    // Update avatar display size depending on orientation
    const base = Math.min(this.renderer.displayWidth, this.renderer.displayHeight);
    if (this.orientation === "landscape") {
      const sizePx = Math.floor(base * 0.36);
      this.avatar.w = sizePx;
      this.avatar.h = sizePx;
      this.avatar.setRotation(0);
    } else {
      const sizePx = Math.floor(base * 0.48);
      this.avatar.w = sizePx;
      this.avatar.h = sizePx;
      // In portrait we show avatar upright; we will rotate whole screen if winner is P1
      this.avatar.setRotation(0);
    }
  }

  update(dt, t) {

    this.avatar.update(dt);

    // Any action (P1 Space, P2 Enter, or central tap) returns to menu
    if (this.input.consumeKeyPress("Space") || this.input.consumeKeyPress("Enter")) {
      this._backToMenu();
      return;
    }

    const taps = this.input.consumeTaps();
    if (taps && taps.length > 0) {
      this._backToMenu();
      return;
    }

    // Scroll text if it overflows (bounce)
    const overflow = Math.max(0, this._totalTextHeight - this._textBox.h);
    if (overflow > 0) {
      this._scroll += this._scrollSpeed * dt * this._scrollDir;
      if (this._scroll < 0) {
        this._scroll = 0;
        this._scrollDir = 1;
      } else if (this._scroll > overflow) {
        this._scroll = overflow;
        this._scrollDir = -1;
      }
    } else {
      this._scroll = 0;
      this._scrollDir = 1;
    }
  }

  render(renderer) {

    if (this.orientation !== renderer.orientation || this.width !== renderer.logicalWidth || this.height !== renderer.logicalHeight) {
      this.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }

    renderer.screenPush();

    if (this._tile) {
      this.renderer.tileImageScreen(this._tile);
    }

    const dw = this.renderer.displayWidth;
    const dh = this.renderer.displayHeight;
    const base = Math.min(dw, dh);

    // Determine winner-facing rotation in portrait mode
    const rotateForWinner = (this.orientation === "portrait" && this.winnerId === "p1");
    if (rotateForWinner) {
      const cx = Math.floor(dw * 0.5);
      const cy = Math.floor(dh * 0.5);
      this.renderer.translate(cx, cy);
      this.renderer.rotate(Math.PI);
      this.renderer.translate(-cx, -cy);
    }

    // Layout
    let avatarX = 0;
    let avatarY = 0;
    let scoreX = 0;
    let scoreY = 0;
    let boxX = 0;
    let boxY = 0;
    let boxW = 0;
    let boxH = 0;

    const scoreFont = Math.max(16, Math.floor(base * 0.06));
    const textFont = Math.max(12, Math.floor(base * 0.032));
    const gap = Math.max(12, Math.floor(base * 0.03));

    if (this.orientation === "landscape") {
      // Avatar on left third, text box on right, score below avatar
      const avW = this.avatar.w;
      const avH = this.avatar.h;
      avatarX = Math.floor(dw * 0.20 - avW * 0.5);
      avatarY = Math.floor(dh * 0.50 - avH * 0.5);

      scoreX = Math.floor(dw * 0.20);
      scoreY = Math.floor(avatarY + avH + gap);

      boxX = Math.floor(dw * 0.42);
      boxY = Math.floor(dh * 0.24);
      boxW = Math.floor(dw * 0.50);
      boxH = Math.floor(dh * 0.52);
    } else {
      // Portrait: center avatar; score below; text box below score
      const avW = this.avatar.w;
      const avH = this.avatar.h;
      avatarX = Math.floor(dw * 0.50 - avW * 0.5);
      avatarY = Math.floor(dh * 0.20 - avH * 0.5);

      scoreX = Math.floor(dw * 0.50);
      scoreY = Math.floor(avatarY + avH + gap);

      boxX = Math.floor(dw * 0.10);
      boxY = Math.floor(scoreY + gap);
      boxW = Math.floor(dw * 0.80);
      boxH = Math.floor(dh - boxY - Math.floor(base * 0.08));
    }

    this.avatar.setPosition(avatarX, avatarY);

    // Render avatar
    this.avatar.render(this.renderer);

    // Render winner + score (localized)
    const ctx = this.renderer.ctx;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold " + scoreFont + "px sans-serif";
    const label = "победио си! " + String(this.winnerScore) + " поена";
    this.renderer.drawText(label, scoreX, scoreY, "#ffffff", "bold " + scoreFont + "px sans-serif", "center");

    // Render text box
    this._textBox = { x: boxX, y: boxY, w: boxW, h: boxH };
    this._wrapTextLines(textFont);

    // Box background
    this.renderer.drawRect(boxX, boxY, boxW, boxH, "rgba(0,0,0,0.5)");

    // Clip to box and render lines with scroll
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = textFont + "px sans-serif";

    const lh = this._lineHeight;
    let y = boxY + 8 - Math.floor(this._scroll);
    const x = boxX + 12;

    for (let i = 0; i < this._lines.length; i++) {
      ctx.fillText(this._lines[i], x, y);
      y += lh;
    }

    ctx.restore();

    renderer.screenPop();
  }

  _wrapTextLines(fontPx) {

    const ctx = this.renderer.ctx;
    ctx.font = fontPx + "px sans-serif";

    const maxW = Math.max(0, this._textBox.w - 24);
    this._lineHeight = Math.max(12, Math.floor(fontPx * 1.35));

    const text = this._messageLoaded ? (this._message || "") : "";
    const words = text.split(/\s+/);

    const lines = [];
    let current = "";

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const candidate = current.length === 0 ? w : current + " " + w;
      const width = ctx.measureText(candidate).width;
      if (width <= maxW) {
        current = candidate;
      } else {
        if (current.length > 0) {
          lines.push(current);
        }
        // If single word is too long, hard break it
        if (ctx.measureText(w).width > maxW) {
          const broken = this._hardBreakWord(w, maxW, ctx);
          for (let j = 0; j < broken.length; j++) {
            lines.push(broken[j]);
          }
          current = "";
        } else {
          current = w;
        }
      }
    }
    if (current.length > 0) {
      lines.push(current);
    }

    this._lines = lines;
    this._totalTextHeight = this._lines.length * this._lineHeight + 8;
  }

  _hardBreakWord(word, maxW, ctx) {

    const parts = [];
    let cur = "";
    for (let i = 0; i < word.length; i++) {
      const c = word.charAt(i);
      const cand = cur + c;
      if (ctx.measureText(cand).width <= maxW) {
        cur = cand;
      } else {
        if (cur.length > 0) {
          parts.push(cur);
        }
        cur = c;
      }
    }
    if (cur.length > 0) {
      parts.push(cur);
    }
    return parts;
  }

  _backToMenu() {

    if (this.app && typeof this.app.setScene === "function") {
      this.app.setScene(new MenuScene());
    }
  }
}
