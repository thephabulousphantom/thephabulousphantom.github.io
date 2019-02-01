app.keyboard = new (function keyboard() {

    var onKeyPress = function onKeyPress(event) {

        var key = {

            char: event.key,
            code: event.which,
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            alt: event.altKey,
            toString: function toString() {

                return event.key
            }
        };

        app.log.info("Key pressed: " + key.code);

        if (app.gfx.screens.current) {

            if (app.gfx.screens.current.onkeypress) {

                if (app.gfx.screens.current.onkeypress.call(app.gfx.screens.current, key)) {

                    event.preventDefault();
                }
            }
        }
    }

    this.init = function init() {

        app.log.info("Initializing keyboard...");

        $(document).keypress(onKeyPress);

        app.log.info("Keyboard initialization done.");
    }

})();