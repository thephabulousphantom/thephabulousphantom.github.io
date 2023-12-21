import Log from "./log.js";
import { Tween } from "./lib/tween/tween.esm.js";

export default class Screen {

    static transitionScreenId = null;
    static current = null;
    static transitionMilliseconds = 1000;

    id = null;
    htmlElement = null;
    transitionIn = false;
    transitionOut = false;

    constructor(id) {

        this.id = id;

        window.addEventListener("load", (function() {
            
            this.htmlElement = document.getElementById(id);
            this.init();

        }).bind(this));
    }

    init() {

        Log.info(`Initialising screen ${this.id}`);
    }

    static transition(screen) {

        if (Screen.current) {

            Screen.current.transitionOut = true;
            Screen.current.beforeHide();
        }

        const transitionScreenElement = document.getElementById(Screen.transitionScreenId);

        transitionScreenElement.style.opacity = 0;
        transitionScreenElement.style.visibility = "visible";

        const animationProperties = {
            opacity: 0
        };

        new Tween(animationProperties)
            .to({opacity: 1}, Screen.transitionMilliseconds)
            .onUpdate(function() {

                transitionScreenElement.style.opacity = animationProperties.opacity;
            })
            .onComplete(function() {

                if (Screen.current) {

                    Screen.current.htmlElement.style.visibility = "hidden";
                    Screen.current.afterHide();
                    Screen.current.transitionOut = false;
                }

                Screen.current.transitionIn = true;

                screen.beforeShow();
                screen.htmlElement.style.visibility = "visible";

                Screen.current = screen;
            })
            .chain(
                new Tween(animationProperties)
                    .to({opacity: 0}, Screen.transitionMilliseconds)
                    .onUpdate(function() {

                        transitionScreenElement.style.opacity = animationProperties.opacity;
                    })
                    .onComplete(function() {
        
                        transitionScreenElement.style.visibility = "hidden";
                        screen.afterShow();
                        Screen.current.transitionIn = false;
                    })
            )
            .start();
    }

    beforeHide() {

        Log.info(`Hiding screen ${this.id}`);
    }

    afterHide() {

        Log.info(`Hidden screen ${this.id}`);
    }

    beforeShow() {

        Log.info(`Showing screen ${this.id}`);
    }

    afterShow() {

        Log.info(`Shown screen ${this.id}`);
    }

    update() {
        
    }
}