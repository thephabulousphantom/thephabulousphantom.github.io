import Log from "./log.js"
import Factory from "./factory.js";

class World {

    htmlElement = null;

    scene = null;
    camera = null;
    renderer = null;

    things = {};

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
        this.things.lightAmbient = Factory.getLightAmbient();
        this.scene.add(this.things.lightAmbient.object);

        Log.info(`Initialising spot light...`);
        this.things.lightSpot = Factory.getLightSpot();
        this.scene.add(this.things.lightSpot.object);

        Log.info(`Initialising renderer...`);
        this.renderer = Factory.getRenderer();
        this.htmlElement.appendChild( this.renderer.domElement );

        this.updateRendererSize();

        window.addEventListener("resize", this.onWindowResize.bind(this));

        Log.info(`The world initialised.`);
    }

    makeThings() {

        Log.info("Adding protagonist...");
        this.things.protagonist = Factory.getProtagonist();
        this.things.protagonist.object.visible = false;
        this.scene.add(this.things.protagonist.object);

        Log.info("Adding trail...");
        this.things.trail = Factory.getTrail();
        this.things.trail.object.visible = false;
        this.scene.add(this.things.trail.object);

        Log.info("Adding bullets...");
        this.things.bullets = Factory.getBullets();
        this.scene.add(this.things.bullets.object);

        Log.info("Adding asteroids...");
        this.things.asteroids = Factory.getAsteroids();
        this.scene.add(this.things.asteroids.object);

        this.camera.lookAt(this.things.protagonist.object.position);
        this.things.lightSpot.object.target = this.things.protagonist.object;

        Log.info(`Adding starfield...`)
        this.things.starField = Factory.getStarField();
        this.scene.add(this.things.starField.object);
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

        for (var entityName in this.things) {

            const entity = this.things[entityName];
            entity.update(time);
        }

        if (this.renderer) {

            this.renderer.render(this.scene, this.camera);
        }
    }
};

const world = new World();

export default world;