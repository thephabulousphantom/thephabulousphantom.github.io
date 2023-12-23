import Log from "./log.js";
//import { RelativeOrientationSensor } from "./lib/sensors/motion-sensors.js";
import Keyboard from "./keyboard.js";

class Direction {

    deviceAngle = null;
    keyboardAngle = 0;
    current = 0;
    target = 0;
    smoothness = 6;

    constructor() {

        window.addEventListener("load", (function() {

            this.init();

        }).bind(this));
    }

    async init() {

        /*if (await this.initSensor(
            null,
            "relative direction",
            typeof(RelativeOrientationSensor) == "undefined" ? null : RelativeOrientationSensor,
            this.onDeviceOrientationUpdate
        )) {

            Log.info(`Initialised relative direction sensor.`);
        }
        else {

            Log.error(`Unable to initialise relative direction sensor.`);
        }*/

        window.addEventListener("deviceorientation", (this.onDeviceOrientationUpdate).bind(this));
    }

    onDeviceOrientationUpdate(evt) {

        this.deviceAngle = evt.alpha;
        this.updateDirection();
    }

    /*async initSensor(permission, sensorName, sensorClass, handler) {

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
        qt.fromArray(sensor.quaternion).invert();

        const orientation = new THREE.Vector3(0, 1, 0);
        orientation.applyQuaternion(qt);

        const yAxis = new THREE.Vector3(0, 1, 0);
        const zAxis = new THREE.Vector3(0, 0, 1);

        const oz = orientation.sub(zAxis).normalize();
        const yz = yAxis.sub(zAxis).normalize();

        this.deviceAngle = 
            (oz.clone().cross(yz).z < 0)
            ? 2 * (Math.PI - Math.acos(oz.dot(yz)))
            : 2 * Math.acos(oz.dot(yz));
      
        document.getElementById("labelDebug").innerText = `${((this.deviceAngle * 100) | 0) / 100.0} ${(oz.clone().cross(yz).z < 0 ? "u" : "d")}`;

        this.updateDirection();
    }*/

    updateDirection() {

        this.target = this.keyboardAngle;

        if (this.deviceAngle) {

            this.target += this.deviceAngle;
        }

        this.target %= 2 * Math.PI;
    }

    smoothDirection() {

        if (this.target == this.current) {

            return;
        }

        if (Math.abs(this.target - this.current) > Math.PI) {

            if (Math.abs(2 * Math.PI + this.target - this.current) < Math.PI) {

                this.target += 2 * Math.PI;
            }
            else if (Math.abs(this.target - 2 * Math.PI - this.current) < Math.PI) {

                this.current += 2 * Math.PI;
            }
        }

        this.current = (((this.smoothness - 1) * this.current + this.target) / this.smoothness) % (2 * Math.PI);

        this.target %= 2 * Math.PI;
        this.current %= 2 * Math.PI;

        if (Math.abs(this.current - this.target) < 0.01) {

            this.target = this.current;
        }
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

        this.smoothDirection();
    }
}

const direction = new Direction();

export default direction;