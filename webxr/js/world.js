import Log from "./log.js";
import App from "./app.js";
import Thing from "./thing.js";
import ModelLibrary from "./modelLibrary.js";
import Colors from "./colors.js";
import * as THREE from "three";

export default class World extends Thing {

    models = {};
    ambientLight = null;
    sceneInitialised = false;

    constructor() {

        super();
        
    }

    init() {

        super.init();

        ModelLibrary.onLoaded(this.setupScene.bind(this));
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.ambientLight = new THREE.AmbientLight(Colors.lightAmbient);
        App.scene.add(this.ambientLight);

        this.models.room = ModelLibrary.get("soba", THREE.MeshLambertMaterial, false);
        this.models.room.position.set(0, 0, 0);
        App.scene.add(this.models.room);

        this.models.pah2Logo = ModelLibrary.get("pah2logo", THREE.MeshLambertMaterial, false);
        this.models.pah2Logo.position.set(4.5, 1, -4.5);
        App.scene.add(this.models.pah2Logo);

        this.models.funky = ModelLibrary.get("funky", undefined, false);
        this.models.funky.position.set(0, 0, 2);
        App.scene.add(this.models.funky);

        App.controllers.controller1.controller.addEventListener("selectstart", this.onControllerSelectStart.bind(App.controllers.controller1));
        App.controllers.controller2.controller.addEventListener("selectend", this.onControllerSelectEnd.bind(App.controllers.controller2));

        App.camera.position.set(0, 1.8, 0.5);
        App.controls.target.set(0, 1.8, 0);
        App.controls.update();

        Log.info(`Scene set up.`);

        this.sceneInitialised = true;
    }

    onControllerSelectStart() {

        this.controller.children[0].visible = true;
    }

    onControllerSelectEnd() {

        this.controller.children[0].visible = false;
    }

    update(time, elapsed) {
        
        super.update(time, elapsed);

        if (!this.sceneInitialised) {

            return;
        }

        this.models.pah2Logo.rotation.y = time / 1000;
        
        if (App.controls) {

            App.controls.update();
        }

        if (App.renderer) {

            App.renderer.render(App.scene, App.camera);
        }
    }
};