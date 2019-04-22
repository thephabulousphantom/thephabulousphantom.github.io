app.gfx.screens.menu = new app.gfx.Screen("menu", {

    onload: function onload() {

        this.startAddButton = document.querySelector("#menuContainer #menu #startAddButton");
        this.startMultiplyButton = document.querySelector("#menuContainer #menu #startMultiplyButton");
        this.startFixedButton = document.querySelector("#menuContainer #menu #startFixedButton");
        this.gameOverButton = document.querySelector("#menuContainer #menu #gameOverButton");

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

        this.gameOver = function() {

            app.gfx.press(
                app.gfx.screens.menu.gameOverButton,
                app.gfx.screens.gameOver.load
            );
        };

        app.pointer.onpress(this.startAddButton, this.startAdd);
        app.pointer.onpress(this.startMultiplyButton, this.startMultiply);
        app.pointer.onpress(this.startFixedButton, this.startFixed);
        app.pointer.onpress(this.gameOverButton, this.gameOver);
    },

    onkeypress: function onkeypress(key) {

        if (key.char == " " || key.code == 13) {

        }
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onunload: function onunload() {
    }
});