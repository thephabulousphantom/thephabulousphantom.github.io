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

        const geometry = new THREE.BoxGeometry(2, 2, 2); 
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

    spawn(scale, setX, setY, setDirection) {

        var x = setX;
        var y = setY

        if (!x) {

            x = World.things.protagonist.object.position.x;
            y = World.things.protagonist.object.position.y;
    
            while (Math.sqrt((World.things.protagonist.object.position.x - x)*(World.things.protagonist.object.position.x - x) + (World.things.protagonist.object.position.y - y)*(World.things.protagonist.object.position.y - y)) < this.safeZone) {

                x = World.things.protagonist.object.position.x - this.fenceSize + Math.random() * this.fenceSize * 2;
                y = World.things.protagonist.object.position.y - this.fenceSize + Math.random() * this.fenceSize * 2;
            }
        }

        for (var i = 0; i < this.objects.length; i++) {

            if (!this.objects[i].visible) {

                this.objects[i].position.x = x;
                this.objects[i].position.y = y;

                this.objects[i].scale.x = 
                this.objects[i].scale.y = 
                this.objects[i].scale.z = scale ? scale : 1;

                this.objects[i].angleMomentum = {
                    x: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                    y: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                    z: Math.random() * (this.momentumMax - this.momentumMin) - (this.momentumMax - this.momentumMin) / 2,
                };

                this.objects[i].direction = setDirection !== undefined
                    ? setDirection
                    : 2 * Math.PI * Math.random();
                this.objects[i].speed = this.speedMin + Math.random() * (this.speedMax - this.speedMin);

                this.objects[i].visible = true;
                return;
            }
        }
    }

    explode(asteroid) {

        asteroid.visible = false;

        if (asteroid.scale.x == 1) {

            this.spawn(0.5, asteroid.position.x, asteroid.position.y, asteroid.direction + 0 * Math.PI / 4);
            this.spawn(0.5, asteroid.position.x, asteroid.position.y, asteroid.direction + 1 * Math.PI / 4);
            this.spawn(0.5, asteroid.position.x, asteroid.position.y, asteroid.direction + 2 * Math.PI / 4);
            this.spawn(0.5, asteroid.position.x, asteroid.position.y, asteroid.direction + 3 * Math.PI / 4);
            return;
        }
    }

    killAll() {

        for (var i = 0; i < this.objects.length; i++) {

            this.objects[i].visible = false;
        }
    }

    update(time) {

        for (var i = 0; i < this.objects.length; i++) {

            if (this.objects[i].visible) {

                if (Math.sqrt(
                    (World.things.protagonist.object.position.x - this.objects[i].position.x) * (World.things.protagonist.object.position.x - this.objects[i].position.x)
                    + (World.things.protagonist.object.position.y - this.objects[i].position.y) * (World.things.protagonist.object.position.y - this.objects[i].position.y)
                    ) < this.objects[i].scale.x * 2) {

                    World.things.protagonist.killed = true;
                }

                this.objects[i].position.x += this.objects[i].speed * Math.sin(-this.objects[i].direction);

                if (this.objects[i].position.x > World.things.protagonist.object.position.x + this.fenceSize) {

                    this.objects[i].position.x -= 2 * this.fenceSize;
                }

                if (this.objects[i].position.x < World.things.protagonist.object.position.x - this.fenceSize) {

                    this.objects[i].position.x += 2 * this.fenceSize;
                }

                this.objects[i].position.y += this.objects[i].speed * Math.cos(-this.objects[i].direction);

                if (this.objects[i].position.y > World.things.protagonist.object.position.y + this.fenceSize) {

                    this.objects[i].position.y -= 2 * this.fenceSize;
                }

                if (this.objects[i].position.y < World.things.protagonist.object.position.y - this.fenceSize) {

                    this.objects[i].position.y += 2 * this.fenceSize;
                }

                this.objects[i].rotation.x += this.objects[i].angleMomentum.x;
                this.objects[i].rotation.y += this.objects[i].angleMomentum.y;
                this.objects[i].rotation.z += this.objects[i].angleMomentum.z;

                for (var j = 0; j < World.things.bullets.objects.length; j++) {

                    if (World.things.bullets.objects[j].visible) {

                        if (Math.sqrt(
                            (World.things.bullets.objects[j].position.x - this.objects[i].position.x) * (World.things.bullets.objects[j].position.x - this.objects[i].position.x)
                            + (World.things.bullets.objects[j].position.y - this.objects[i].position.y) * (World.things.bullets.objects[j].position.y - this.objects[i].position.y)
                            ) < 1) {

                            World.things.bullets.objects[j].visible = false;
                            this.explode(this.objects[i]);
                            break;
                        }
                    }
                }
            }
        }
    }
}