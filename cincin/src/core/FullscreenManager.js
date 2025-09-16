export class FullscreenManager {
  constructor(element) {
    this.element = element || document.documentElement;
    this._boundOnFirstInteraction = this.onFirstInteraction.bind(this);
    this._boundOnChange = this.onFullscreenChange.bind(this);
    this._boundOnError = this.onFullscreenError.bind(this);
  }

  init() {
    document.addEventListener("fullscreenchange", this._boundOnChange);
    document.addEventListener("webkitfullscreenchange", this._boundOnChange);
    document.addEventListener("msfullscreenchange", this._boundOnChange);

    document.addEventListener("fullscreenerror", this._boundOnError);
    document.addEventListener("webkitfullscreenerror", this._boundOnError);
    document.addEventListener("msfullscreenerror", this._boundOnError);

    this.addFirstInteractionListeners();
  }

  addFirstInteractionListeners() {
    const e = this._boundOnFirstInteraction;
    const target = this.element || document;
    // Use non-passive for touchend to satisfy some mobile browsers
    target.addEventListener("click", e, { once: true });
    target.addEventListener("touchend", e, { once: true, passive: false });
    target.addEventListener("keydown", e, { once: true });
  }

  onFirstInteraction() {
    this.requestFullscreenSync();
  }

  requestFullscreenSync() {
    const el = this.element;
    try {
      if (el && el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el && el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el && el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } catch (err) {
      // If it fails (e.g., not a valid gesture), re-arm listeners so a future user action can retry.
      this.addFirstInteractionListeners();
    }
  }

  isFullscreen() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
  }

  onFullscreenChange() {
    // Could update UI or styles here; ensure canvas resizes after changes
    if (typeof window !== "undefined") {
      if (window.dispatchEvent) {
        window.dispatchEvent(new Event("resize"));
      }
    }
  }

  onFullscreenError() {
    // Re-arm first interaction listeners if it failed so we can retry
    this.addFirstInteractionListeners();
  }

  destroy() {
    document.removeEventListener("fullscreenchange", this._boundOnChange);
    document.removeEventListener("webkitfullscreenchange", this._boundOnChange);
    document.removeEventListener("msfullscreenchange", this._boundOnChange);

    document.removeEventListener("fullscreenerror", this._boundOnError);
    document.removeEventListener("webkitfullscreenerror", this._boundOnError);
    document.removeEventListener("msfullscreenerror", this._boundOnError);
  }
}
