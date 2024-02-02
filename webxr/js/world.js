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

    findChildren(model, name, childrenArray) {

        for (var i = 0; i < model.children.length; i++) {

            
            if (model.children[i].name.indexOf(name) != -1) {

                childrenArray.push(model.children[i]);
            }

            this.findChildren(model.children[i], name, childrenArray);
        }
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.ambientLight = new THREE.AmbientLight(Colors.lightAmbient);
        App.scene.add(this.ambientLight);

        this.models.room = ModelLibrary.get("soba", THREE.MeshLambertMaterial, false);
        this.models.room.position.set(0, 0, 0);
        App.scene.add(this.models.room);


        this.floor = [];
        this.findChildren(this.models.room, "walkable", this.floor);

        this.models.pah2Logo = ModelLibrary.get("pah2logo", THREE.MeshLambertMaterial, false);
        this.models.pah2Logo.position.set(0, 1, -4.5);
        App.scene.add(this.models.pah2Logo);

        this.models.funky = ModelLibrary.get("funky", undefined, false);
        this.models.funky.position.set(0, 0, 2);
        App.scene.add(this.models.funky);

        this.raycaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();

        App.camera.position.set(0, 1.8, 0.5);
        App.controls.target.set(0, 1.8, 0);
        App.controls.update();

        this.teleportTarget = null;

        Log.info(`Scene set up.`);

        this.sceneInitialised = true;
    }

    updateTeleportTarget(controller) {

        this.tempMatrix.identity().extractRotation( controller.matrixWorld );

        this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
        this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );

        const intersects = this.raycaster.intersectObjects(this.floor);

        if (intersects.length > 0) {

            this.teleportTarget = intersects[0].point;
            App.controller.marker.visible = true;
            App.controller.marker.position.set(this.teleportTarget.x, this.teleportTarget.y + 0.01, this.teleportTarget.z);
        }
        else {

            App.controller.marker.visible = false;
        }
    }

    move(direction, strafe) {

        if (App.baseXrReferenceSpace) {

            const offsetPosition = { x: x, y: 0, z: y, w: 1 };
            const offsetRotation = new THREE.Quaternion();
            const transform = new XRRigidTransform(offsetPosition, offsetRotation);
            const teleportSpaceOffset = App.baseXrReferenceSpace.getOffsetReferenceSpace(transform);
    
            App.renderer.xr.setReferenceSpace(teleportSpaceOffset);
        }
        else {

            var cameraDirection = new THREE.Vector3();
            App.camera.getWorldDirection(cameraDirection);

            var strafeDirection = new THREE.Vector3();
            strafeDirection.copy(cameraDirection);
            strafeDirection.applyAxisAngle(App.camera.up, Math.PI / 2);

            cameraDirection.x *= direction;
            cameraDirection.y *= direction;
            cameraDirection.z *= direction;

            strafeDirection.x *= strafe;
            strafeDirection.y *= strafe;
            strafeDirection.z *= strafe;

            var moveDirection = new THREE.Vector3(
                (1 - Math.abs(App.camera.up.x)) * (cameraDirection.x + strafeDirection.x),
                (1 - Math.abs(App.camera.up.y)) * (cameraDirection.y + strafeDirection.y),
                (1 - Math.abs(App.camera.up.z)) * (cameraDirection.z + strafeDirection.z)
            );

            var newPosition = new THREE.Vector3();
            newPosition.copy(App.camera.position);
            newPosition.add(moveDirection);
            newPosition.add(moveDirection);

            this.raycaster.ray.origin.copy(newPosition);
            this.raycaster.ray.direction.copy(App.camera.up).multiplyScalar(-1);
    
            const intersects = this.raycaster.intersectObjects(this.floor);
    
            if (intersects.length > 0) {

                App.camera.position.add(moveDirection);
                App.controls.target.add(moveDirection);
                App.controls.update();
            }
        }
    }

    update(time, elapsed) {
        
        super.update(time, elapsed);

        if (!this.sceneInitialised) {

            return;
        }

        this.models.pah2Logo.rotation.y = time / 1000;
        
        App.controls.update();

        if (App.controller.hand1.selecting) {

            this.updateTeleportTarget(App.controller.hand1.controller);   
        }
        else if (App.controller.hand2.selecting) {

            this.updateTeleportTarget(App.controller.hand2.controller);
        }
        else if (App.controller.marker.visible) {

            if (App.world.teleportTarget) {

                const offsetPosition = { x: - App.world.teleportTarget.x, y: - App.world.teleportTarget.y, z: - App.world.teleportTarget.z, w: 1 };
                const offsetRotation = new THREE.Quaternion();
                const transform = new XRRigidTransform( offsetPosition, offsetRotation );
                const teleportSpaceOffset = App.baseXrReferenceSpace.getOffsetReferenceSpace( transform );
        
                App.renderer.xr.setReferenceSpace( teleportSpaceOffset );
    
                App.world.teleportTarget = null;
            }

            App.controller.marker.visible = false;
        }

        if (App.controller.direction.Up) {

            this.move(.1, 0);
        }

        if (App.controller.direction.Down) {

            this.move(-.1, 0);
        }

        if (App.controller.direction.Left) {

            this.move(0, .1);
        }

        if (App.controller.direction.Right) {

            this.move(0, -.1);
        }

        App.renderer.render(App.scene, App.camera);
    }
};