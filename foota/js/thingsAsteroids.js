import Thing from "./thing.js";
import Colors from "./colors.js";
import World from "./world.js";

export default class Asteroids extends Thing {

    objects = [];

    speedMin = 0.05;
    speedMax = 0.2;
    momentumMin = 0.1;
    momentumMax = 0.2;

    fenceSize = 50;
    safeZone = 50;

    constructor(number) {

        super();

        const geometry = new THREE.BoxGeometry(1, 1, 1); 
        const material = new THREE.MeshLambertMaterial({ color: Colors.primary }); 

        const asteroids = new THREE.Group();

        for (var i = 0; i < number; i++) {

            const cube = new THREE.Mesh(geometry, material); 

            cube.position.x = 0;
            cube.position.y = 0;
            cube.position.z = 0;
            cube.visible = false;

            this.objects.push(cube);
            asteroids.add(cube);
        }

        super.object = asteroids;
    }

    spawnRandom(scale) {

        var x = World.things.protagonist.object.position.x;
        var y = World.things.protagonist.object.position.y;

        while (Math.sqrt((World.things.protagonist.object.position.x - x)*(World.things.protagonist.object.position.x - x) + (World.things.protagonist.object.position.y - y)*(World.things.protagonist.object.position.y - y)) < this.safeZone) {

            x = World.things.protagonist.object.position.x - this.fenceSize + Math.random() * this.fenceSize * 2;
            y = World.things.protagonist.object.position.y - this.fenceSize + Math.random() * this.fenceSize * 2;
        }

        this.spawn(
            scale ? scale : 4,
            x,
            y,
            2 * Math.PI * Math.random()
        );
    }

    spawn(scale, x, y, direction) {

        for (var i = 0; i < this.objects.length; i++) {

            if (!this.objects[i].visible) {

                this.objects[i].position.x = x;
                this.objects[i].position.y = y;

                this.objects[i].scale.x = 
                this.objects[i].scale.y = 
                this.objects[i].scale.z = scale;

                this.objects[i].angleMomentum = {
                    x: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                    y: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                    z: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                };

                this.objects[i].direction = direction;
                this.objects[i].speed = this.speedMin + Math.random() * (this.speedMax - this.speedMin);

                this.objects[i].visible = true;
                return;
            }
        }
    }

    explode(asteroid) {

        asteroid.visible = false;

        if (asteroid.scale.x > 1) {

            this.spawn(asteroid.scale.x / 2, asteroid.position.x, asteroid.position.y, asteroid.direction + 0 * Math.PI / 4);
            this.spawn(asteroid.scale.x / 2, asteroid.position.x, asteroid.position.y, asteroid.direction + 1 * Math.PI / 4);
            this.spawn(asteroid.scale.x / 2, asteroid.position.x, asteroid.position.y, asteroid.direction + 2 * Math.PI / 4);
            this.spawn(asteroid.scale.x / 2, asteroid.position.x, asteroid.position.y, asteroid.direction + 3 * Math.PI / 4);
        }
    }

    killAll() {

        for (var i = 0; i < this.objects.length; i++) {

            this.objects[i].visible = false;
        }
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

    update(time) {

        const protagonist = World.things.protagonist.object;

        for (var i = 0; i < this.objects.length; i++) {

            const asteroid = this.objects[i];
            if (asteroid.visible) {

                if (this.protagonistAndAsteroidCollision(protagonist, asteroid)) {

                    World.things.protagonist.killed = true;
                }

                asteroid.position.x += asteroid.speed * Math.sin(-asteroid.direction);

                if (asteroid.position.x > protagonist.position.x + this.fenceSize) {

                    asteroid.position.x -= 2 * this.fenceSize;
                }

                if (asteroid.position.x < protagonist.position.x - this.fenceSize) {

                    asteroid.position.x += 2 * this.fenceSize;
                }

                asteroid.position.y += asteroid.speed * Math.cos(-asteroid.direction);

                if (asteroid.position.y > protagonist.position.y + this.fenceSize) {

                    asteroid.position.y -= 2 * this.fenceSize;
                }

                if (asteroid.position.y < protagonist.position.y - this.fenceSize) {

                    asteroid.position.y += 2 * this.fenceSize;
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
    }
}