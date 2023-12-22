import Colors from "./colors.js";
import StartField from "./starField.js";

class Factory {

    constructor() {

    }

    getCamera() {

        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 50;

        return camera;
    }

    getRenderer() {

        const renderer = new THREE.WebGLRenderer({
            precision: "lowp",
            powerPreference: "high-performance",
            alpha: true
        });

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(Colors.transparent, 0);

        return renderer;
    }

    getLightAmbient() {

        return new THREE.AmbientLight(
            Colors.lightAmbient,
            0.2
        );
    }

    getLightSpot() {

        const lightSpot = new THREE.SpotLight(
            Colors.lightSpot,
            10
        );

        /*lightSpot.castShadow = true;

        lightSpot.shadow.mapSize.width = 512;
        lightSpot.shadow.mapSize.height = 512;

        lightSpot.shadow.camera.near = 1;
        lightSpot.shadow.camera.far = 15.5;
        lightSpot.shadow.camera.fov = 5;*/

        lightSpot.position.x = 0;
        lightSpot.position.y = 0;
        lightSpot.position.z = 10;

        return lightSpot;
    }

    getProtagonist() {

        const geometry = new THREE.BoxGeometry(1, 1, 1); 
        const material = new THREE.MeshLambertMaterial({ color: Colors.primary }); 
        const cube = new THREE.Mesh(geometry, material); 

        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = 0;

        return cube;
    }

    getStarField() {

        return new StartField(10000, -2000, 2000, -1200, 1200, -300, -100, 2);
    }
}

const factory = new Factory();

export default factory;