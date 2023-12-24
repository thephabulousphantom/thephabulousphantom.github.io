import Thing from "./thing.js";
import Colors from "./colors.js";

export default class Protagonist extends Thing {

    constructor() {

        super();

        const group = new THREE.Group();

        const geometry = new THREE.ConeGeometry(1, 2, 3);
        const material = new THREE.MeshLambertMaterial({ color: Colors.primary }); 
        const mesh = new THREE.Mesh(geometry, material); 

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;

        group.add(mesh);
        
        const geometry2 = new THREE.ConeGeometry(0.5, 1, 3);
        const material2 = new THREE.MeshLambertMaterial({ color: Colors.fire }); 
        const mesh2 = new THREE.Mesh(geometry2, material2); 

        mesh2.position.x = 0;
        mesh2.position.y = -1.6;
        mesh2.position.z = 0;
        mesh2.rotation.z = Math.PI;
        mesh2.visible = false;

        group.add(mesh2);

        super.object = group;
    }

    update(time) {

        super.update(time);
    }
}