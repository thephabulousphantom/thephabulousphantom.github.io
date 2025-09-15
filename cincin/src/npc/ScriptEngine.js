export class ScriptEngine {
  constructor(params) {

    this.orientationProvider = params && params.orientationProvider ? params.orientationProvider : function get() { return "landscape"; };

    this._events = [];
    this._cycleDuration = 0;
    this._repeats = 1;

    this._time = 0;
    this._idx = 0;
    this._loaded = false;
  }

  async load(url) {

    const res = await fetch(url);
    const data = await res.json();

    // Data format: { repeats:number, cycleDuration:number, events:[ {type,npc,side,t,speed,shots:[{frac|t,angleDeg|absAngleDeg,perpSign,speed}]} ] }
    // IMPORTANT: 't' on events is now an inter-spawn delay (seconds) after the previous NPC exits.
    // Timing is no longer driven by the engine clock; GameScene applies these delays strictly FIFO.
    this._events = Array.isArray(data.events) ? data.events : [];
    this._cycleDuration = typeof data.cycleDuration === "number" ? data.cycleDuration : 0;
    this._repeats = typeof data.repeats === "number" ? data.repeats : 1;

    // Expand events list by repeats. Only speed scales per cycle; 't' remains author-provided delay.
    const expanded = [];
    let runningOffset = 0; // no longer used for time; retained for compatibility
    for (let c = 0; c < this._repeats; c++) {
      const speedScale = Math.pow(1.5, c);
      const timeScale = 1 / speedScale;
      for (let i = 0; i < this._events.length; i++) {
        const e = this._events[i];
        const dup = { ...e };
        // Keep 't' as authored delay; do not scale or offset
        dup.t = typeof e.t === "number" ? e.t : 0;
        if (typeof e.speed === "number") {
          dup.speed = e.speed * speedScale;
        }
        dup._cycle = c;
        dup._seq = expanded.length;
        dup._id = "C" + String(c) + "-E" + String(i);
        dup._repeats = this._repeats;
        if (e.shots && e.shots.length) {
          dup.shots = e.shots.map(function copy(s, si) {
            const sc = { ...s };
            // If author provides fractional progress 'frac' in [0,1], keep as-is.
            // If author provides absolute shot time 't', leave it relative to the spawn moment (no scaling/offset).
            if (typeof s.speed === "number") {
              sc.speed = s.speed * speedScale;
            }
            // Angle fields are copied verbatim (scripted), no randomness injected here.
            // Supported: angleDeg (relative to perpendicular), absAngleDeg (absolute world angle)
            sc._id = dup._id + "-S" + String(si);
            return sc;
          });
        }
        expanded.push(dup);
      }
      // No timing accumulation; GameScene handles delays between spawns.
    }
    this._events = expanded;

    // Debug: log the expanded schedule
    try {
      /* eslint-disable no-console */
      console.log("[ScriptEngine] Loaded script: repeats=", this._repeats, ", baseCycle=", this._cycleDuration);
      for (let i = 0; i < this._events.length; i++) {
        const ev = this._events[i];
        console.log("[ScriptEngine] schedule",
          { idx: i, id: ev._id, cycle: ev._cycle, of: this._repeats, t: ev.t.toFixed(3), npc: ev.npc, side: ev.side, speed: ev.speed });
      }
      /* eslint-enable no-console */
    } catch (err) {
    }

    this._time = 0;
    this._idx = 0;
    this._loaded = true;
  }

  get loaded() {
    return this._loaded;
  }

  reset() {
    this._time = 0;
    this._idx = 0;
  }

  advance(dt) {
    // No-op for timing; retained for API compatibility
  }

  consumeDueEvents() {
    if (!this._loaded) {
      return [];
    }

    if (!this._loaded) {
      return [];
    }
    // Return all remaining events immediately; GameScene enforces inter-spawn delays.
    const remaining = [];
    while (this._idx < this._events.length) {
      const ev = this._events[this._idx];
      try {
        /* eslint-disable no-console */
        console.log("[ScriptEngine] due", { id: ev._id, cycle: ev._cycle, of: this._repeats, t: ev.t.toFixed(3), npc: ev.npc, side: ev.side, speed: ev.speed });
        /* eslint-enable no-console */
      } catch (err) {
      }
      remaining.push(ev);
      this._idx += 1;
    }
    return remaining;
  }
}
