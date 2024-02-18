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
        this.camera = App.getCamera();
        this.renderer = App.getRenderer(this.appContainer, this.update.bind(this));
        this.controls = App.getControls(this.camera, this.renderer.domElement);
        
        this.controller = new Controller();
        this.controller.init(this.renderer.xr);
        this.controller.addControllersToScene(this.scene);

        //this.controllers = this.getControllers(this.scene, this.renderer);
        this.vrButton = App.getVrButton(document.body, this.renderer);

        this.physics = App.getPhysics();
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

    static getCamera() {

        Log.info(`Initialising camera...`);

        const camera =
            new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

        return camera;
    }

    static getControls(camera, container) {

        const controls = new OrbitControls(camera, container);
        controls.update();

        return controls;
    }

    static getPhysics() {

        Log.info(`Initialising physics...`);

        const physics = new Physics();
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
        //renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(Colors.transparent, 0);
        //renderer.physicallyCorrectLights = true;

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

        this.physics.update(this.time, this.elapsed);
        this.world.update(this.time, this.elapsed);

        this.camera.position.x += this.controls.target.x - prevX;
        this.camera.position.y += this.controls.target.y - prevY;
        this.camera.position.z += this.controls.target.z - prevZ;

        this.renderer.render(this.scene, this.camera);
    }
}

const app = new App();
export default app;