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
        App.camera.position.y = 0;
        App.camera.position.z = 1.8;
        App.camera.lookAt(0, 10, 1.8);
        //this.models.room.rotation.x = -Math.PI / 2;
        Log.info(`Scene set up.`);
    }

    update(time, elapsed) {
        
        super.update(time, elapsed);

        //this.models.room.rotation.x = time / 100;
        //this.models.room.rotation.y = time / 500;
        //this.models.room.rotation.z = time / 1000;

        if (App.renderer) {

            App.renderer.render(App.scene, App.camera);
        }
    }
};