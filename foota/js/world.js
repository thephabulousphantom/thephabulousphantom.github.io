import Log from "./log.js"
import Colors from "./colors.js";
import Factory from "./factory.js";
import Screen from "./screen.js";

class World {

    htmlElement = null;

    scene = null;
    camera = null;
    lightAmbient = null;
    lightSpot = null;
    renderer = null;

    objects = {};

    constructor() {

        window.addEventListener("load", (function() {

            this.htmlElement = document.getElementById("containerWorld");
            this.init();
            
        }).bind(this));
    }

    init() {

        Log.info(`Initialising the world...`);



        Log.info(`Initialising scene...`);
        this.scene = new THREE.Scene();

        Log.info(`Initialising camera...`);
        this.camera = Factory.getCamera();

        Log.info(`Initialising ambient light...`);
        this.objects.lightAmbient = Factory.getLightAmbient();
        this.scene.add( this.objects.lightAmbient );

        Log.info(`Initialising spot light...`);
        this.objects.lightSpot = Factory.getLightSpot();
        this.scene.add( this.objects.lightSpot );

        Log.info(`Initialising renderer...`);
        this.renderer = Factory.getRenderer();
        this.htmlElement.appendChild( this.renderer.domElement );

        Log.info("Adding protagonist...");
        this.objects.protagonist = Factory.getProtagonist();
        this.objects.protagonist.visible = false;
        this.scene.add(this.objects.protagonist);

        this.camera.lookAt(this.objects.protagonist.position);
        this.objects.lightSpot.target = this.objects.protagonist;

        Log.info(`Adding starfield...`)
        this.objects.starField = Factory.getStarField();
        for (var i = 0; i < this.objects.starField.objects.length; i++) {

            this.scene.add(this.objects.starField.objects[i]);
        }

        this.updateRendererSize();

        window.addEventListener("resize", this.onWindowResize.bind(this));

        Log.info(`The world initialised.`);
    }

    updateRendererSize() {

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

    onWindowResize() {

        this.updateRendererSize();
    }

    update(time) {

        this.htmlElement.style.backgroundColor = `rgba(255,0,0,${((Math.sin(time / 1000.0) + 1) / 10 + 0.20)})`;

        if (this.objects.starField) {

            this.objects.starField.update(this.camera.position.x, this.camera.position.y);
        }

        if (this.renderer) {

            this.renderer.render(this.scene, this.camera);
        }
    }
};

const world = new World();

export default world;