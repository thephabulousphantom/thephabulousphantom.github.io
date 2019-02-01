app.gfx.screens.splash = new app.gfx.Screen("splash", {

    onload: function onload() {

        this.frame = document.getElementById("frame");

        this.timeout = setTimeout(

            app.gfx.screens["menu"].load,
            3000
        );
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

        this.frame.innerText = frame;
    },

    onkeypress: function onkeypress(key) {

        app.gfx.screens.menu.load();
    },

    onunload: function onunload() {

        clearTimeout(this.timeout);
    }
});
