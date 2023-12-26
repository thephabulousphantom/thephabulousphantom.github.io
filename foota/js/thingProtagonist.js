import Thing from "./thing.js";
import Colors from "./colors.js";

export default class Protagonist extends Thing {

    constructor() {

        super();

        const group = new THREE.Group();

        const shipGeometry = new THREE.ConeGeometry(1, 2, 3);
        const shipMaterial = new THREE.MeshLambertMaterial({ color: Colors.primary }); 
        const shipMesh = new THREE.Mesh(shipGeometry, shipMaterial); 

        shipMesh.position.x = 0;
        shipMesh.position.y = 0;
        shipMesh.position.z = 0;

        group.add(shipMesh);
        
        const exhaustGeometry = new THREE.ConeGeometry(0.5, 3, 3);
        const exhaustMaterial = new THREE.MeshLambertMaterial({ color: Colors.fire }); 
        const exhaustMesh = new THREE.Mesh(exhaustGeometry, exhaustMaterial); 

        exhaustMesh.position.x = 0;
        exhaustMesh.position.y = -2.6;
        exhaustMesh.position.z = 0;
        exhaustMesh.rotation.z = Math.PI;
        exhaustMesh.visible = false;

        group.add(exhaustMesh);

        const fireMap = new THREE.TextureLoader().load("./img/fire.png");
        const fireMaterial = new THREE.SpriteMaterial({ map: fireMap });
        const fireSprite = new THREE.Sprite( fireMaterial );
        fireSprite.scale.x = 
        fireSprite.scale.y = 
        fireSprite.scale.z = 4;
        fireSprite.position.y = 2;

        group.add(fireSprite);

        super.object = group;
    }

    update(time) {

        super.update(time);
    }
}