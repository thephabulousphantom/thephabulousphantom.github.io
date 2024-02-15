import * as THREE from "three";
import Log from "./log.js";
import Shader from "./shaders/shader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class ModelLibrary {

    modelNames = [
        "soba",
        "exterior",
        "pah2logo",
        "funky"
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

    async loadModel(modelName) {

        Log.info(`Loading model: ${modelName}`);

        const url = `./3d/${modelName}.glb`;

        const gltf = await new Promise((resolve, reject) => {

            this.gltfLoader.load(url, resolve, null, reject);
        });

        Log.info(`GLTF loaded: ${modelName}`);

        
        
        this.models[modelName] = gltf.scene;

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

    get(modelName, options) {

        Log.info(`Instantiating model ${modelName}.`);

        const materialName = options.materialToOverride;
        const forceShader = options.shader;
        const forceMaterial = options.material;
        const forceColor = options.color;
        const shadow = options.shadow;

        const model = this.models[modelName].clone();

        model.traverse( function(child) { 

            if (child.isMesh) {
        
                try {

                    if (!materialName || materialName == child.material.name) {

                        if (shadow !== undefined) {

                            child.castShadow = shadow;
                            child.receiveShadow = shadow;
                        }

                        if (forceMaterial !== undefined) {

                                var prevMaterial = child.material;
                                child.material = new forceMaterial();
                                forceMaterial.prototype.copy.call( child.material, prevMaterial );
                        }

                        if (forceShader !== undefined) {

                            var prevMaterial = child.material;
                            child.material = forceShader.getMaterial();
                            child.material.copy.call( child.material, prevMaterial );
                        }

                        if (forceColor !== undefined) {
                            
                            child.material.color = forceColor;
                            child.material.lightMap = child.material.map;
                            child.material.map = null;
                        }
                    }
                }
                catch (ex) {

                    Log.warning(`Unable to force material: ${ex}`);
                }
            }
            else {

                if (shadow !== undefined) {

                    child.castShadow = shadow;
                }
            }
        });

        return model;
    }
}

const modelLibrary = new ModelLibrary();

export default modelLibrary;