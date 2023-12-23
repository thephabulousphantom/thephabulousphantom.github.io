import Thing from "./thing.js";
import Colors from "./colors.js";

export default class ThingProtagonist extends Thing {

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

    update(time) {

        super.update(time);
    }
}