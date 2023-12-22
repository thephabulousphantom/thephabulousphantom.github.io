import Log from "./log.js";
import { RelativeOrientationSensor } from "./lib/sensors/motion-sensors.js";
import Keyboard from "./keyboard.js";

class Direction {

    deviceAngle = null;
    keyboardAngle = 0;
    current = null;

    constructor() {

        window.addEventListener("load", (function() {

            this.init();

        }).bind(this));
    }

    async init() {

        if (await this.initSensor(
            null,
            "relative direction",
            typeof(RelativeOrientationSensor) == "undefined" ? null : RelativeOrientationSensor,
            this.onDeviceOrientationUpdate
        )) {

            Log.info(`Initialised relative direction sensor.`);
        }
        else {

            Log.error(`Unable to initialise relative direction sensor.`);
        }
    }

    async initSensor(permission, sensorName, sensorClass, handler) {

        Log.info(`Initializing ${sensorName} sensor...`);

        if (permission) {

            try {

                const result = await navigator.permissions.query({ name: permission });
                if (result.state != "granted") {
    
                    Log.warning(`Permission not granted for ${sensorName} sensor...`);
                    return false;
                }
            }
            catch (ex) {
    
                Log.warning(`Unable to request permissions for ${sensorName} sensor: ${ex.toString()}`);
                return false;
            }
        }

        try {

            var sensor = new sensorClass({ frequency: 60 });

            sensor.onreading = (function() {
    
                if (handler) {

                    (handler.bind(this))(sensor);
                }

            }).bind(this);
    
            sensor.onerror = (function(event) {
    
                if (event.error.name == 'NotReadableError') {
    
                    Log.warning(`${sensorName} sensor is not available.`);
                }
                else {
        
                    Log.warning(`Unexpected ${sensorName} sensor error.`);
                }

            }).bind(this);
    
            sensor.start();

            return true;
        }
        catch (ex) {

            Log.warning(`Unable to initialize ${sensorName} sensor: ${ex.toString()}`);

            return false;
        }
    }

    onDeviceOrientationUpdate(sensor) {

        const qt = new THREE.Quaternion();
        qt.fromArray(sensor.quaternion);

        const v = new THREE.Vector3(0, 1, 0);
        v.applyQuaternion(qt);

        var V1x = new THREE.Vector3(1, 0, 0);
        var V1y = new THREE.Vector3(0, 1, 0);
        var V1z = new THREE.Vector3(0, 0, 1);

        var Vxz = new THREE.Vector3(v.x, 0, v.z);
        var Vxy = new THREE.Vector3(v.x, v.y, 0);

        //angle in radian between origin X axis and X axis of V2
        //var angle_V1V2x = Math.acos(V1x.dot(V2xz.normalize()));

        //angle in radian between origin Y axis and Y axis of V2
        //var angle_V1V2y = Math.acos(V1y.dot(V2xy.normalize()));

        //angle in radian between origin Z axis and Z axis of V2
        this.deviceAngle = Math.acos(V1z.dot(Vxz.normalize()));

        //Game.deviceAngle = sensor.quaternion;
        //Log.debug(`direction ${JSON.stringify(Game.deviceAngle.quaternion)}`);

        this.updateDirection();
    }

    updateDirection() {

        this.current = this.keyboardAngle;

        if (this.deviceAngle) {

            this.current += this.deviceAngle;
            //this.direction.fromArray(this.deviceAngle.quaternion);
        }
        /*else {

            var qt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.keyboardAngle);
            this.direction.copy(qt);
        }*/
    }

    update(time) {

        if (Keyboard.down["KeyD"]) {

            this.keyboardAngle -= 0.1;
            this.updateDirection();
        }
        else if (Keyboard.down["KeyA"]) {

            this.keyboardAngle += 0.1;
            this.updateDirection();
        }
    }
}

const direction = new Direction();

export default direction;