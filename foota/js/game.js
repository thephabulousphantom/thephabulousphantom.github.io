import Log from "./log.js";
import Tween from "./lib/tween/tween.esm.js";
import Screen from "./screen.js";
import World from "./world.js";
import { screen as screenMenu } from "./screenMenu.js";
import { RelativeOrientationSensor } from "./lib/sensors/motion-sensors.js";
import Keyboard from "./keyboard.js";

export default class Game {

    // global vars

    static time = null;
    static deviceOrientation = null;
    static keyboardAngle = 0;
    static orientation = null;

    // helper functions
    
    static runningOnMobile() {

        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);

        return check;
    }

    static runningOnMobileOrTablet() {

        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);

        return check;
    }

    static runningAsPWA() {
        
        return window.matchMedia("(display-mode: fullscreen)").matches
        || (window.navigator && window.navigator.standalone === true);
    }

    static _attemptedFullscreen = false;
    static _userSwitchedToFullScreen = false;

    async initFullScreen() {

        if (!Game.runningOnMobileOrTablet()) {

            return;
        }

        this.firstClickHandler = (async function() {

            document.documentElement.removeEventListener("mouseup", this.firstClickHandler);
            delete this.firstClickHandler;

            try {

                Log.info("Automatically switching to full screen...");
    
                Game.goFull();
            }
            catch (ex) {
    
                Log.warning(`Unable to switch to full screen mode: ${JSON.stringify(ex)}`);
            }

            document.documentElement.addEventListener("mouseup", function() {

                Game.ensureFUllScreenIfRequested();
            });
            
        }).bind(this);

        document.documentElement.addEventListener("mouseup", this.firstClickHandler);
    }

    static async goFull(onlyOnce) {

        try {

            if (onlyOnce && Game._attemptedFullscreen) {

                throw new Error("Can't request fullscreen multiple times.");
            }
    
            var domElement = document.documentElement;

            if (domElement.requestFullscreen) {

                await domElement.requestFullscreen({ navigationUI : "hide" });
            }
            else if (domElement.webkitRequestFullscreen) { // safari
    
                domElement.webkitRequestFullscreen();
            }
            else if (domElement.msRequestFullscreen) { // ie
    
                domElement.msRequestFullscreen();
            }
            else {

                throw new Error("Browser doesn't support going fullscreen.");
            }

            Game._userSwitchedToFullScreen = true;
        }
        catch (ex) {

            Log.warning(ex.message ? ex.message : JSON.stringify(ex));
        }
        finally {

            Game._attemptedFullscreen = true;
        }
    }

    static ensureFUllScreenIfRequested() {

        if (Game._userSwitchedToFullScreen && !window.matchMedia("(display-mode: fullscreen)").matches) {

            Game.goFull();
        }
    }

    static exitFull() {

        try {

            if (document.exitFullscreen) {

                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) { // safari
    
                document.webkitExitFullscreen();
            }
            else if (document.msExitFullscreen) { // ie
    
                document.msRequestFullscreen();
            }
            else {

                throw new Error("Browser doesn't support exiting fullscreen.");
            }

            Game._userSwitchedToFullScreen = false;
        }
        catch (ex) {

            Log.warning(ex.message ? ex.message : JSON.stringify(ex));
        }
    }



    // construction

    constructor() {

        window.addEventListener("load", (function() {

            this.init();

        }).bind(this));
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

        Game.deviceOrientation = sensor;
        Log.debug(`orientation ${JSON.stringify(Game.deviceOrientation.quaternion)}`);

        this.updateOrientation();
    }

    updateOrientation() {

        if (Game.deviceOrientation) {

            Game.orientation.fromArray(Game.deviceOrientation.quaternion);
        }
        else {

            var qt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Game.keyboardAngle);
            Game.orientation.copy(qt);
        }
    }

    async init() {

        Log.info(`Initialising the game...`);

        Game.orientation = new THREE.Quaternion();
    
        //Log.debugLabel = document.getElementById("labelDebug");

        if (await this.initSensor(
            null,
            "relative orientation",
            typeof(RelativeOrientationSensor) == "undefined" ? null : RelativeOrientationSensor,
            this.onDeviceOrientationUpdate
        )) {

            Log.info(`Initialised relative orientation sensor.`);
        }
        else {

            Log.error(`Unable to initialise relative orientation sensor.`);
        }

        requestAnimationFrame( this.animate.bind(this));

        Screen.transitionScreenId = "transitionBlackScreen";

        try {

            this.initFullScreen();
        }
        catch {

        }

        Screen.transition(screenMenu);
    }



    // process single frame

    animate(time, force, single) {

        Game.time = time;

        if (!single) {

            requestAnimationFrame( this.animate.bind(this));
        }

        if (this.lastFrameTime == null) {

            this.lastFrameTime = time;
        }

        var elapsed = time - this.lastFrameTime;

        if (this.targetFps) {

            if (!force && elapsed < 1000 / this.targetFps) {

                return;
            }

            elapsed -= elapsed % (1000 / this.targetFps);
        }

        this.lastFrameTime += elapsed;

        if (Keyboard.down["KeyD"]) {

            Game.keyboardAngle += 0.1;
            this.updateOrientation();
        }
        else if (Keyboard.down["KeyA"]) {

            Game.keyboardAngle -= 0.1;
            this.updateOrientation();
        }

        Tween.update(time);

        if (Screen.current) {

            Screen.current.update(time);
        }

        World.update(time);
    }

}

export const game = new Game();