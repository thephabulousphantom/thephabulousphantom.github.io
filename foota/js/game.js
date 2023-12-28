import Log from "./log.js";
import Tween from "./lib/tween/tween.esm.js";
import Screen from "./screen.js";
import World from "./world.js";

export default class Game {

    // global vars

    static time = null;
    static models = {};
    static spriteMixer = null;

    boundAnimateFunction = null;

    // construction

    constructor() {

        window.addEventListener("load", (function() {

            this.init();

        }).bind(this));
    }

    async init() {

        Log.info(`Initialising the game...`);

        this.boundAnimateFunction = this.animate.bind(this);
        Game.spriteMixer = new SpriteMixer();

        //Log.debugLabel = document.getElementById("labelDebug");

        requestAnimationFrame(this.boundAnimateFunction);
    }



    // process single frame

    animate(time, force, single) {

        Game.time = time;

        if (!single) {

            requestAnimationFrame(this.boundAnimateFunction);
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

        Tween.update(time);

        const elapsedFames = elapsed / (1000 / 60);

        World.update(time, elapsedFames);

	    Game.spriteMixer.update(elapsed / 1000);

        if (Screen.current) {

            Screen.current.update(time, elapsedFames);
        }
    }
}

export const game = new Game();