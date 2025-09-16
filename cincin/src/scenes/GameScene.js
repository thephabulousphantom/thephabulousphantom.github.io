import { Background } from "../entities/Background.js";
import { Character } from "../entities/Character.js";
import { NPC } from "../entities/NPC.js";
import { Pellet } from "../entities/Pellet.js";
import { ScriptEngine } from "../npc/ScriptEngine.js";
import { MenuScene } from "./MenuScene.js";
import { GameOverScene } from "./GameOverScene.js";

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

    // Preserve original configs and avatar keys for Game Over scene
    this._p1Config = p1Cfg;
    this._p2Config = p2Cfg;
    this._p1AvatarKey = p1Cfg && p1Cfg.avatarKey ? p1Cfg.avatarKey : "player1";
    this._p2AvatarKey = p2Cfg && p2Cfg.avatarKey ? p2Cfg.avatarKey : "player2";

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

    // NPCs and Pellets
    this.npcs = [];
    this.pellets = [];

    this._npcImages = {
      boss: { body: null, bodyWalk: [], bodyShoot: null, head: null },
      lieutenant: { body: null, bodyWalk: [], bodyShoot: null, head: null }
    };

    this._playerImages = {
      p1: { body: null, bodyWalk: [], head: null },
      p2: { body: null, bodyWalk: [], head: null },
      p3: { body: null, bodyWalk: [], head: null },
      p4: { body: null, bodyWalk: [], head: null }
    };

    this._pelletFrames = [];
    this._pelletFPS = 5;

    this.script = new ScriptEngine({ orientationProvider: this._getOrientation.bind(this) });
    this._gameTime = 0;
    this._baselineSpeed = 300;
    this._pendingShots = [];
    this._localEvents = [];
    this._eventQueue = [];
    this._pendingEmotes = [];
    this._nextSpawnReadyAt = 0;

    // Scores (increment when absorbing pellets while eating)
    this.p1Score = 0;
    this.p2Score = 0;

    // Readiness flags to start gameplay only after assets and script are loaded
    this._assetsReady = false;
    this._scriptReady = false;
    this._ready = false;
  }

  async _loadTiles() {

    try {
      const active = await this.loader.loadImage("./img/tiles/behaton.png");
      this.bg.setTileImage(active);
    } catch (e) {
    }
  }

  async _loadNPCAssets() {

    try {
      const bossBody = await this.loader.loadImage("./img/characters/npc1-body.png");
      const bossBodyShoot = await this.loader.loadImage("./img/characters/npc1-body-shoot.png");
      const bossBodyWalk1 = await this.loader.loadImage("./img/characters/npc1-body-walk1.png");
      const bossBodyWalk2 = await this.loader.loadImage("./img/characters/npc1-body-walk2.png");
      const bossHead = await this.loader.loadImage("./img/characters/npc1-head.png");
      const ltBody = await this.loader.loadImage("./img/characters/npc2-body.png");
      const ltBodyShoot = await this.loader.loadImage("./img/characters/npc2-body-shoot.png");
      const ltBodyWalk1 = await this.loader.loadImage("./img/characters/npc2-body-walk1.png");
      const ltBodyWalk2 = await this.loader.loadImage("./img/characters/npc2-body-walk2.png");
      const ltHead = await this.loader.loadImage("./img/characters/npc2-head.png");
      const pelletImg1 = await this.loader.loadImage("./img/other/poo1.png");
      const pelletImg2 = await this.loader.loadImage("./img/other/poo2.png");
      // Players (1-4) body/head and walk frames
      const p1Body = await this.loader.loadImage("./img/characters/player1-body.png");
      const p1Walk1 = await this.loader.loadImage("./img/characters/player1-body-walk1.png");
      const p1Walk2 = await this.loader.loadImage("./img/characters/player1-body-walk2.png");
      const p1Head = await this.loader.loadImage("./img/characters/player1-head.png");

      const p2Body = await this.loader.loadImage("./img/characters/player2-body.png");
      const p2Walk1 = await this.loader.loadImage("./img/characters/player2-body-walk1.png");
      const p2Walk2 = await this.loader.loadImage("./img/characters/player2-body-walk2.png");
      const p2Head = await this.loader.loadImage("./img/characters/player2-head.png");

      const p3Body = await this.loader.loadImage("./img/characters/player3-body.png");
      const p3Walk1 = await this.loader.loadImage("./img/characters/player3-body-walk1.png");
      const p3Walk2 = await this.loader.loadImage("./img/characters/player3-body-walk2.png");
      const p3Head = await this.loader.loadImage("./img/characters/player3-head.png");

      const p4Body = await this.loader.loadImage("./img/characters/player4-body.png");
      const p4Walk1 = await this.loader.loadImage("./img/characters/player4-body-walk1.png");
      const p4Walk2 = await this.loader.loadImage("./img/characters/player4-body-walk2.png");
      const p4Head = await this.loader.loadImage("./img/characters/player4-head.png");

      const hpImg = await this.loader.loadImage("./img/ui/health.png");

      this._npcImages.boss.body = bossBody;
      this._npcImages.boss.bodyShoot = bossBodyShoot;
      this._npcImages.boss.bodyWalk = [];
      if (bossBodyWalk1) { this._npcImages.boss.bodyWalk.push(bossBodyWalk1); }
      if (bossBodyWalk2) { this._npcImages.boss.bodyWalk.push(bossBodyWalk2); }
      this._npcImages.boss.head = bossHead;
      this._npcImages.lieutenant.body = ltBody;
      this._npcImages.lieutenant.bodyShoot = ltBodyShoot;
      this._npcImages.lieutenant.bodyWalk = [];
      if (ltBodyWalk1) { this._npcImages.lieutenant.bodyWalk.push(ltBodyWalk1); }
      if (ltBodyWalk2) { this._npcImages.lieutenant.bodyWalk.push(ltBodyWalk2); }
      this._npcImages.lieutenant.head = ltHead;
      this._pelletFrames = [];
      if (pelletImg1) { this._pelletFrames.push(pelletImg1); }
      if (pelletImg2) { this._pelletFrames.push(pelletImg2); }
      this._healthImage = hpImg;

      // Store player images
      this._playerImages.p1.body = p1Body; this._playerImages.p1.head = p1Head; this._playerImages.p1.bodyWalk = [];
      if (p1Walk1) { this._playerImages.p1.bodyWalk.push(p1Walk1); }
      if (p1Walk2) { this._playerImages.p1.bodyWalk.push(p1Walk2); }

      this._playerImages.p2.body = p2Body; this._playerImages.p2.head = p2Head; this._playerImages.p2.bodyWalk = [];
      if (p2Walk1) { this._playerImages.p2.bodyWalk.push(p2Walk1); }
      if (p2Walk2) { this._playerImages.p2.bodyWalk.push(p2Walk2); }

      this._playerImages.p3.body = p3Body; this._playerImages.p3.head = p3Head; this._playerImages.p3.bodyWalk = [];
      if (p3Walk1) { this._playerImages.p3.bodyWalk.push(p3Walk1); }
      if (p3Walk2) { this._playerImages.p3.bodyWalk.push(p3Walk2); }

      this._playerImages.p4.body = p4Body; this._playerImages.p4.head = p4Head; this._playerImages.p4.bodyWalk = [];
      if (p4Walk1) { this._playerImages.p4.bodyWalk.push(p4Walk1); }
      if (p4Walk2) { this._playerImages.p4.bodyWalk.push(p4Walk2); }

      // Apply to p1/p2 characters if available (players 3/4 reserved for future)
      if (this.p1) {
        if (this._playerImages.p1.head) { this.p1.setHeadImage(this._playerImages.p1.head); }
        this.p1.setBodyFrames({ idle: this._playerImages.p1.body || null, walk: (this._playerImages.p1.bodyWalk || []), shoot: null, fps: 5 });
      }
      if (this.p2) {
        if (this._playerImages.p2.head) { this.p2.setHeadImage(this._playerImages.p2.head); }
        this.p2.setBodyFrames({ idle: this._playerImages.p2.body || null, walk: (this._playerImages.p2.bodyWalk || []), shoot: null, fps: 5 });
      }
    } catch (e) {
    }
    // Mark assets ready regardless; if some fail, placeholders/nulls render, but timing gate is lifted only after attempt
    this._assetsReady = true;
    this._updateReadyState();
  }

  onEnter(ctx) {

    this.renderer = ctx.renderer;
    this.input = ctx.input;
    this.loader = ctx.loader;
    this.app = ctx.app;

    if (this.renderer && typeof this.renderer.setActiveTileScale === "function") {
      this.renderer.setActiveTileScale(0.1);
    }

    // Do not trigger initial laughs for players; laughs are event-driven

    this._loadTiles();

    this._loadNPCAssets();

    // Load scripted NPC schedule from JSON (non-blocking)
    this.script.load("./src/npc/script.json").then(this._onScriptLoaded.bind(this));

    // Initialize world positions near edges
    this._layoutPlayers();

    // Initialize health
    this.p1HP = 5;
    this.p2HP = 5;
    this._ended = false;

    // Cursor to keep deferred spawns in chronological order
    this._deferCursor = 0;
  }

  _onScriptLoaded() {

    this._scriptReady = true;
    this._updateReadyState();
  }

  _updateReadyState() {

    this._ready = this._assetsReady && this._scriptReady;
    if (this._ready) {
      // Reset script engine timeline to start from zero when ready
      if (this.script && typeof this.script.reset === "function") {
        this.script.reset();
      }
      this._gameTime = 0;
    }
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

    // Update player body animation modes based on movement
    const p1Moving = Math.abs(this.p1Vel) > 0.0001;
    const p2Moving = Math.abs(this.p2Vel) > 0.0001;
    if (this.p1 && typeof this.p1.setBodyAnimMode === "function") {
      this.p1.setBodyAnimMode(p1Moving ? "walk" : "idle");
    }
    if (this.p2 && typeof this.p2.setBodyAnimMode === "function") {
      this.p2.setBodyAnimMode(p2Moving ? "walk" : "idle");
    }

    // Advance time and baseline speed; process events only when fully ready
    let due = [];
    if (this._ready) {
      this._gameTime += dt;
      // Baseline speed increases by 10 per second
      this._baselineSpeed += 10 * dt;
      this.script.advance(dt);
      due = this.script.consumeDueEvents();
    }
    // Queue all due spawn events; preserve strict FIFO ordering
    for (let i = 0; i < due.length; i++) {
      const ev = due[i];
      if (ev.type === "spawn") {
        this._eventQueue.push(ev);
      }
    }

    // Fire pending shots
    this._processShots();

    // Update NPCs
    for (let i = 0; i < this.npcs.length; i++) {
      const n = this.npcs[i];
      n.setOrientation(this.orientation);
      n.update(dt);

      // Decide animation mode: shoot during active window; else walk if moving; else idle
      let shootActive = false;
      if (n._shootWindows && n._shootWindows.length > 0) {
        for (let w = 0; w < n._shootWindows.length; w++) {
          const win = n._shootWindows[w];
          if (this._gameTime >= win.start && this._gameTime <= win.end) {
            shootActive = true;
            break;
          }
        }
      }

      if (shootActive) {
        n.character.setBodyAnimMode("shoot");
      } else {
        const moving = Math.abs(n.vx) > 0.0001 || Math.abs(n.vy) > 0.0001;
        n.character.setBodyAnimMode(moving ? "walk" : "idle");
      }
    }
    // Cull NPCs first so exit-driven delay is applied before we consider spawning next
    this._cullNPCs();

    // If we ran out of events and the screen is empty, restart the script (new cycle)
    if (this._eventQueue.length === 0 && !this._findAnyActiveNPC() && this.script && this.script.loaded) {
      this.script.reset();
      const refill = this.script.consumeDueEvents();
      for (let i = 0; i < refill.length; i++) {
        const ev = refill[i];
        if (ev.type === "spawn") {
          this._eventQueue.push(ev);
        }
      }
      // Clear any pending delay; will be set below based on the new head event
      this._nextSpawnReadyAt = 0;
    }

    // If screen is empty and no delay is currently pending, honor the first event's delay
    if (this._eventQueue.length > 0 && !this._findAnyActiveNPC() && this._nextSpawnReadyAt === 0) {
      const head = this._eventQueue[0];
      const d = head && typeof head.t === "number" ? head.t : 0;
      this._nextSpawnReadyAt = this._gameTime + d;
    }

    // Spawn at most one NPC per frame and only when no NPC is active and delay window allows
    this._drainSpawnQueueOnce();

    // Sync character screen positions so absorption checks use accurate head hot-zones
    const p1sNow = this._worldToScreenFor(this.p1Pos.x, this.p1Pos.y, this.p1.w, this.p1.h);
    const p2sNow = this._worldToScreenFor(this.p2Pos.x, this.p2Pos.y, this.p2.w, this.p2.h);
    this.p1.setPosition(p1sNow.x, p1sNow.y);
    this.p2.setPosition(p2sNow.x, p2sNow.y);

    // Update pellets and handle reflections / despawn
    for (let i = 0; i < this.pellets.length; i++) {
      const p = this.pellets[i];
      p.setOrientation(this.orientation);
      p.update(dt);
      this._handlePelletBounds(p);
      this._handlePelletAbsorption(p);
      
      // NPC can eat pellets only after at least one bounce and if overlapping head hot-zone,
      // and avoid immediate self-eat by the shooter in the same instant.
      if (p.alive && p.bounces >= 1) {
        const rect = this._screenRectForSize(p.wx, p.wy, p.sizePx, p.sizePx);
        const cx = rect.x + Math.floor(rect.w * 0.5);
        const cy = rect.y + Math.floor(rect.h * 0.5);
        for (let n = 0; n < this.npcs.length && p.alive; n++) {
          const npc = this.npcs[n];
          if (this._pointInHeadHot(npc.character, cx, cy)) {
            // Skip if this is the shooter within a short grace window after spawn
            const recentlySpawned = (typeof p._spawnTime === "number") ? ((this._gameTime - p._spawnTime) < 0.25) : false;
            if (npc === p._shooter && recentlySpawned) {
              continue;
            }
            // Determine side: prefer last miss, else current position against screen center
            let side = p._lastMiss;
            if (side !== "p1" && side !== "p2") {
              if (this.orientation === "landscape") {
                side = (cx < this.width * 0.5) ? "p1" : "p2";
              } else {
                side = (cy < this.height * 0.5) ? "p1" : "p2";
              }
            }
            npc.character.eat();
            p.alive = false;
            p._death = "npc";
            p._npcTarget = side;
          }
        }
      }
    }
    this._cullPellets();

    // Check win/lose condition
    this._checkWin();
  }

  render(renderer) {

    // If renderer orientation or logical size changed since last onResize, resync layout.
    if (this.orientation !== renderer.orientation || this.width !== renderer.logicalWidth || this.height !== renderer.logicalHeight) {
      this.onResize(renderer.logicalWidth, renderer.logicalHeight, renderer.orientation);
    }

    this.bg.render(renderer, this.width, this.height);

    // Render health UI behind players
    // Compute screen-space positions for current characters to anchor UI if needed
    this._renderHealth(renderer, { x: 0, y: 0 }, { x: 0, y: 0 });

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

    // Render NPCs
    for (let i = 0; i < this.npcs.length; i++) {
      const n = this.npcs[i];
      // Keep NPC visual size equal to players
      n.character.w = this.p1.w;
      n.character.h = this.p1.h;
      const s = this._worldToScreenFor(n.wx, n.wy, n.character.w, n.character.h);
      n.setScreenRect(s.x, s.y, n.character.w, n.character.h);
      n.render(renderer);
    }

    // Render pellets
    for (let i = 0; i < this.pellets.length; i++) {
      const pl = this.pellets[i];
      const rect = this._screenRectForSize(pl.wx, pl.wy, pl.sizePx, pl.sizePx);
      pl.render(renderer, rect);
    }

    // Health already rendered behind players
    // Render scores opposite to health
    this._renderScores(renderer);
  }

  _renderHealth(renderer, p1s, p2s) {

    if (!this._healthImage) {
      return;
    }

    // Compute screen-space positions and sizes anchored to the screen edges
    const sw = renderer.displayWidth;
    const sh = renderer.displayHeight;
    const base = Math.min(sw, sh);
    const iconW = Math.max(8, Math.floor(base * 0.12));
    const iconH = iconW;
    const margin = Math.max(6, Math.floor(base * 0.008));
    // Overlap: 50% in landscape, 25% in portrait
    const overlap = this.orientation === "landscape" ? 0.5 : 0.25;
    const step = Math.max(1, Math.floor(iconH * (1 - overlap)));

    renderer.screenPush();

    // Determine icon counts: one per health point
    const p1Icons = Math.max(0, Math.floor(this.p1HP));
    const p2Icons = Math.max(0, Math.floor(this.p2HP));

    if (this.orientation === "landscape") {
      // Left screen edge (P1): from top to bottom
      const x1 = margin;
      let y = margin;
      for (let i = 0; i < p1Icons; i++) {
        renderer.drawImageScreen(this._healthImage, x1, y, iconW, iconH);
        y += step;
      }

      // Right screen edge (P2): from top to bottom
      const x2 = sw - iconW - margin;
      y = margin;
      for (let i = 0; i < p2Icons; i++) {
        renderer.drawImageScreen(this._healthImage, x2, y, iconW, iconH);
        y += step;
      }
    } else {
      // Portrait
      // Top screen edge (P1): right-to-left, rotated 180°
      let x = sw - margin - iconW;
      for (let i = 0; i < p1Icons; i++) {
        const bx = x - i * step;
        const by = margin;
        // rotate 180 degrees about the center of the icon in screen space
        const cx = bx + Math.floor(iconW * 0.5);
        const cy = by + Math.floor(iconH * 0.5);
        renderer.screenPush();
        renderer.translate(cx, cy);
        renderer.rotate(Math.PI);
        renderer.translate(-cx, -cy);
        renderer.drawImageScreen(this._healthImage, bx, by, iconW, iconH);
        renderer.screenPop();
      }

      // Bottom screen edge (P2): left-to-right
      const yBot = sh - margin - iconH;
      x = margin;
      for (let i = 0; i < p2Icons; i++) {
        const bx = x + i * step;
        renderer.drawImageScreen(this._healthImage, bx, yBot, iconW, iconH);
      }
    }

    renderer.screenPop();
  }

  _renderScores(renderer) {

    // Draw scores in screen space, opposite to health anchors.
    const sw = renderer.displayWidth;
    const sh = renderer.displayHeight;
    const base = Math.min(sw, sh);
    const margin = Math.max(6, Math.floor(base * 0.008));
    const fontPx = Math.max(10, Math.floor(base * 0.09));

    renderer.screenPush();
    const ctx = renderer.ctx;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    ctx.font = "bold " + fontPx + "px sans-serif";

    if (this.orientation === "landscape") {
      // Bottom-align scores on the SAME side as each player
      // P1 (left player) score at bottom-left
      ctx.textAlign = "left";
      ctx.fillText(String(this.p1Score), margin, sh - margin - fontPx);

      // P2 (right player) score at bottom-right
      ctx.textAlign = "right";
      ctx.fillText(String(this.p2Score), sw - margin, sh - margin - fontPx);
    } else {
      // Portrait
      // Show scores on the SAME vertical side as each player for clearer association.
      // P1 (top player): top-left, rotated 180° to match orientation feel
      const p1x = margin;
      const p1y = margin;
      renderer.screenPush();
      renderer.translate(p1x, p1y);
      renderer.rotate(Math.PI);
      renderer.translate(-p1x, -p1y);
      // After rotation, align bottom-right so text stays within the visible screen corner
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(this.p1Score), p1x, p1y);
      // restore baseline for subsequent draws
      ctx.textBaseline = "top";
      renderer.screenPop();

      // P2 (bottom player): bottom-right, unrotated
      ctx.textAlign = "right";
      ctx.fillText(String(this.p2Score), sw - margin, sh - margin - fontPx);
    }

    renderer.screenPop();
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

  _getOrientation() {

    return this.orientation;
  }

  _screenRectForSize(wx, wy, pw, ph) {
    const s = this._worldToScreenFor(wx, wy, pw, ph);
    return { x: s.x, y: s.y, w: pw, h: ph };
  }

  _trySpawnNPC(ev) {

    // Legacy path no longer used: we now enforce strict FIFO via _eventQueue
    this._spawnNPC(ev);
  }

  _spawnNPC(ev) {

    const kind = ev.npc === "boss" ? "boss" : "lieutenant";
    const imgs = this._npcImages[kind];
    const ch = new Character({ bodyColor: "#888", faceTopColor: "#bbb", faceBottomColor: "#666", w: this.p1.w, h: this.p1.h });
    if (imgs && imgs.head) { ch.setHeadImage(imgs.head); }
    if (imgs) {
      ch.setBodyFrames({ idle: imgs.body || null, walk: (imgs.bodyWalk || []), shoot: imgs.bodyShoot || null, fps: 5 });
    }

    const npc = new NPC(kind, ch, { widthPx: ch.w, heightPx: ch.h });
    npc.setOrientation(this.orientation);

    // Initialize shoot windows list (frames handled by Character's animation system)
    npc._shootWindows = [];

    // Compute actual movement speed from baseline and relative percentage (fallback to absolute if missing)
    const relNPC = typeof ev.speedRel === "number" ? ev.speedRel : (typeof ev.speed === "number" ? (ev.speed / 300) * 100 : 100);
    const actualNPCSpeed = this._baselineSpeed * (relNPC / 100);

    if (this.orientation === "portrait") {
      const halfW = this._charWorldSizeX(this._hotLogicalSize(ch).w);
      const wy = Math.floor(this.worldH * 0.5);
      npc.wy = wy;
      if (ev.side === "A") {
        npc.wx = -halfW - 10;
        npc.vx = Math.abs(actualNPCSpeed);
      } else {
        npc.wx = this.worldW + halfW + 10;
        npc.vx = -Math.abs(actualNPCSpeed);
      }
      npc.vy = 0;
    } else {
      const halfH = this._charWorldSizeY(this._hotLogicalSize(ch).h);
      const wx = Math.floor(this.worldW * 0.5);
      npc.wx = wx;
      if (ev.side === "A") {
        npc.wy = -halfH - 10;
        npc.vy = Math.abs(actualNPCSpeed);
      } else {
        npc.wy = this.worldH + halfH + 10;
        npc.vy = -Math.abs(actualNPCSpeed);
      }
      npc.vx = 0;
    }

    this.npcs.push(npc);

    // Debug spawn order
    try {
      /* eslint-disable no-console */
      console.log("[GameScene] spawn", { id: ev._id || "?", npc: kind, side: ev.side, t: this._gameTime.toFixed(3), speedRel: relNPC.toFixed(1), baseline: this._baselineSpeed.toFixed(1), actual: actualNPCSpeed.toFixed(1) });
      /* eslint-enable no-console */
    } catch (err) {
    }

    if (ev.shots && ev.shots.length) {
      const enterTime = this._npcTimeToEnter(npc);
      const travel = this._npcRemainingTime(npc);

      for (let i = 0; i < ev.shots.length; i++) {
        const s = ev.shots[i];
        let shotTime = this._gameTime + enterTime + 0.15;

        // If author specifies fractional progress, schedule exactly at that fraction of the travel
        if (typeof s.frac === "number") {
          const f = Math.max(0, Math.min(1, s.frac));
          shotTime = this._gameTime + enterTime + f * travel;
        } else {
          // Fallback to absolute timing relative to script event if provided
          if (typeof s.t === "number" && typeof ev.t === "number") {
            const baseline = this._gameTime + Math.max(0, (s.t - ev.t));
            shotTime = Math.max(shotTime, baseline);
          }
        }

        this._pendingShots.push({
          t: shotTime,
          npc: npc,
          target: s.target,
          // Angle fields are copied verbatim; interpretation happens in _processShots
          angleDeg: typeof s.angleDeg === "number" ? s.angleDeg : undefined,
          absAngleDeg: typeof s.absAngleDeg === "number" ? s.absAngleDeg : undefined,
          perpSign: typeof s.perpSign === "number" ? s.perpSign : undefined,
          speed: typeof s.speed === "number" ? s.speed : 600,
          speedRel: typeof s.speedRel === "number" ? s.speedRel : (typeof s.speed === "number" ? (s.speed / 300) * 100 : 100)
        });

        // Window to show shoot pose
        const pre = 0.15;
        const post = 0.25;
        npc._shootWindows.push({ start: shotTime - pre, end: shotTime + post });
      }
    }
  }

  _findAnyActiveNPC() {

    for (let i = 0; i < this.npcs.length; i++) {
      const n = this.npcs[i];
      // Consider on-screen if still within extended bounds (not yet culled)
      return n;
    }
    return null;
  }

  _drainSpawnQueueOnce() {

    if (!this._eventQueue || this._eventQueue.length === 0) {
      return;
    }

    const existing = this._findAnyActiveNPC();
    if (existing) {
      return;
    }

    // Respect inter-spawn delay window that is set when previous NPC exits
    if (this._gameTime < this._nextSpawnReadyAt) {
      return;
    }

    const ev = this._eventQueue.shift();
    this._spawnNPC(ev);
    // Reset delay gate so the next delay will be scheduled on next empty-screen interval
    this._nextSpawnReadyAt = 0;
  }

  _npcRemainingTime(n) {

    if (this.orientation === "portrait") {
      const halfW = this._charWorldSizeX(this._hotLogicalSize(n.character).w);
      if (n.vx > 0) {
        const dist = (this.worldW + halfW + 20) - (n.wx - halfW);
        return Math.max(0, dist / Math.max(1, n.vx));
      } else {
        const dist = (n.wx + halfW) - (-halfW - 20);
        return Math.max(0, dist / Math.max(1, -n.vx));
      }
    } else {
      const halfH = this._charWorldSizeY(this._hotLogicalSize(n.character).h);
      if (n.vy > 0) {
        const dist = (this.worldH + halfH + 20) - (n.wy - halfH);
        return Math.max(0, dist / Math.max(1, n.vy));
      } else {
        const dist = (n.wy + halfH) - (-halfH - 20);
        return Math.max(0, dist / Math.max(1, -n.vy));
      }
    }
  }

  _processShots() {

    for (let i = 0; i < this._pendingShots.length; ) {
      const sh = this._pendingShots[i];
      if (sh.t > this._gameTime) {
        i += 1;
        continue;
      }

      this._pendingShots.splice(i, 1);

      if (!sh.npc || !this._isNPCAlive(sh.npc)) {
        continue;
      }

      const np = this._npcBodyCenterWorld(sh.npc);
      // Baseline direction: perpendicular to NPC movement
      let vxn = sh.npc.vx;
      let vyn = sh.npc.vy;
      const vlen = Math.max(0.0001, Math.sqrt(vxn * vxn + vyn * vyn));
      vxn /= vlen;
      vyn /= vlen;
      // Perpendicular unit base
      const base1x = -vyn;
      const base1y = vxn;
      const base2x = vyn;
      const base2y = -vxn;
      // Determine desired player direction if perpSign specified: +1 => P1, -1 => P2
      // Use a canonical world-space direction toward each player depending on orientation.
      // Landscape: P1 is left (-1,0), P2 is right (1,0).
      // Portrait:  P1 is up (0,-1), P2 is down (0,1).
      let px;
      let py;
      if (typeof sh.perpSign === "number" && (sh.perpSign === 1 || sh.perpSign === -1)) {
        let aimx = 0;
        let aimy = 0;
        if (this.orientation === "landscape") {
          if (sh.perpSign === 1) { aimx = -1; aimy = 0; } else { aimx = 1; aimy = 0; }
        } else {
          if (sh.perpSign === 1) { aimx = 0; aimy = -1; } else { aimx = 0; aimy = 1; }
        }
        // Choose the perpendicular closer to desired aim direction
        const dot1 = base1x * aimx + base1y * aimy;
        const dot2 = base2x * aimx + base2y * aimy;
        const use1 = dot1 >= dot2;
        px = use1 ? base1x : base2x;
        py = use1 ? base1y : base2y;
      } else {
        // Fallback: pick the perpendicular pointing roughly toward arena center to keep pellets in play
        const cx = this.worldW * 0.5 - np.x;
        const cy = this.worldH * 0.5 - np.y;
        const dot1 = base1x * cx + base1y * cy;
        const use1 = dot1 >= 0;
        px = use1 ? base1x : base2x;
        py = use1 ? base1y : base2y;
      }
      let a = Math.atan2(py, px);
      // Apply scripted angle overrides
      if (typeof sh.absAngleDeg === "number") {
        a = (sh.absAngleDeg * Math.PI) / 180.0;
      } else if (typeof sh.angleDeg === "number") {
        a += (sh.angleDeg * Math.PI) / 180.0;
      }

      // Adjust pellet speed using baseline-relative speeds; same velocity for boss and lieutenant
      const isLt = sh.npc && sh.npc.kind === "lieutenant";
      const relShot = typeof sh.speedRel === "number" ? sh.speedRel : (typeof sh.speed === "number" ? (sh.speed / 300) * 100 : 100);
      let speed = this._baselineSpeed * (relShot / 100);
      const vx = Math.cos(a) * speed;
      const vy = Math.sin(a) * speed;
      const sizePx = isLt ? 96 : 48;

      const pellet = new Pellet(null, { frames: this._pelletFrames, fps: this._pelletFPS, wx: np.x, wy: np.y, vx: vx, vy: vy, sizePx: sizePx });
      pellet.shooterKind = isLt ? "lieutenant" : "boss";
      // Track the shooter NPC and spawn time to avoid immediate self-eat
      pellet._shooter = sh.npc;
      pellet._spawnTime = this._gameTime;
      pellet.setOrientation(this.orientation);
      this.pellets.push(pellet);
    }
  }

  _processEmotes() {

    for (let i = 0; i < this._pendingEmotes.length; ) {
      const em = this._pendingEmotes[i];
      if (em.t > this._gameTime) {
        i += 1;
        continue;
      }

      this._pendingEmotes.splice(i, 1);

      if (!em.npc || !this._isNPCAlive(em.npc)) {
        continue;
      }

      if (em.kind === "laugh") {
        em.npc.character.laugh();
      }
    }
  }

  _npcTimeToEnter(npc) {

    if (this.orientation === "portrait") {
      const halfW = this._charWorldSizeX(this._hotLogicalSize(npc.character).w);
      if (npc.vx > 0) {
        const dist = (0 - (-halfW - 10)) + 1; // from offscreen left to edge
        return Math.max(0, dist / Math.max(1, npc.vx));
      } else {
        const dist = ((this.worldW + halfW + 10) - this.worldW) + 1; // from offscreen right to edge
        return Math.max(0, dist / Math.max(1, -npc.vx));
      }
    } else {
      const halfH = this._charWorldSizeY(this._hotLogicalSize(npc.character).h);
      if (npc.vy > 0) {
        const dist = (0 - (-halfH - 10)) + 1; // from offscreen top to edge
        return Math.max(0, dist / Math.max(1, npc.vy));
      } else {
        const dist = ((this.worldH + halfH + 10) - this.worldH) + 1; // from offscreen bottom to edge
        return Math.max(0, dist / Math.max(1, -npc.vy));
      }
    }
  }

  _isNPCAlive(npc) {

    for (let i = 0; i < this.npcs.length; i++) {
      if (this.npcs[i] === npc) {
        return true;
      }
    }
    return false;
  }

  _cullNPCs() {

    for (let i = 0; i < this.npcs.length; ) {
      const n = this.npcs[i];
      if (this.orientation === "portrait") {
        const halfW = this._charWorldSizeX(this._hotLogicalSize(n.character).w);
        if ((n.vx > 0 && n.wx - halfW > this.worldW + 20) || (n.vx < 0 && n.wx + halfW < -20)) {
          this.npcs.splice(i, 1);
          // NPC exited screen horizontally; schedule delay for next spawn using head event's t
          const nextEv = this._eventQueue.length > 0 ? this._eventQueue[0] : null;
          const d = nextEv && typeof nextEv.t === "number" ? nextEv.t : 0;
          this._nextSpawnReadyAt = this._gameTime + d;
          continue;
        }
      } else {
        const halfH = this._charWorldSizeY(this._hotLogicalSize(n.character).h);
        if ((n.vy > 0 && n.wy - halfH > this.worldH + 20) || (n.vy < 0 && n.wy + halfH < -20)) {
          this.npcs.splice(i, 1);
          // NPC exited screen vertically; schedule delay for next spawn using head event's t
          const nextEv = this._eventQueue.length > 0 ? this._eventQueue[0] : null;
          const d = nextEv && typeof nextEv.t === "number" ? nextEv.t : 0;
          this._nextSpawnReadyAt = this._gameTime + d;
          continue;
        }
      }
      i += 1;
    }
  }

  _handlePelletBounds(p) {

    const halfX = this._pelletWorldHalfX(p.sizePx);
    const halfY = this._pelletWorldHalfY(p.sizePx);

    // Reflect on left/right walls
    if (p.wx - halfX < 0) {
      p.wx = halfX;
      p.vx = Math.abs(p.vx);
      p.bounces += 1;
      if (this.orientation === "landscape") {
        p.valueBounces += 1;
        this._onPelletBounce(p);
        // Left wall is P1 side in landscape
        p._lastMiss = "p1";
      }
    }
    if (p.wx + halfX > this.worldW) {
      p.wx = this.worldW - halfX;
      p.vx = -Math.abs(p.vx);
      p.bounces += 1;
      if (this.orientation === "landscape") {
        p.valueBounces += 1;
        this._onPelletBounce(p);
        // Right wall is P2 side in landscape
        p._lastMiss = "p2";
      }
    }

    // Reflect on top/bottom walls
    if (p.wy - halfY < 0) {
      p.wy = halfY;
      p.vy = Math.abs(p.vy);
      p.bounces += 1;
      if (this.orientation === "portrait") {
        p.valueBounces += 1;
        this._onPelletBounce(p);
        // Top wall is P1 side in portrait
        p._lastMiss = "p1";
      }
    }
    if (p.wy + halfY > this.worldH) {
      p.wy = this.worldH - halfY;
      p.vy = -Math.abs(p.vy);
      p.bounces += 1;
      if (this.orientation === "portrait") {
        p.valueBounces += 1;
        this._onPelletBounce(p);
        // Bottom wall is P2 side in portrait
        p._lastMiss = "p2";
      }
    }

    // After 5 total bounces, remove pellet (mark reason)
    if (p.bounces >= 5) {
      p.alive = false;
      p._death = "bounces";
    }
  }

  _onPelletBounce(p) {

    // Shrink pellet slightly only on value-affecting bounces
    const next = Math.max(8, Math.floor(p.sizePx * 0.85));
    p.sizePx = next;
  }

  _cullPellets() {

    for (let i = 0; i < this.pellets.length; ) {
      const p = this.pellets[i];
      if (!p.alive) {
        // Apply health rules based on death reason
        if (p._death === "bounces") {
          // No health change when pellets expire by bouncing.
        } else if (p._death === "npc") {
          // Only the player from whose side the pellet was coming loses 1 HP
          let side = p._npcTarget;
          if (side !== "p1" && side !== "p2") {
            // Fallback: decide by current screen position
            const rect = this._screenRectForSize(p.wx, p.wy, p.sizePx, p.sizePx);
            const cx = rect.x + Math.floor(rect.w * 0.5);
            const cy = rect.y + Math.floor(rect.h * 0.5);
            if (this.orientation === "landscape") {
              side = (cx < this.width * 0.5) ? "p1" : "p2";
            } else {
              side = (cy < this.height * 0.5) ? "p1" : "p2";
            }
          }
          if (side === "p1") {
            this.p1HP = Math.max(0, this.p1HP - 1);
          } else if (side === "p2") {
            this.p2HP = Math.max(0, this.p2HP - 1);
          }
        }
        this.pellets.splice(i, 1);
        continue;
      }
      i += 1;
    }
  }

  _checkWin() {

    if (this._ended) {
      return;
    }

    if (this.p1HP <= 0 || this.p2HP <= 0) {
      this._ended = true;
      // Clear any lingering inputs so next scene doesn't get accidental actions
      if (this.input && typeof this.input.reset === "function") {
        this.input.reset();
      }

      // Determine winner
      let winnerId = "p1";
      if (this.p1HP <= 0 && this.p2HP > 0) {
        winnerId = "p2";
      } else if (this.p2HP <= 0 && this.p1HP > 0) {
        winnerId = "p1";
      } else if (this.p1HP <= 0 && this.p2HP <= 0) {
        // Edge case should not normally occur; default to P1
        winnerId = "p1";
      }

      const params = {
        winnerId: winnerId,
        winnerScore: winnerId === "p1" ? this.p1Score : this.p2Score,
        winnerAvatar: winnerId === "p1" ? this._p1AvatarKey : this._p2AvatarKey,
        winnerConfig: winnerId === "p1" ? this._p1Config : this._p2Config
      };

      if (this.app && typeof this.app.setScene === "function") {
        this.app.setScene(new GameOverScene(params));
      }
    }
  }

  _handlePelletAbsorption(p) {

    if (!p.alive) {
      return;
    }

    const rect = this._screenRectForSize(p.wx, p.wy, p.sizePx, p.sizePx);
    const cx = rect.x + Math.floor(rect.w * 0.5);
    const cy = rect.y + Math.floor(rect.h * 0.5);

    if (this.p1 && this.p1.isEating() && this._pointInHeadHot(this.p1, cx, cy)) {
      // P1 eats: +1 score, +1 HP to P1, -1 HP to P2
      p.alive = false;
      this.p1Score += 1;
      this.p1HP = this.p1HP + 1;
      this.p2HP = Math.max(0, this.p2HP - 1);
      return;
    }

    if (this.p2 && this.p2.isEating() && this._pointInHeadHot(this.p2, cx, cy)) {
      // P2 eats: +1 score, +1 HP to P2, -1 HP to P1
      p.alive = false;
      this.p2Score += 1;
      this.p2HP = this.p2HP + 1;
      this.p1HP = Math.max(0, this.p1HP - 1);
      return;
    }
  }

  _pelletWorldHalfX(px) {

    const sx = px / this.width;
    return Math.max(1, Math.floor(0.5 * sx * this.worldW));
  }

  _pelletWorldHalfY(py) {

    const sy = py / this.height;
    return Math.max(1, Math.floor(0.5 * sy * this.worldH));
  }

  _npcBodyCenterWorld(npc) {

    // Compute world position corresponding to the center of the NPC's body part
    // Body center is offset by ~108*s logical pixels from character center (see render math)
    const s = this._computeRenderScale(npc.character);
    const offsetLogical = Math.floor(108 * s);

    // In portrait, NPCs flip (-1,-1) when moving right; invert offset in that case
    let offset = offsetLogical;
    if (this.orientation === "portrait" && npc.vx > 0.0001) {
      offset = -offsetLogical;
    }

    const dyWorld = Math.floor((offset / this.height) * this.worldH);
    return { x: npc.wx, y: npc.wy + dyWorld };
  }
}
