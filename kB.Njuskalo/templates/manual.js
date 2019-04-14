app.gfx.screens.manual = new app.gfx.Screen("manual", {

    onload: function onload() {
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onkeypress: function onkeypress(key) {

        app.gfx.screens.game.load();
    },

    onunload: function onunload() {
    }
});
