import Log from "./log.js";
import Tween from "./lib/tween/tween.esm.js";
import Screen from "./screen.js";
import World from "./world.js";
import { screen as screenMenu } from "./screenMenu.js";
import Direction from "./direction.js";

export default class Game {

    // global vars

    static time = null;

    // construction

    constructor() {

        window.addEventListener("load", (function() {

            this.init();

        }).bind(this));
    }

    async init() {

        Log.info(`Initialising the game...`);

        //Log.debugLabel = document.getElementById("labelDebug");

        requestAnimationFrame( this.animate.bind(this));

        Screen.autoFullScreen();

        Screen.transition(screenMenu);
    }



    // process single frame

    animate(time, force, single) {

        Game.time = time;

        if (!single) {

            requestAnimationFrame( this.animate.bind(this));
        }

        if (this.lastFrameTime == null) {

            this.lastFrameTime = time;
        }

        var elapsed = time - this.lastFrameTime;

        if (this.targetFps) {

            if (!force && elapsed < 1000 / this.targetFps) {

                return;
            }

            elapsed -= elapsed % (1000 / this.targetFps);
        }

        this.lastFrameTime += elapsed;

        Direction.update(time);

        Tween.update(time);

        World.update(time);

        if (Screen.current) {

            Screen.current.update(time);
        }
    }
}

export const game = new Game();