app.gfx = new (function Gfx() {

    this.tiles = new Image();
    
    $.holdReady(true);
    this.tiles.onload = function () {

        $.holdReady(false);
    }

    this.tiles.src = "./gfx/smart-racers-tiles.png";

    this.getTileSrc = function getTile(x, y, width, height) {

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext("2d");
        context.drawImage(app.gfx.tiles, x, y, width, height, 0, 0, width, height);

        return canvas.toDataURL();
    }

    this.getTile = function getTile(x, y, width, height, callback) {

        var tile = new Image(width, height);

        if (callback) {

            tile.onload = callback.bind(tile);
        }

        tile.src = app.gfx.getTileSrc(x, y, width, height);

        return tile;
    }
    
    this.screens = {
        current: null
    };

    this.controls = {
    }

    var timers = {
        lastFrame: null,
        currentFrame: performance.now()
    };

    this.onrenderframe = function onrenderframe() {
        
        timers.lastFrame = timers.currentFrame;
        var time = timers.currentFrame = performance.now();
        var duration = timers.currentFrame - timers.lastFrame;
        var frame = (timers.currentFrame / (1000 / 60)) | 0;

        for (var i = 0; i < animations.length; i++) {

            var animation = animations[i];
            var position = time - animation.startTime;
            if (position > animation.duration) {

                position = animation.duration;
            }

            var percent = position / animation.duration;
            animation.type.animate.call(animation, percent);

            if (percent == 1) {

                if (animation.type.done) {

                    animation.type.done.call(animation);
                }

                if (animation.callback) {

                    animation.callback.call(animation.context);
                }

                animations.splice(i--, 1);
            }
        }

        if (app.gfx.screens.current) {

            try {

                if (app.gfx.screens.current.onrenderframe) {

                    app.gfx.screens.current.onrenderframe.call(app.gfx.screens.current, frame, duration, time);
                }

                for (var id in app.gfx.screens.current.controls) {

                    var instance = app.gfx.screens.current.controls[id];
                    if (instance.control.onrenderframe) {

                        instance.control.onrenderframe.call(instance.control, instance, frame, duration, time);
                    }

                    if (instance.onrenderframe) {

                        instance.onrenderframe.call(instance, frame, duration, time);
                    }
                }
            }
            catch (ex) {

                app.log.error("Couldn't render frame: " + ex.toString());
            }
        }

        window.requestAnimationFrame(app.gfx.onrenderframe);
    }

    var animations = [];

    var animationTypes = {
        press: {
            animate: function(percent) {

                this.element.style.transform = "scale(" + (1 - 0.10 * Math.sin(Math.PI * percent)) + ")";
            },
            done: function() {

                this.element.style.transform = "";
            }
        }
    }

    this.press = function press(element, callback) {

        animations.push({
            type: animationTypes.press,
            context: app.gfx.screens.current,
            startTime: timers.currentFrame,
            duration: 100,
            element: element,
            callback: callback
        });
    }

    this.init = function init() {

        app.log.info("Initializing graphics...");

        app.mainContainer = document.createElement("div");
        app.mainContainer.id = "mainContainer";
        document.body.appendChild(app.mainContainer);

        app.tiles = document.getElementById("tiles");

        window.requestAnimationFrame(app.gfx.onrenderframe);

        app.log.info("Graphics initialization done.");
    }

})();