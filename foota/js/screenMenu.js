import { Tween } from "./lib/tween/tween.esm.js";
import Game from "./game.js";
import Screen from "./screen.js";
import { screen as screenPlay } from "./screenPlay.js";
import World from "./world.js";

export default class screenMenu extends Screen {

    buttonPlay = null;
    rotationRadius = 3.25;
    cameraHeight = 25;

    constructor() {

        super("screenMenu");
    }

    init() {

        super.init();

        this.buttonPlay = document.getElementById("buttonPlay");
        this.buttonPlay.addEventListener("click", this.onPlayClicked.bind(this));

        this.controlToggleFullScreen = document.getElementById("controlToggleFullScreen");
        this.controlToggleFullScreen.addEventListener("click", this.onToggleFullScreen.bind(this));

        if (Screen.runningAsPWA) {

            this.controlToggleFullScreen.style.display = "none";
        }
    }

    onPlayClicked(evt) {

        Screen.transition(screenPlay);
        evt.preventDefault();
    }

    onToggleFullScreen(evt) {

        try {

            if (Screen.fullScreen) {

                Screen.exitFull();
                this.controlToggleFullScreen.innerText = "fullscreen";
            }
            else {

                Screen.goFull();
                this.controlToggleFullScreen.innerText = "fullscreen_exit";
            }
        }
        catch (ex) {

            Log.warning(`Unable to toggle full screen: ${JSON.stringify(ex)}`)
        }

        evt.preventDefault();
    }

    beforeShow() {

        super.beforeShow();

        this.buttonPlay.style.display = "none";

        World.things.protagonist.object.visible = true;
        World.things.protagonist.object.children[1].visible = false;
        World.things.protagonist.object.children[2].visible = false;
        World.things.trail.object.visible = false;
        World.things.protagonist.object.position.x =
        World.things.protagonist.object.position.y =
        World.things.protagonist.object.position.z = 
        World.things.protagonist.object.rotation.x =
        World.things.protagonist.object.rotation.y =
        World.things.protagonist.object.rotation.z =
        World.things.lightSpot.object.position.x = 
        World.things.lightSpot.object.position.y = 0;

        World.things.protagonist.behaviour = World.things.protagonist.behaviourMenu;
        
        const animation = {

            this: this,
            properties: {
                rotationRadius: 0,
                cameraZ: World.camera.position.z
            },
            target: {
                rotationRadius: this.rotationRadius,
                cameraZ : this.cameraHeight
            }
        };

        new Tween(animation.properties)
            .to(animation.target, Screen.transitionMilliseconds)
            .start()
            .onUpdate(function() {

                this.rotationRadius = animation.properties.rotationRadius;
                World.camera.position.z = animation.properties.cameraZ;

            });

        this.update(Game.time);
    }

    afterShow() {

        super.afterShow();

        this.buttonPlay.style.display = "";
    }

    beforeHide() {

        this.buttonPlay.style.display = "none";

        const animation = {

            this: this,
            properties: {
                rotationRadius: this.rotationRadius,
                cameraZ : this.cameraHeight
            },
            target: {
                rotationRadius: 0,
                cameraZ : 50
            }
        };

        new Tween(animation.properties)
            .to(animation.target, Screen.transitionMilliseconds)
            .start()
            .onUpdate(function() {

                this.rotationRadius = animation.properties.rotationRadius;
                World.camera.position.z = animation.properties.cameraZ;
            });
    }

    update(time) {
     
        super.update(time);

        World.camera.rotation.z = this.directionCurrent;
        World.camera.position.x = this.rotationRadius * Math.sin(time / 2000);
        World.camera.position.y = this.rotationRadius * Math.cos(time / 2000);

        World.things.protagonist.object.rotation.set(0, time / 1000, 0);
        World.things.protagonist.object.rotateOnWorldAxis(this.zVector, - time / 2000);
    }
}

export const screen = new screenMenu();