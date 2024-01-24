import Log from "./log.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class ModelLibrary {

    modelNames = [
        "soba"
    ];

    modelsCount = this.modelNames.length;

    onLoadCompleteCallbacks = [];

    constructor() {

        if (document.readyState === "complete") {

            this.init();
        }
        else {

            window.addEventListener("load", this.init.bind(this));
        }
    }

    init() {

        Log.info(`Initialising model library...`);

        this.gltfLoader = new GLTFLoader();
        this.modelsLoaded = 0;
        this.models = {};

        for (var i = 0; i < this.modelNames.length; i++) {

            this.loadModel(this.modelNames[i]);
        }
    }

    onLoaded(callback) {

        this.onLoadCompleteCallbacks.push(callback);

        if (this.modelsLoaded == this.modelsCount) {

            callback();
        }
    }

    async loadModel(modelName, shadow) {

        Log.info(`Loading model: ${modelName}`);

        const url = `./3d/${modelName}.glb`;

        const gltf = await new Promise((resolve, reject) => {

            this.gltfLoader.load(url, resolve, null, reject);
        });

        Log.info(`GLTF loaded: ${modelName}`);

        if (shadow !== undefined) {

            gltf.scene.traverse( function(child) { 

                if (child.isMesh) {
            
                    child.castShadow = shadow;
                    child.receiveShadow = shadow;
                }
            });
        }
        
        this.models[modelName] = gltf.scene;
        /*if (gltf.scene.children.length == 1) {

            this.models[modelName] = gltf.scene.children[0];
        }
        else {

            const model = new THREE.Group();
            for (var i = 0; i < gltf.scene.children.length; i++) {
    
                const object3d = gltf.scene.children[i];
                switch (object3d.type.toLowerCase()) {

                    case "mesh":
                        model.add( object3d );
                        break;

                    case "point":
                        const light = new THREE.PointLight( 0xff0000, 1, 100 );

                        light.position.set(object3d.position.x, object3d.position.y, object3d.position.z);

                        model.add( light );
                        break;
                }
            }
    
            this.models[modelName] = model;
        }*/


        this.modelsLoaded++;

        if (this.modelsLoaded == this.modelsCount) {

            this.onLoadingComplete();
        }
        else {

            this.onLoadingProgress((this.modelsLoaded / this.modelsCount) * 100);
        }
    }

    onLoadingProgress(progress) {

        Log.info(`ModelLibrary loading progress: ${progress}%`);
    }

    onLoadingComplete() {

        Log.info(`ModelLibrary loaded.`);

        for (var i = 0; i < this.onLoadCompleteCallbacks.length; i++) {

            try {

                this.onLoadCompleteCallbacks[i]();
            }
            catch (ex) {

            }
        }
    }

    get(modelName) {

        Log.info(`Instantiating model ${modelName}.`);

        return this.models[modelName].clone();
    }
}

const modelLibrary = new ModelLibrary();

export default modelLibrary;