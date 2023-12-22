import Screen from "./screen.js";
import { screen as screenMenu } from "./screenMenu.js";
import World from "./world.js";
import Game from "./game.js";

export default class screenPlay extends Screen {

    controlQuit = null;

    constructor() {

        super("screenPlay");
    }

    init() {

        super.init();

        this.controlQuit = document.getElementById("controlQuit");
        this.controlQuit.addEventListener("click", this.quit);
    }

    beforeHide() {

        super.beforeHide();
    }

    afterHide() {

        super.afterHide();
    }

    beforeShow() {

        super.beforeShow();

        World.objects.protagonist.position.x = 0;
        World.objects.protagonist.position.y = 0;
        World.objects.protagonist.position.z = 0;

        World.objects.protagonist.rotation.x = 0;
        World.objects.protagonist.rotation.y = 0;
        World.objects.protagonist.rotation.z = 0;

        World.camera.position.x = 0;
        World.camera.position.y = 0;
        World.camera.position.z = 50;
    }

    afterShow() {

        super.afterShow();
    }

    update(time) {
     
        const v = new THREE.Vector3(0, 1, 0);
        v.applyQuaternion(Game.orientation);

        World.camera.position.y =
        World.objects.lightSpot.position.y =
        World.objects.protagonist.position.y += 1 * v.y;

        World.camera.position.x =
        World.objects.lightSpot.position.x =
        World.objects.protagonist.position.x -= 1 * v.x;

        try {

            if (Game.orientation) {

                World.objects.protagonist.quaternion.copy(Game.orientation).invert();
            }
        }
        catch {

        }
    }

    quit() {

        Screen.transition(screenMenu);
    }
}

export const screen = new screenPlay();