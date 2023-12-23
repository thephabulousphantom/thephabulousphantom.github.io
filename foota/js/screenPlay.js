import Screen from "./screen.js";
import { screen as screenMenu } from "./screenMenu.js";
import World from "./world.js";
import Direction from "./direction.js"

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

        World.things.protagonist.object.position.x = 0;
        World.things.protagonist.object.position.y = 0;
        World.things.protagonist.object.position.z = 0;

        World.things.protagonist.behaviour = World.things.protagonist.behaviourPlay;

        World.things.protagonist.object.rotation.x = 0;
        World.things.protagonist.object.rotation.y = 0;
        World.things.protagonist.object.rotation.z = 0;

        World.camera.position.x = 0;
        World.camera.position.y = 0;
        World.camera.position.z = 50;
    }

    afterShow() {

        super.afterShow();
    }

    update(time) {
     
        World.camera.position.x =
        World.things.lightSpot.object.position.x =
        World.things.protagonist.object.position.x;

        World.camera.position.y =
        World.things.lightSpot.object.position.y =
        World.things.protagonist.object.position.y;

        World.camera.rotation.z = 
        World.things.protagonist.object.rotation.z;
    }

    quit() {

        Screen.transition(screenMenu);
    }
}

export const screen = new screenPlay();