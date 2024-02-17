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
            /*material: THREE.MeshBasicMaterial,
            color: new THREE.Color(0, 0.5, 1),*/
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

        App.physics.objects.user = new CANNON.Body({
            mass: 70, // kg
            position: new CANNON.Vec3(0, 0.3, 0.3), // m
            shape: new CANNON.Sphere(0.3)
        });
        App.physics.world.addBody(App.physics.objects.user);

        App.physics.bindings.push({
            src: App.physics.objects.user.position,
            dest: App.controls.target,
            offset: { x: 0, y: 1.5, z: 0 }
        });

        App.physics.world.addBody(new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(5, 1.5, .25)),
            position: new CANNON.Vec3(0, 1.5, -5.25)
        }));
        App.physics.world.addBody(new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(2.3, 1.5, .25)),
            position: new CANNON.Vec3(-2.7, 1.5, 5.25)
        }));
        App.physics.world.addBody(new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(2.3, 1.5, .25)),
            position: new CANNON.Vec3(+2.7, 1.5, 5.25)
        }));
        App.physics.world.addBody(new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(.25, 1.5, 5)),
            position: new CANNON.Vec3(-5.25, 1.5, 0)
        }));
        App.physics.world.addBody(new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(.25, 1.5, 5)),
            position: new CANNON.Vec3(5.25, 1.5, 0)
        }));
    }

    setupScene() {

        Log.info(`Setting up scene...`);

        this.setupModels();
        this.setupPhysics();

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

        if (!App.baseXrReferenceSpace) {

            var cameraDirection = new THREE.Vector3();
            App.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            var strafeDirection = new THREE.Vector3();
            strafeDirection.copy(cameraDirection);
            strafeDirection.applyAxisAngle(this.downVector, Math.PI / 2);

            cameraDirection.x *= direction;
            cameraDirection.y *= direction;
            cameraDirection.z *= direction;

            strafeDirection.x *= strafe;
            strafeDirection.y *= strafe;
            strafeDirection.z *= strafe;

            var moveDirection = new THREE.Vector3(
                (1 - Math.abs(this.upVector.x)) * (cameraDirection.x + strafeDirection.x),
                (1 - Math.abs(this.upVector.y)) * (cameraDirection.y + strafeDirection.y),
                (1 - Math.abs(this.upVector.z)) * (cameraDirection.z + strafeDirection.z)
            );

            App.physics.objects.user.position.x += moveDirection.x;
            App.physics.objects.user.position.y += moveDirection.y;
            App.physics.objects.user.position.z += moveDirection.z;

            App.physics.objects.user.velocity.set(0,0,0);
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

            this.move(0, -.1);
        }

        if (App.controller.direction.Right) {

            this.move(0, .1);
        }

        App.renderer.render(App.scene, App.camera);
    }
};