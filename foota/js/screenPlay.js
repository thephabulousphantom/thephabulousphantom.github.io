import Screen from "./screen.js";
import { screen as screenMenu } from "./screenMenu.js";
import World from "./world.js";
import Keyboard from "./keyboard.js";

export default class screenPlay extends Screen {

    directionTarget = 0;
    directionCurrent = 0;
    directionDevice = null;
    directionKeyboard = 0;
    directionSmoothness = 3;

    velocity = 0;
    accelleration = 0.05;
    decelleration = 0.95;
    maxSpeed = 1;
    lastBulletShootTime = null;
    rapidFirePeriod = 100;

    touch = {

        touchAccellerating: false,
        touchShooting: false      
    }

    constructor() {

        super("screenPlay");
    }

    init() {

        super.init();

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

    onAccelleratePress(evt) {

        this.touch.accellerating = true;
        evt.preventDefault();
    }

    onAccellerateRelease(evt) {

        this.touch.accellerating = false;
        evt.preventDefault();
    }

    onShootPress(evt) {

        this.touch.shooting = true;
        evt.preventDefault();
    }

    onShootRelease(evt) {

        this.touch.shooting = false;
        evt.preventDefault();
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

        World.things.asteroids.killAll();
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

        for (var i = 0; i < 50; i++) {

            World.things.asteroids.spawn();
        }

        World.things.protagonist.killed = false;
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

        if (Keyboard.down["Space"] || this.touch.shooting) {

            if (!this.lastBulletShootTime || time - this.lastBulletShootTime > this.rapidFirePeriod) {

                this.lastBulletShootTime = time;

                World.things.bullets.shoot(
                    World.things.protagonist.object.position.x,
                    World.things.protagonist.object.position.y,
                    this.directionCurrent,
                    this.velocity
                );
            }
        }
        else {

            this.lastBulletShootTime = null;
        }

        if (Keyboard.down["KeyW"] || this.touch.accellerating) {

            this.velocity += this.accelleration;
        }
        else if (this.velocity > 0) {

            this.velocity *= this.decelleration;
        }

        if (this.velocity > this.maxSpeed) {

            this.velocity = this.maxSpeed;
        }
        else if (this.velocity < 0.01) {

            this.velocity = 0;
        }

        this.smoothDirection();

        const velocityVector = new THREE.Vector3(0, this.velocity, 0);
        velocityVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.directionCurrent);

        World.things.protagonist.object.position.x += velocityVector.x;
        World.things.protagonist.object.position.y += velocityVector.y;

        if (World.things.protagonist.killed) {

            World.things.protagonist.object.position.z += 1;
            World.things.protagonist.object.rotation.x += .1;
            World.things.protagonist.object.rotation.y += .2;
            this.directionKeyboard += 0.1;
            this.updateDirection();

            if (!Screen.transitioning) {

                Screen.transition(screenMenu);
            }
        }

        World.camera.position.x =
        World.things.lightSpot.object.position.x =
        World.things.protagonist.object.position.x;

        World.camera.position.y =
        World.things.lightSpot.object.position.y =
        World.things.protagonist.object.position.y;

        World.camera.rotation.z = 
        World.things.protagonist.object.rotation.z = this.directionCurrent;
    }
}

export const screen = new screenPlay();