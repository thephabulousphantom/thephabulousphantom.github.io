import { Tween } from "./lib/tween/tween.esm.js";
import Game from "./game.js";
import Screen from "./screen.js";
import { screen as screenPlay } from "./screenPlay.js";
import { screen as screenMenu } from "./screenMenu.js";
import World from "./world.js";

export default class screenGameOver extends Screen {

    buttonReplay = null;
    buttonMenu = null;
    rotationRadius = 4;

    constructor() {

        super("screenGameOver");
    }

    init() {

        super.init();

        this.buttonReplay = document.getElementById("buttonReplay");
        this.buttonReplay.addEventListener("click", this.onReplayClicked.bind(this));

        this.buttonMenu = document.getElementById("buttonMenu");
        this.buttonMenu.addEventListener("click", this.onMenuClicked.bind(this));

        this.labelLevel = document.querySelector("#screenGameOver #labelLevel label");
        this.labelScore = document.querySelector("#screenGameOver #labelScore label");
    }

    onReplayClicked(evt) {

        Screen.transition(screenPlay);
        evt.preventDefault();
    }

    onMenuClicked(evt) {

        Screen.transition(screenMenu);
        evt.preventDefault();
    }
    
    beforeShow() {

        super.beforeShow();

        World.things.protagonist.object.visible = false;
        World.things.trail.object.visible = false;
        this.labelLevel.innerText = screenPlay.level;
        this.labelScore.innerText = screenPlay.score;
    }

    beforeHide() {

    }

    update(time) {
        
        World.camera.position.x = this.rotationRadius * Math.sin(time / 2000);
        World.camera.position.y = this.rotationRadius * Math.cos(time / 2000);
    }
}

export const screen = new screenGameOver();