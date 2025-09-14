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

    // Data format: { repeats:number, cycleDuration:number, events:[ {type,npc,side,t,speed,shots:[{t,target,angleOffset,speed}]} ] }
    this._events = Array.isArray(data.events) ? data.events : [];
    this._cycleDuration = typeof data.cycleDuration === "number" ? data.cycleDuration : (this._events.length > 0 ? (this._events[this._events.length - 1].t + 0.001) : 0);
    this._repeats = typeof data.repeats === "number" ? data.repeats : 1;

    // Expand events list by repeats, scaling each cycle:
    // - Timings shrink by 10% per cycle (cycle 0 = 1.0x, 1 = 0.9x duration, etc. via timeScale = 1 / (1.1^c))
    // - Speeds increase by 10% per cycle (speedScale = 1.1^c)
    const expanded = [];
    let runningOffset = 0;
    for (let c = 0; c < this._repeats; c++) {
      const speedScale = Math.pow(1.1, c);
      const timeScale = 1 / speedScale;
      for (let i = 0; i < this._events.length; i++) {
        const e = this._events[i];
        const dup = { ...e };
        dup.t = runningOffset + (e.t * timeScale);
        if (typeof e.speed === "number") {
          dup.speed = e.speed * speedScale;
        }
        if (e.shots && e.shots.length) {
          dup.shots = e.shots.map(function copy(s) {
            const sc = { ...s };
            sc.t = runningOffset + (s.t * timeScale);
            if (typeof s.speed === "number") {
              sc.speed = s.speed * speedScale;
            }
            return sc;
          });
        }
        expanded.push(dup);
      }
      // Advance offset by scaled cycle duration
      runningOffset += this._cycleDuration * timeScale;
    }
    this._events = expanded;

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
    if (!this._loaded) {
      return;
    }
    this._time += dt;
  }

  consumeDueEvents() {
    if (!this._loaded) {
      return [];
    }

    const due = [];
    const totalDuration = this._events.length > 0 ? (this._events[this._events.length - 1].t + 0.0001) : 0;
    while (this._idx < this._events.length && this._events[this._idx].t <= this._time) {
      due.push(this._events[this._idx]);
      this._idx += 1;
    }

    // Loop
    if (this._idx >= this._events.length && totalDuration > 0) {
      this._time -= totalDuration;
      this._idx = 0;
    }

    return due;
  }
}
