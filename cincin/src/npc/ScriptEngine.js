export class ScriptEngine {
  constructor(params) {

    this.orientationProvider = params && params.orientationProvider ? params.orientationProvider : function get() { return "landscape"; };

    this._events = [];

    this._time = 0;
    this._idx = 0;
    this._loaded = false;
  }

  async load(url) {

    const res = await fetch(url);
    const data = await res.json();

    // Data format: { events:[ {type,npc,side,t,speed,shots:[{frac|t,angleDeg|absAngleDeg,perpSign,speed}]} ] }
    // IMPORTANT: 't' on events is an inter-spawn delay (seconds) after the previous NPC exits.
    // Timing is not driven by an engine clock; GameScene applies these delays strictly FIFO.
    const raw = Array.isArray(data.events) ? data.events : [];
    const expanded = [];
    for (let i = 0; i < raw.length; i++) {
      const e = raw[i];
      const dup = { ...e };
      // Keep 't' and 'speed' exactly as authored; no scaling, no repeats.
      dup.t = typeof e.t === "number" ? e.t : 0;
      if (typeof e.speed === "number") {
        dup.speed = e.speed;
      }
      dup._seq = expanded.length;
      dup._id = "E" + String(i);
      if (e.shots && e.shots.length) {
        dup.shots = e.shots.map(function copy(s, si) {
          const sc = { ...s };
          if (typeof s.speed === "number") {
            sc.speed = s.speed;
          }
          sc._id = dup._id + "-S" + String(si);
          return sc;
        });
      }
      expanded.push(dup);
    }
    this._events = expanded;

    // Debug: log the schedule
    try {
      /* eslint-disable no-console */
      console.log("[ScriptEngine] Loaded script: events=", this._events.length);
      for (let i = 0; i < this._events.length; i++) {
        const ev = this._events[i];
        console.log("[ScriptEngine] schedule",
          { idx: i, id: ev._id, t: ev.t.toFixed(3), npc: ev.npc, side: ev.side, speed: ev.speed });
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
    // Return all remaining events immediately; GameScene enforces inter-spawn delays.
    const remaining = [];
    while (this._idx < this._events.length) {
      const ev = this._events[this._idx];
      try {
        /* eslint-disable no-console */
        console.log("[ScriptEngine] due", { id: ev._id, t: ev.t.toFixed(3), npc: ev.npc, side: ev.side, speed: ev.speed });
        /* eslint-enable no-console */
      } catch (err) {
      }
      remaining.push(ev);
      this._idx += 1;
    }
    return remaining;
  }
}
