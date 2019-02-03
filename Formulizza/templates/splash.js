app.gfx.screens.splash = new app.gfx.Screen("splash", {

    onload: function onload() {

        $("#" + this.name + "Container").click(app.gfx.screens.menu.load);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onkeypress: function onkeypress(key) {
    },

    onunload: function onunload() {
    }
});
