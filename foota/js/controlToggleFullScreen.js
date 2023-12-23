import Log from "./log.js";
import Game from "./game.js";

export default class controlToggleFullScreen {

    currentlyFullScreen = false;
    htmlElement = null;

    constructor() {

        window.addEventListener("load", (function() {

            this.htmlElement = document.getElementById("controlToggleFullScreen");
            this.init();
            
        }).bind(this));
    }

    init() {

        this.htmlElement.addEventListener("click", this.toggle);
    }

    toggle(evt) {

        try {

            if (this.currentlyFullScreen) {

                Game.exitFull(false);
                this.currentlyFullScreen = false;

            }
            else {

                Game.goFull(false);
                this.currentlyFullScreen = true;
            }
        }
        catch (ex) {

            Log.warning(`Unable to toggle full screen: ${JSON.stringify(ex)}`)
        }
        
        evt.preventDefault();
    }
}

export const control = new controlToggleFullScreen();