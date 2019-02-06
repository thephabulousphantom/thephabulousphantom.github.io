app.gfx.Control = function Control(name, options) {

    var control = this;

    this.name = name;
    this.view = document.getElementById(name + "View");

    if (options) {

        for (var option in options) {

            control[option] = options[option];
        }
    }

    this.load = function load(id, parent, options) {

        app.log.info("Loading " + control.name + " control " + id + "...");

        var instance = {
            id: id,
            screen: app.gfx.screens.current,
            control: control,
            parent: parent,
            container: document.createElement("div")
        };

        instance.container.id = instance.id;
        instance.container.className = "control " + control.name + "Container";
        instance.container.innerHTML = Handlebars.compile(control.view.innerHTML)({
            control: control,
            instance: instance,
            strings: app.strings
        });

        instance.screen.controls[id] = instance;

        if (instance.parent) {

            instance.parent.appendChild(instance.container);
        }

        if (options) {

            for (var option in options) {

                instance[option] = options[option];
            }
        }

        if (control.onload) {

            control.onload.call(control, instance);
        }

        if (instance.onload) {

            instance.onload.call(instance);
        }

        instance.unload = function unload() {

            if (control.onunload) {

                try {

                    control.onunload.call(control, instance);
                }
                catch (ex) {

                    app.log.error("An error ocurred while unloading " + control.name + " control " + instance.id + ": " + ex.toString());
                }
            }
            
            if (instance.onunload) {

                try {

                    instance.onunload.call(instance);
                }
                catch (ex) {

                    app.log.error("An error ocurred while unloading " + control.name + " control " + instance.id + ": " + ex.toString());
                }
            }

            if (instance.parent) {

                instance.parent.removeChild(instance.container);

                if (instance.screen.controls[id]) {

                    delete instance.screen.controlss[id];
                }
            }
        }

        return instance;
    }
};