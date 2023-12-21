import { Tween } from "./lib/tween/tween.esm.js";
import Game from "./game.js";
import Screen from "./screen.js";
import { screen as screenPlay } from "./screenPlay.js";
import World from "./world.js";

export default class screenMenu extends Screen {

    buttonPlay = null;
    rotationRadius = 2;

    constructor() {

        super("screenMenu");
    }

    init() {

        super.init();

        this.buttonPlay = document.getElementById("buttonPlay");
        this.buttonPlay.addEventListener("click", this.onPlayClicked);
    }

    onPlayClicked() {

        Screen.transition(screenPlay);
    }

    beforeShow() {

        super.beforeShow();

        World.objects.protagonist.position.x =
        World.objects.protagonist.position.z =
        World.objects.lightSpot.position.x = 
        World.objects.lightSpot.position.z = 0;
        
        const animation = {

            this: this,
            properties: {
                rotationRadius: 0,
                cameraY: World.camera.position.y
            },
            target: {
                rotationRadius:2,
                cameraY : 10
            }
        };

        new Tween(animation.properties)
            .to(animation.target, Screen.transitionMilliseconds)
            .start()
            .onUpdate(function() {

                animation.this.rotationRadius = animation.properties.rotationRadius;
                World.camera.position.y = animation.properties.cameraY;

            });

        this.update(Game.time);
    }

    beforeHide() {

        const animation = {

            this: this,
            properties: {
                rotationRadius: 2,
                cameraY : 10
            },
            target: {
                rotationRadius: 0,
                cameraY : 50
            }
        };

        new Tween(animation.properties)
            .to(animation.target, Screen.transitionMilliseconds)
            .start()
            .onUpdate(function() {

                animation.this.rotationRadius = animation.properties.rotationRadius;
                World.camera.position.y = animation.properties.cameraY;
            });
    }

    update(time) {
     
        World.camera.position.x = this.rotationRadius * Math.sin(time / 2000);
        World.camera.position.z = this.rotationRadius * Math.cos(time / 2000);

        World.objects.protagonist.rotation.z = Math.PI * 2 * time / 6000;
        World.objects.protagonist.rotation.x = Math.PI * 2 * time / 10000;
    }
}

export const screen = new screenMenu();