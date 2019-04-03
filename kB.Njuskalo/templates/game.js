app.gfx.screens.game = new app.gfx.Screen("game", {

    onload: function onload() {

        this.header = document.getElementById("#gameContainer #header");
        this.mainMenu = document.getElementById("#gameContainer #mainMenu");
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

    },

    onunload: function onunload() {
    }
});
