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

        App.camera.position.set(0, 1.8, 0.5);
        App.controls.target.set(0, 1.8, 0);
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