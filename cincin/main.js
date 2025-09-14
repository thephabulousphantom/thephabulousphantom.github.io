import { Application } from "./src/core/Application.js";
import { Renderer } from "./src/core/Renderer.js";
import { SceneManager } from "./src/core/SceneManager.js";
import { Input } from "./src/core/Input.js";
import { MenuScene } from "./src/scenes/MenuScene.js";
import { AssetLoader } from "./src/core/AssetLoader.js";

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
}

function onReady() {

  boot();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}