import Log from "./log.js";
import * as THREE from "three";
import App from "./app.js";
import ModelLibrary from "./modelLibrary.js";

export default class Controller {

    initialised = false;
    marker = null;
    hand1 = null;
    hand2 = null;

    selecting = false;

    direction = {
        Up: false,
        Down: false,
        Left: false,
        Right: false
    }

    constructor() {

    }

    init(xr) {

        this.setupModels(xr);
    }

    setupModels(xr) {


        // controllers

        this.hand1 = this.getHand(xr, 0);
        this.hand2 = this.getHand(xr, 1);


        // teleport marker

        const markerGeometry = new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 );
        const markerMaterial = new THREE.MeshBasicMaterial( { color: 0xbcbcbc } );
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial);       
        this.marker.position.set(0, 1, 0);
        this.marker.visible = false;

        this.addControllersToScene(App.scene);

        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        this.initialised = true;
    }

    onKeyDown(evt) {

        switch (evt.key.toLowerCase()) {

            case "arrowup":
            case "w":
                this.direction.Up = true;
                break;

            case "arrowdown":
            case "s":
                this.direction.Down = true;
                break;

            case "arrowleft":
            case "a":
                this.direction.Left = true;
                break;

            case "arrowright":
            case "d":
                this.direction.Right = true;
                break;

            default:
                break;
        }
    }

    onKeyUp(evt) {

        switch (evt.key.toLowerCase()) {

            case "arrowup":
            case "w":
                this.direction.Up = false;
                break;

            case "arrowdown":
            case "s":
                this.direction.Down = false;
                break;

            case "arrowleft":
            case "a":
                this.direction.Left = false;
                break;

            case "arrowright":
            case "d":
                this.direction.Right = false;
                break;

            default:
                break;
        }
    }

    getHand(xr, x) {

        const hand = {};
        hand.selecting = false;
        hand.controller = xr.getController(x);
        hand.controllerGrip = xr.getControllerGrip(x);

        hand.controller.addEventListener("connected", this.onControllerConnected.bind(hand));
        hand.controller.addEventListener("disconnected", this.onControllerDisconnected.bind(hand));
        hand.controller.addEventListener("selectstart", this.onControllerSelectStart.bind(hand));
        hand.controller.addEventListener("selectend", this.onControllerSelectEnd.bind(hand));

        return hand;
    }

    onControllerConnected(evt) {

        this.handedness = evt.data.handedness;

        // controller model

        const controllerGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 ); 
        const controllerMaterial = new THREE.MeshLambertMaterial( {color: 0x00ff00} ); 
        //const controllerModel = new THREE.Mesh( controllerGeometry, controllerMaterial ); 
        const controllerModel = ModelLibrary.get("hand", { forceMaterial: THREE.MeshLambertMaterial });

        this.controllerGrip.add(controllerModel);


        // ray model

        const rayGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -5 ) ] );
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const rayModel = new THREE.Line( rayGeometry, rayMaterial );
        rayModel.scale.z = 10;

        this.controller.add(rayModel);
        this.controller.children[0].visible = false;
        
        
        if (this.handedness == "right") {

            this.controller.children[0].scale.x = 
            this.controller.children[0].scale.y = 
            this.controller.children[0].scale.z = 1.5;
        }

        this.controller.connected = true;
        this.controller.visible = true;
        this.controllerGrip.visible = true;
    }

    onControllerDisconnected() {

        this.controller.connected = false;
        this.controller.visible = false;
        this.controllerGrip.visible = false;
    }

    onControllerSelectStart() {

        this.controller.children[0].visible = true;
        this.selecting = true;
    }

    onControllerSelectEnd() {

        this.controller.children[0].visible = false;
        this.selecting = false;
    }

    addControllersToScene(scene) {

        scene.add(this.marker);

        scene.add(this.hand1.controller);
        scene.add(this.hand1.controllerGrip);

        scene.add(this.hand2.controller);
        scene.add(this.hand2.controllerGrip);
    }

    update(time, elapsed) {
    }
}