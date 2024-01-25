import Log from "./log.js";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Tween from "./lib/tween/tween.esm.js";
import Colors from "./colors.js";
import World from "./world.js";

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
        this.controllers = App.getControllers(this.scene, this.renderer);
        this.vrButton = App.getVrButton(document.body, this.renderer);
        this.world = App.getWorld();

        this.updateViewDimensions();
        window.addEventListener("resize", this.updateViewDimensions.bind(this));

        Log.info(`App initialised.`);
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

        var controls = new OrbitControls(camera, container);
        controls.update();

        return controls;
    }

    static getControllers(scene, renderer) {

        const controllers = {};

        controllers.controller1 = renderer.xr.getController( 0 );
        scene.add( controllers.controller1 );

        controllers.controller2 = renderer.xr.getController( 1 );
        scene.add( controllers.controller2 );

        const handGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 ); 
        const handMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} ); 
        const cube = new THREE.Mesh( handGeometry, handMaterial ); 

        // Hand 1
        controllers.controllerGrip1 = renderer.xr.getControllerGrip( 0 );
        controllers.controllerGrip1.add( cube.clone() );
        scene.add( controllers.controllerGrip1 );

        // Hand 2
        controllers.controllerGrip2 = renderer.xr.getControllerGrip( 1 );
        controllers.controllerGrip2.add( cube.clone() );
        scene.add( controllers.controllerGrip2 );

        //

        const rayGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -5 ) ] );
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const ray = new THREE.Line( rayGeometry, rayMaterial );
        ray.name = 'line';
        ray.scale.z = 5;

        controllers.controller1.add( ray.clone() );
        controllers.controller2.add( ray.clone() );

        return controllers;
    }

    static getWorld() {

        Log.info(`Initialising world...`);

        var world = new World();
        return world;
    }

    static getRenderer(container, update) {

        Log.info(`Initialising renderer...`);

        var renderer =
            new THREE.WebGLRenderer({
                precision: "lowp",
                powerPreference: "high-performance",
                antialias: true
            });

        renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(Colors.transparent, 0);
        renderer.physicallyCorrectLights = true;
        renderer.xr.enabled = true;

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
        this.world.update(this.time, this.elapsed);
    }
}

const app = new App();
export default app;