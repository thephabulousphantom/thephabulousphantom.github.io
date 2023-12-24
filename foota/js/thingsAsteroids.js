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

    killAll() {

        for (var i = 0; i < this.objects.length; i++) {

            this.objects[i].visible = false;
        }
    }

    update(time) {

    }
}