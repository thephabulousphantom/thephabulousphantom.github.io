import Log from "./log.js";
import App from "./app.js";
import Thing from "./thing.js";
import ModelLibrary from "./modelLibrary.js";
import Colors from "./colors.js";
import * as THREE from "three";
import * as Shaders from "./shaders/shaders.js";

export default class World extends Thing {

    upVector = new THREE.Vector3(0, 1, 0);
    downVector = new THREE.Vector3(0, -1, 0);

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

    setupModels() {

        this.models.room = ModelLibrary.get("soba", {
            shader: Shaders.NoiseShader,
            materialToOverride: "interior",
            shadow: false
        });
        this.models.room.position.set(0, 0, 0);
        App.scene.add(this.models.room);

        this.models.exterior = ModelLibrary.get("exterior", { material: THREE.MeshBasicMaterial, shadow: false });
        this.models.exterior.position.set(0, 0, 0);
        App.scene.add(this.models.exterior);

        this.floor = [];
        this.findChildren(App.scene, "walkable", this.floor);
        for (var i = 0; i < this.floor.length; i++) {

            this.floor[i].visible = false;
        }

        this.models.pah2Logo = ModelLibrary.get("pah2logo", { material: THREE.MeshLambertMaterial, shadow: false });
        this.models.pah2Logo.position.set(0, 1, -4.5);
        App.scene.add(this.models.pah2Logo);

        this.models.funky = ModelLibrary.get("funky", { shadow: false });
        this.models.funky.position.set(0, 0, 2);
        this.models.funky.scale.set(0.7,0.7,0.7);
        App.scene.add(this.models.funky);
    }

    setupPhysics() {

        App.physics.objects.floor = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            position: new CANNON.Vec3(0, 0, 0)
        });
        App.physics.objects.floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        App.physics.world.addBody(App.physics.objects.floor);

        App.physics.addBox(5.00, 1.5, 0.25, +0.00, 1.5, -5.25, 0);
        App.physics.addBox(2.30, 1.5, 0.25, -2.70, 1.5, +5.25, 0);
        App.physics.addBox(2.30, 1.5, 0.25, +2.70, 1.5, +5.25, 0);
        App.physics.addBox(0.25, 1.5, 5.00, -5.25, 1.5, +0.00, 0);
        App.physics.addBox(0.25, 1.5, 5.00, +5.25, 1.5, +0.00, 0);
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.setupModels();
        this.setupPhysics();

        this.raycaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();

        /*App.camera.position.set(0, 1.8, 0.5);
        App.controls.target.set(0, 1.8, 0);
        App.controls.update();*/

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

        if (App.renderer.isPresenting) {

            return;
        }

        const userDirection = new THREE.Vector3();
        App.user.getWorldDirection(userDirection);

        var strafeDirection = new THREE.Vector3();
        strafeDirection.copy(userDirection);
        strafeDirection.applyAxisAngle(this.downVector, Math.PI / 2);

        var moveDirection = new THREE.Vector3(
            userDirection.x * direction + strafeDirection.x * strafe,
            0, //cameraDirection.y * direction + strafeDirection.y * strafe,
            userDirection.z * direction + strafeDirection.z * strafe
        );

        App.physics.objects.user.position.x += moveDirection.x;
        App.physics.objects.user.position.y += moveDirection.y;
        App.physics.objects.user.position.z += moveDirection.z;

        App.physics.objects.user.velocity.set(0,0,0);
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

                const offsetPosition = {
                    x: - App.world.teleportTarget.x,
                    y: - App.world.teleportTarget.y,
                    z: - App.world.teleportTarget.z,
                    w: 1
                };
                const offsetRotation = new THREE.Quaternion();
                const transform = new XRRigidTransform( offsetPosition, offsetRotation );
                const teleportSpaceOffset = App.baseXrReferenceSpace.getOffsetReferenceSpace( transform );
        
                App.renderer.xr.setReferenceSpace( teleportSpaceOffset );
    
                App.world.teleportTarget = null;
            }

            App.controller.marker.visible = false;
        }

        var movex = 0, movey = 0;
        if (App.controller.direction.Up) {

            movex = 0.1;
        }

        if (App.controller.direction.Down) {

            movex = -0.1;
        }

        if (App.controller.direction.Left) {

            movey = -0.1;
        }

        if (App.controller.direction.Right) {

            movey = 0.1;
        }

        if (movex != 0 || movey != 0) {

            this.move(movex, movey);
        }
    }
};