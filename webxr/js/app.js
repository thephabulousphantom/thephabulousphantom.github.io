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
        this.controllers = this.getControllers(this.scene, this.renderer);
        this.vrButton = App.getVrButton(document.body, this.renderer);
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

        var controls = new OrbitControls(camera, container);
        controls.update();

        return controls;
    }

    onControllerConnected() {

        this.controller.visible = true;
        this.controllerGrip.visible = true;
    }

    onControllerDisconnected() {

        this.controller.visible = false;
        this.controllerGrip.visible = false;
    }

    getController(x, controllerModel, rayModel) {

        const controller = {};
        controller.selecting = false;
        controller.controller = this.renderer.xr.getController(x);
        controller.controller.add(rayModel.clone());
        controller.controller.children[0].visible = false;
        this.scene.add(controller.controller);

        controller.controllerGrip = this.renderer.xr.getControllerGrip(x);
        controller.controllerGrip.add(controllerModel.clone());
        this.scene.add(controller.controllerGrip);

        controller.controller.addEventListener("connected", this.onControllerConnected.bind(controller));
        controller.controller.addEventListener("disconnected", this.onControllerDisconnected.bind(controller));

        return controller;
    }

    getControllers() {

        const controllers = {};

        // controller model

        const controllerGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 ); 
        const controllerMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} ); 
        const controllerModel = new THREE.Mesh( controllerGeometry, controllerMaterial ); 


        // ray model

        const rayGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -5 ) ] );
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const rayModel = new THREE.Line( rayGeometry, rayMaterial );
        rayModel.scale.z = 10;


        // controllers

        controllers.controller1 = this.getController(0, controllerModel, rayModel);
        controllers.controller2 = this.getController(1, controllerModel, rayModel);


        // teleport marker

        const markerGeometry = new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 );
        const markerMaterial = new THREE.MeshBasicMaterial( { color: 0xbcbcbc } );
        controllers.marker = new THREE.Mesh(markerGeometry, markerMaterial);       
        controllers.marker.position.set(0, 1, 0);
        controllers.marker.visible = false;
        this.scene.add(controllers.marker);

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