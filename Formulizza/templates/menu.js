app.gfx.screens.menu = new app.gfx.Screen("menu", {

    onload: function onload() {

        this.startAddButton = document.querySelector("#menuContainer #menu #startAddButton");
        this.startMultiplyButton = document.querySelector("#menuContainer #menu #startMultiplyButton");
        this.startFixedButton = document.querySelector("#menuContainer #menu #startFixedButton");

        this.startAdd = function () {

            app.gfx.press(
                app.gfx.screens.menu.startAddButton,
                function() {
                    app.gfx.screens.game.load(app.questions.add, true);
                }
            );
        };

        this.startMultiply = function() {

            app.gfx.press(
                app.gfx.screens.menu.startMultiplyButton,
                function() {
                    app.gfx.screens.game.load(app.questions.multiply, true);
                }
            );
        };

        this.startFixed = function() {

            app.gfx.press(
                app.gfx.screens.menu.startFixedButton,
                function() {
                    app.gfx.screens.game.load(app.questions.add, false);
                }
            );
        };

        app.pointer.onpress(this.startAddButton, this.startAdd);
        app.pointer.onpress(this.startMultiplyButton, this.startMultiply);
        app.pointer.onpress(this.startFixedButton, this.startFixed);
    },

    onkeypress: function onkeypress(key) {

        if (key.char == " " || key.code == 13) {

            app.gfx.screens.menu.start();
        }
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onunload: function onunload() {
    }
});