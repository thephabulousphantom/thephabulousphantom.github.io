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

    findChild(model, name) {

        for (var i = 0; i < model.children.length; i++) {

            if (model.children[i].name == name) {

                return model.children[i];
            }

            const matchingChild = this.findChild(model.children[i], name);
            if (matchingChild) {

                return matchingChild;
            }
        }

        return null;
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.ambientLight = new THREE.AmbientLight(Colors.lightAmbient);
        App.scene.add(this.ambientLight);

        this.models.room = ModelLibrary.get("soba", THREE.MeshLambertMaterial, false);
        this.models.room.position.set(0, 0, 0);
        App.scene.add(this.models.room);

        this.floor = this.findChild(this.models.room, "teleport_target");

        this.models.pah2Logo = ModelLibrary.get("pah2logo", THREE.MeshLambertMaterial, false);
        this.models.pah2Logo.position.set(4.5, 1, -4.5);
        App.scene.add(this.models.pah2Logo);

        this.models.funky = ModelLibrary.get("funky", undefined, false);
        this.models.funky.position.set(0, 0, 2);
        App.scene.add(this.models.funky);

        App.controllers.controller1.controller.addEventListener("selectstart", this.onControllerSelectStart.bind(App.controllers.controller1));
        App.controllers.controller1.controller.addEventListener("selectend", this.onControllerSelectEnd.bind(App.controllers.controller1));

        App.controllers.controller2.controller.addEventListener("selectstart", this.onControllerSelectStart.bind(App.controllers.controller2));
        App.controllers.controller2.controller.addEventListener("selectend", this.onControllerSelectEnd.bind(App.controllers.controller2));

        this.raycaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();

        App.camera.position.set(0, 1.8, 0.5);
        App.controls.target.set(0, 1.8, 0);
        App.controls.update();

        this.teleportTarget = null;

        Log.info(`Scene set up.`);

        this.sceneInitialised = true;
    }

    onControllerSelectStart() {

        this.controller.children[0].visible = true;
        this.selecting = true;
    }

    onControllerSelectEnd() {

        this.controller.children[0].visible = false;
        this.selecting = false;

        if (App.world.teleportTarget) {

            const offsetPosition = { x: - App.world.teleportTarget.x, y: - App.world.teleportTarget.y, z: - App.world.teleportTarget.z, w: 1 };
            const offsetRotation = new THREE.Quaternion();
            const transform = new XRRigidTransform( offsetPosition, offsetRotation );
            const teleportSpaceOffset = App.baseXrReferenceSpace.getOffsetReferenceSpace( transform );
    
            App.renderer.xr.setReferenceSpace( teleportSpaceOffset );

            App.world.teleportTarget = null;
        }
    }

    updateTeleportTarget(controller) {

        this.tempMatrix.identity().extractRotation( controller.matrixWorld );

        this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
        this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );

        const intersects = this.raycaster.intersectObjects([ this.floor ]);

        if (intersects.length > 0) {

            this.teleportTarget = intersects[0].point;
            App.controllers.marker.visible = true;
            App.controllers.marker.position.set(this.teleportTarget.x, this.teleportTarget.y + 0.01, this.teleportTarget.z);
        }
        else {

            App.controllers.marker.visible = false;
        }
    }

    update(time, elapsed) {
        
        super.update(time, elapsed);

        if (!this.sceneInitialised) {

            return;
        }

        this.models.pah2Logo.rotation.y = time / 1000;
        
        App.controls.update();

        if (App.controllers.controller1.selecting) {

            this.updateTeleportTarget(App.controllers.controller1.controller);   
        }
        else if (App.controllers.controller2.selecting) {

            this.updateTeleportTarget(App.controllers.controller2.controller);
        }
        else if (App.controllers.marker.visible) {

            App.controllers.marker.visible = false;
        }

        App.renderer.render(App.scene, App.camera);
    }
};