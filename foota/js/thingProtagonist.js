import Thing from "./thing.js";
import Colors from "./colors.js";
import World from "./world.js";
import Direction from "./direction.js"

export default class ThingProtagonist extends Thing {

    behaviour = this.behaviourNone;

    constructor() {

        super();

        const geometry = new THREE.BoxGeometry(1, 1, 1); 
        const material = new THREE.MeshLambertMaterial({ color: Colors.primary }); 
        const cube = new THREE.Mesh(geometry, material); 

        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = 0;

        super.object = cube;
    }

    behaviourNone(time) {

    }

    behaviourMenu(time) {

        this.object.rotation.x = Math.PI * 2 * time / 6000;
        this.object.rotation.y = Math.PI * 2 * time / 10000;
    }

    behaviourPlay(time) {

        const v = new THREE.Vector3(0, 1, 0);
        v.applyAxisAngle(new THREE.Vector3(0, 0, 1), Direction.current);

        World.things.protagonist.object.position.x += 1 * v.x;
        World.things.protagonist.object.position.y += 1 * v.y;
        World.things.protagonist.object.rotation.z = Direction.current;
    }

    update(time) {

        super.update(time);

        this.behaviour(time);
    }
}