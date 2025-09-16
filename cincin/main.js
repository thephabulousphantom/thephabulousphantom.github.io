import { Application } from "./src/core/Application.js";
import { Renderer } from "./src/core/Renderer.js";
import { SceneManager } from "./src/core/SceneManager.js";
import { Input } from "./src/core/Input.js";
import { MenuScene } from "./src/scenes/MenuScene.js";
import { AssetLoader } from "./src/core/AssetLoader.js";
import { FullscreenManager } from "./src/core/FullscreenManager.js";
import { InstallPromptManager } from "./src/core/InstallPromptManager.js";

function boot() {

  const renderer = new Renderer();

  const sceneManager = new SceneManager();

  const input = new Input(renderer);

  const loader = new AssetLoader();

  const app = new Application({
    renderer: renderer,
    sceneManager: sceneManager,
    input: input,
    loader: loader,
    config: {}
  });

  app.setScene(new MenuScene());

  app.start();

  const fs = new FullscreenManager(renderer.canvas);
  fs.init();

  return { app: app, loader: loader, fs: fs };
}

class ServiceWorkerManager {
  async register() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await this._hydrate(reg);
    } catch (err) {
      // ignore registration errors in dev
    }
  }

  async _hydrate(reg) {
    if (!reg) {
      return;
    }
  }
}

class SplashController {
  constructor(elementId) {
    this.el = document.getElementById(elementId);
    this._timer = 0;
  }

  show() {
    if (this.el) {
      this.el.hidden = false;
    }
  }

  hide() {
    if (this.el) {
      this.el.hidden = true;
    }
    this.cancelAutoHide();
  }

  startAutoHide(ms) {
    this.cancelAutoHide();
    const self = this;
    this._timer = window.setTimeout(function onSplashTimeout() {
      self.hide();
    }, Math.max(0, ms || 5000));
  }

  cancelAutoHide() {
    if (this._timer) {
      window.clearTimeout(this._timer);
      this._timer = 0;
    }
  }
}

async function onReady() {

  const splash = new SplashController("splash-overlay");
  splash.show();
  splash.startAutoHide(5000);

  const started = boot();

  const swm = new ServiceWorkerManager();
  swm.register();

  const ipm = new InstallPromptManager("install-banner", "install-btn", "install-dismiss");
  ipm.init();

  if (started && started.fs && typeof started.fs.lockPortrait === "function") {
    try {
      started.fs.lockPortrait();
    } catch (e) {
    }
  }

  // Give scenes a frame to kick off their async asset loads
  await new Promise(function(resolve) {
    requestAnimationFrame(function() { resolve(); });
  });

  if (started && started.loader && typeof started.loader.waitForIdle === "function") {
    try {
      // Race waitForIdle with a timeout so we never block the UI indefinitely
      const TIMEOUT_MS = 6000;
      await Promise.race([
        started.loader.waitForIdle(),
        new Promise(function(resolve) { setTimeout(resolve, TIMEOUT_MS); })
      ]);
    } catch (e) {
    }
  }

  splash.hide();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}