app.gfx.Screen = function Screen(name, options) {

    var me = this;

    this.name = name;

    this.view = document.getElementById(name + "View");

    this.controls = {};

    this.load = function load() {

        app.log.info("Loading " + me.name + " screen...");

        if (app.gfx.screens.current) {
        
            if (app.gfx.screens.current.onunload) {

                try {

                    app.gfx.screens.current.onunload.call(app.gfx.screens.current);
                }
                catch (ex) {

                    app.log.error("An error ocurred while unloading " + app.gfx.screens.current.name + " screen: " + ex.toString());
                }
            }

            try {

                app.gfx.screens.current.unload();
            }
            catch (ex) {

                app.log.error("Unable to unload screen: " + ex.toString());
            }
        }

        var compiledTemplateHtml = Handlebars.compile(me.view.innerHTML)({
            screen: me,
            strings: app.strings
        });

        app.mainContainer.innerHTML =
            "<div id='" + me.name + "Container' class='screen'>"
            + compiledTemplateHtml
            + "</div>";

        app.gfx.screens.current = me;

        if (me.onload) {

            try {

                me.onload.apply(me, arguments);
            }
            catch (ex) {

                app.log.error("An error ocurred while loading " + me.name + " screen: " + ex.toString());
            }
        }
    }

    this.unload = function unload() {

        for (var id in app.gfx.screens.current.controls) {

            var instance = app.gfx.screens.current.controls;
            if (instance.unload) {
                
                instance.unload();
            }
        }

        app.gfx.screens.current = null;
    }

    if (options) {

        for (var option in options) {

            me[option] = options[option];
        }
    }
};
