import Log from "./log.js";
import App from "./app.js";
import Thing from "./thing.js";
import ModelLibrary from "./modelLibrary.js";

export default class World extends Thing {

    models = {};

    constructor() {

        super();
        
    }

    init() {

        super.init();

        ModelLibrary.onLoaded(this.setupScene.bind(this));
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.models.room = ModelLibrary.get("soba");
        this.models.room.position.x = 0;
        this.models.room.position.y = 0;
        this.models.room.position.z = 0;
        App.scene.add(this.models.room);

        App.camera.position.x = 0;
        App.camera.position.y = -0.5;
        App.camera.position.z = 1.8;
        App.camera.up.set(0, 0, 1);

        App.controls.target.set(0, 0, 1.8);
        App.controls.screenSpacePanning = false;
        App.controls.update();

        Log.info(`Scene set up.`);
    }

    update(time, elapsed) {
        
        super.update(time, elapsed);
        
        if (App.controls) {

            App.controls.update();
        }

        if (App.renderer) {

            App.renderer.render(App.scene, App.camera);
        }
    }
};