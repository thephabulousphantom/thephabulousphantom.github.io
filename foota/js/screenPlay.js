import Screen from "./screen.js";
import { screen as screenMenu } from "./screenMenu.js";
import World from "./world.js";
import Keyboard from "./keyboard.js";

export default class screenPlay extends Screen {

    controlQuit = null;

    directionTarget = 0;
    directionCurrent = 0;
    directionDevice = null;
    directionKeyboard = 0;
    directionSmoothness = 3;
    velocity = 1;
    accelleration = 0.2;

    touch = {

        touchAccellerating: false,
        touchShooting: false      
    }

    constructor() {

        super("screenPlay");
    }

    init() {

        super.init();

        this.controlQuit = document.getElementById("controlQuit");
        this.controlQuit.addEventListener("click", this.quit);

        this.areaAccellerate = document.getElementById("areaAccellerate");
        this.areaAccellerate.addEventListener("touchstart", this.onAccelleratePress.bind(this));
        this.areaAccellerate.addEventListener("touchend", this.onAccellerateRelease.bind(this));

        this.areaShoot = document.getElementById("areaShoot");
        this.areaShoot.addEventListener("touchstart", this.onShootPress.bind(this));
        this.areaShoot.addEventListener("touchend", this.onShootRelease.bind(this));

        window.addEventListener("deviceorientation", this.onDeviceOrientationUpdate.bind(this));
    }

    onDeviceOrientationUpdate(evt) {

        this.directionDevice = evt.alpha * 0.0174532925;
        this.updateDirection();
    }

    onAccelleratePress() {

        this.touch.accellerating = true;
    }

    onAccellerateRelease() {

        this.touch.accellerating = false;
    }

    onShootPress() {

        this.touch.shooting = true;
    }

    onShootRelease() {

        this.touch.shooting = false;
    }

    updateDirection() {

        this.directionTarget = this.directionKeyboard;

        if (this.directionDevice) {

            this.directionTarget += this.directionDevice;
        }

        this.directionTarget %= 2 * Math.PI;
    }

    smoothDirection() {

        if (this.directionTarget == this.directionCurrent) {

            return;
        }

        if (Math.abs(this.directionTarget - this.directionCurrent) > Math.PI) {

            if (Math.abs(2 * Math.PI + this.directionTarget - this.directionCurrent) < Math.PI) {

                this.directionTarget += 2 * Math.PI;
            }
            else if (Math.abs(this.directionTarget - 2 * Math.PI - this.directionCurrent) < Math.PI) {

                this.directionCurrent += 2 * Math.PI;
            }
        }

        this.directionCurrent = (((this.directionSmoothness - 1) * this.directionCurrent + this.directionTarget) / this.directionSmoothness) % (2 * Math.PI);

        this.directionTarget %= 2 * Math.PI;
        this.directionCurrent %= 2 * Math.PI;

        if (Math.abs(this.directionCurrent - this.directionTarget) < 0.01) {

            this.directionCurrent = this.directionTarget;
        }
    }

    beforeHide() {

        super.beforeHide();
    }

    afterHide() {

        super.afterHide();
    }

    beforeShow() {

        super.beforeShow();

        this.directionCurrent =
        this.directionTarget =
        this.directionKeyboard = 0;

        World.things.protagonist.object.position.x = 
        World.things.protagonist.object.position.y = 
        World.things.protagonist.object.position.z = 0;

        World.things.protagonist.object.rotation.x = 
        World.things.protagonist.object.rotation.y = 
        World.things.protagonist.object.rotation.z = 0;

        World.camera.position.x = 0;
        World.camera.position.y = 0;
        World.camera.position.z = 50;
    }

    afterShow() {

        super.afterShow();
    }

    update(time) {
     
        if (Keyboard.down["KeyD"]) {

            this.directionKeyboard -= 0.1;
            this.updateDirection();
        }
        
        if (Keyboard.down["KeyA"]) {

            this.directionKeyboard += 0.1;
            this.updateDirection();
        }

        if (Keyboard.down["KeyW"] || this.touch.accellerating) {

            this.velocity += this.accelleration;
        }
        else if (this.velocity > 0) {

            this.velocity *= 0.9;
        }

        if (this.velocity > 4) {

            this.velocity = 4;
        }
        else if (this.velocity < 0.1) {

            this.velocity = 0;
        }

        this.smoothDirection();

        const velocityVector = new THREE.Vector3(0, this.velocity, 0);
        velocityVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.directionCurrent);

        World.things.protagonist.object.position.x += velocityVector.x;
        World.things.protagonist.object.position.y += velocityVector.y;

        World.camera.position.x =
        World.things.lightSpot.object.position.x =
        World.things.protagonist.object.position.x;

        World.camera.position.y =
        World.things.lightSpot.object.position.y =
        World.things.protagonist.object.position.y;

        World.camera.rotation.z = 
        World.things.protagonist.object.rotation.z = this.directionCurrent;
    }

    quit() {

        Screen.transition(screenMenu);
    }
}

export const screen = new screenPlay();