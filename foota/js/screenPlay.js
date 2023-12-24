import Screen from "./screen.js";
import { screen as screenGameOver } from "./screenGameOver.js";
import World from "./world.js";
import Keyboard from "./keyboard.js";
import Asteroids from "./thingsAsteroids.js";

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

    score = null;
    level = null;
    visibleCount = 0;
    asteroidsToSpawn = null;
    asteroidSpawnScale = null;
    asteroidSpawnDelay = null;
    nextAsteroidSpawnedTime = null;

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

        this.labelLevel = document.querySelector("#screenPlay #labelLevel");
        this.labelScore = document.querySelector("#screenPlay #labelScore");
        this.labelAsteroidCount = document.querySelector("#screenPlay #labelAsteroidCount");

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

        World.things.protagonist.object.visible = true;

        World.camera.position.x = 0;
        World.camera.position.y = 0;
        World.camera.position.z = 50;

        World.things.asteroids.killAll();
        this.visibleCount = 0;

        this.level = 1;
        this.onLevelUpdated();

        this.score = 0;
        this.onScoreUpdated();


        World.things.protagonist.killed = false;
    }

    afterShow() {

        super.afterShow();
    }

    onLevelUpdated() {

        this.asteroidsToSpawn = 10 + this.level * 4;
        this.asteroidSpawnScale = Math.pow(2, 1 + ((this.level / 4) | 0));
        this.asteroidSpawnDelay = 5000 / this.level;
        this.nextAsteroidSpawnedTime = null;

        this.labelLevel.innerText = `level ${this.level}`;

        this.spawnAsteroid(5 + this.level * 2);
    }

    onScoreUpdated() {

        this.labelScore.innerText = `score ${this.score}`;
    }

    onAsteroidCountUpdated() {

        this.labelAsteroidCount.innerText = `asteroids ${this.visibleCount}`;
    }

    bulletAndAsteroidCollision(bullet, asteroid) {

        const distance = Math.sqrt(
            (bullet.position.x - asteroid.position.x) * (bullet.position.x - asteroid.position.x)
          + (bullet.position.y - asteroid.position.y) * (bullet.position.y - asteroid.position.y)
        );

        return distance < asteroid.scale.x / 2 + 0.5;
    }

    protagonistAndAsteroidCollision(protagonist, asteroid) {

        const distance = Math.sqrt(
              (protagonist.position.x - asteroid.position.x) * (protagonist.position.x - asteroid.position.x)
            + (protagonist.position.y - asteroid.position.y) * (protagonist.position.y - asteroid.position.y)
            );

        return distance < (asteroid.scale.x / 2 + 0.5);
    }

    explode(asteroid) {

        asteroid.visible = false;
        this.visibleCount--;
        
        this.score += (1000 / asteroid.scale.x) | 0;
        this.onScoreUpdated();

        if (asteroid.scale.x > 1) {

            const fragmentScale = asteroid.scale.x / 2;
            World.things.asteroids.spawn(fragmentScale, asteroid.position.x, asteroid.position.y, asteroid.direction + 0 * Math.PI / 4);
            World.things.asteroids.spawn(fragmentScale, asteroid.position.x, asteroid.position.y, asteroid.direction + 1 * Math.PI / 4);
            World.things.asteroids.spawn(fragmentScale, asteroid.position.x, asteroid.position.y, asteroid.direction + 2 * Math.PI / 4);
            World.things.asteroids.spawn(fragmentScale, asteroid.position.x, asteroid.position.y, asteroid.direction + 3 * Math.PI / 4);
        }

        this.onAsteroidCountUpdated();
    }

    checkForCollissions() {

        const protagonist = World.things.protagonist.object;
        const fenceSize = World.things.asteroids.fenceSize;

        var visibleCount = 0;

        for (var i = 0; i < World.things.asteroids.objects.length; i++) {

            const asteroid = World.things.asteroids.objects[i];
            if (asteroid.visible) {

                visibleCount++;

                if (this.protagonistAndAsteroidCollision(protagonist, asteroid)) {

                    World.things.protagonist.killed = true;
                }

                asteroid.position.x += asteroid.speed * Math.sin(-asteroid.direction);

                if (asteroid.position.x > protagonist.position.x + fenceSize) {

                    asteroid.position.x -= 2 * fenceSize;
                }

                if (asteroid.position.x < protagonist.position.x - fenceSize) {

                    asteroid.position.x += 2 * fenceSize;
                }

                asteroid.position.y += asteroid.speed * Math.cos(-asteroid.direction);

                if (asteroid.position.y > protagonist.position.y + fenceSize) {

                    asteroid.position.y -= 2 * fenceSize;
                }

                if (asteroid.position.y < protagonist.position.y - fenceSize) {

                    asteroid.position.y += 2 * fenceSize;
                }

                asteroid.rotation.x += asteroid.angleMomentum.x;
                asteroid.rotation.y += asteroid.angleMomentum.y;
                asteroid.rotation.z += asteroid.angleMomentum.z;

                for (var j = 0; j < World.things.bullets.objects.length; j++) {

                    const bullet = World.things.bullets.objects[j];
                    if (bullet.visible) {

                        if (this.bulletAndAsteroidCollision(bullet, asteroid)) {

                            bullet.visible = false;
                            this.explode(asteroid);
                            break;
                        }
                    }
                }
            }
        }

        this.visibleCount = visibleCount;
    }

    spawnAsteroid(count, time) {

        for (var i = 0; i < count; i++) {

            World.things.asteroids.spawnRandom(this.asteroidSpawnScale);
            this.asteroidsToSpawn--;
            this.nextAsteroidSpawnedTime = time ? (time + this.asteroidSpawnDelay) : null;
            this.score += this.asteroidSpawnScale * 10;
            this.onScoreUpdated();
            this.visibleCount++;
        }

        this.onAsteroidCountUpdated();
    }

    update(time) {
     
        this.checkForCollissions();

        if (this.asteroidsToSpawn > 0 && (!this.nextAsteroidSpawnedTime || this.nextAsteroidSpawnedTime < time)) {
                
            this.spawnAsteroid(1, time);
        }

        if (!this.asteroidsToSpawn && !this.visibleCount) {

            this.level++;
            this.onLevelUpdated();
        }

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

                Screen.transition(screenGameOver);
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