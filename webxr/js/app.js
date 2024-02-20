import Log from "./log.js";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Tween from "./lib/tween/tween.esm.js";
import Colors from "./colors.js";
import World from "./world.js";
import Physics from "./physics.js";
import Controller from "./controller.js";

class App {

    constructor() {

        window.addEventListener("load", this.init.bind(this));
    }

    init() {

        Log.info(`Initialising app...`);
        
        this.appContainer =
            document.querySelector("body #appContainer");

        this.runningAsPWA =
            window.matchMedia("(display-mode: fullscreen)").matches
            || (window.navigator && window.navigator.standalone === true);

        this.scene = App.getScene();
        this.user = App.getUser(this.scene);
        this.camera = App.getCamera();
        this.renderer = App.getRenderer(this.appContainer, this.update.bind(this));
        this.controls = App.getControls(this.camera, this.renderer.domElement);
        
        this.controller = new Controller();
        this.controller.init(this.renderer.xr);

        //this.controllers = this.getControllers(this.scene, this.renderer);
        this.vrButton = App.getVrButton(document.body, this.renderer);

        this.physics = App.getPhysics(this.user);

        
        this.world = App.getWorld();

        this.updateViewDimensions();

        window.addEventListener("resize", this.updateViewDimensions.bind(this));

        this.renderer.xr.addEventListener( "sessionstart", this.onXrSessionStart.bind(this));
        this.renderer.xr.enabled = true;

        Log.info(`App initialised.`);
    }

    onXrSessionStart() {

        this.baseXrReferenceSpace = this.renderer.xr.getReferenceSpace();
    }

    static getScene() {

        Log.info(`Initialising scene...`);

        var scene = new THREE.Scene();
        return scene;
    }

    static getUser(scene) {

        Log.info(`Initialising user avatar...`);

        const geometryAvatar = new THREE.ConeGeometry(0.3, 0.6, 6); 
        const geometryPhysics = new THREE.SphereGeometry(0.3, 6, 6); 
        const material = new THREE.MeshBasicMaterial( {color: 0xaaaaaa} );
        const userAvatar = new THREE.Mesh(geometryAvatar, material );
        const physicsSphere = new THREE.Mesh(geometryPhysics, material );

        physicsSphere.position.set(0, 0.3, 0);
        physicsSphere.rotation.y = Math.PI / 6;
        userAvatar.position.set(0, 0.3 * 2 + 0.6 / 2, 0);

        const userContainer = new THREE.Group();
        userContainer.add(physicsSphere);
        userContainer.add(userAvatar);

        scene.add(userContainer);

        return userContainer;
    }

    static getCamera() {

        Log.info(`Initialising camera...`);

        const camera =
            new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

        camera.position.set(0, 2.8, 0.3);

        return camera;
    }

    static getControls(camera, container) {

        const controls = new OrbitControls(camera, container);
        controls.update();

        return controls;
    }

    static getPhysics(user) {

        Log.info(`Initialising physics...`);

        const physics = new Physics();

        physics.objects.user = new CANNON.Body({
            mass: 70, // kg
            position: new CANNON.Vec3(0, 1.3, 0), // m
            shape: new CANNON.Sphere(0.3)
        });

        physics.world.addBody(physics.objects.user);

        physics.bindings.push({
            src: physics.objects.user.position,
            dest: user.position,
            offset: { x: 0, y: -0.3, z: 0 }
        });

        return physics;
    }

    static getWorld() {

        Log.info(`Initialising world...`);

        const world = new World();
        return world;
    }

    static getRenderer(container, update) {

        Log.info(`Initialising renderer...`);

        var renderer =
            new THREE.WebGLRenderer({
                precision: "lowp",
                powerPreference: "high-performance",
                alpha: false,
                antialias: true
            });

        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(Colors.transparent, 0);

        container.appendChild( renderer.domElement );

        renderer.setAnimationLoop(update);
        
        return renderer;
    }

    static getVrButton(container, renderer) {

        const vrButton = VRButton.createButton(renderer);
        container.appendChild(vrButton);

        return vrButton;
    }

    updateViewDimensions() {

        if (this.renderer.domElement.parentElement) {

            const width = this.renderer.domElement.parentElement.clientWidth;
            const height = this.renderer.domElement.parentElement.clientHeight;

            if (width / height) {

                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize( width, height );
            }
        }
    }

    update() {

        if (this.time === undefined) {

            this.time = performance.now();
            return;
        }

        this.previousTime = this.time;
        this.time = performance.now();
        this.elapsed = this.time - this.previousTime;

        Tween.update(this.time);

        const prevX = this.controls.target.x;
        const prevY = this.controls.target.y;
        const prevZ = this.controls.target.z;

        if (this.renderer.xr.isPresenting) {

            var cameraWorldPosition = new THREE.Vector3();
            cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

            this.physics.objects.user.position.x = cameraWorldPosition.x;
            //this.physics.objects.user.position.y = cameraWorldPosition.y;
            this.physics.objects.user.position.z = cameraWorldPosition.z;
        }

        const previousUserPosition = new THREE.Vector3();
        previousUserPosition.copy(this.physics.objects.user.position);

        this.physics.update(this.time, this.elapsed);
        this.world.update(this.time, this.elapsed);

        if (this.renderer.xr.isPresenting) {

            const el = this.camera.matrixWorld.elements;
            const cameraDirection = new THREE.Vector3(-el[8], -el[9], -el[10]).normalize();
            this.user.lookAt(
                this.user.position.x + cameraDirection.x,
                this.user.position.y,
                this.user.position.z + cameraDirection.z,
            );
        }
        else {

            this.camera.position.x += this.physics.objects.user.position.x - previousUserPosition.x;
            this.camera.position.y += this.physics.objects.user.position.y - previousUserPosition.y;
            this.camera.position.z += this.physics.objects.user.position.z - previousUserPosition.z;

            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            this.user.lookAt(
                this.user.position.x + cameraDirection.x,
                this.user.position.y,
                this.user.position.z + cameraDirection.z,
            );    
    
            this.controls.target.set(this.user.position.x, (this.physics.objects.user.position.y - 0.3) + 1.8, this.user.position.z);
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

const app = new App();
export default app;