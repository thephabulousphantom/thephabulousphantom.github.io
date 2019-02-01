var app = new (function App() {

    this.controllerModeDurations = {

    };

    this.players = [];

    this.run = function run() {

        app.utility.init();
        app.gfx.init();
        app.keyboard.init();
        app.pointer.init();
        app.players.push(new app.Player("red", 640, 568, 256, 144, app.questions.add, true));
        app.players.push(new app.Player("blue", 640, 824, 256, 144, app.questions.add, true));
        
        app.gfx.screens.splash.load();
    }

})();

$(document).ready(app.run);
