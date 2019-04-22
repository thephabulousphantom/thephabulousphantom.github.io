app.gfx.screens.splash = new app.gfx.Screen("splash", {

    onload: function onload() {

        this.frame = document.getElementById("frame");

        this.timeout = setTimeout(

            app.gfx.screens.game.load,
            1000
        );
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

        this.frame.innerText = frame;
    },

    onkeypress: function onkeypress(key) {

        app.gfx.screens.game.load();
    },

    onunload: function onunload() {

        clearTimeout(this.timeout);
    }
});
