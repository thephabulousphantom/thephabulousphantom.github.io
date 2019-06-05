var app = new (function App() {


    this.controllerModeDurations = {

    };

    this.players = [];

    this.run = function run() {

        app.utility.init();
        app.gfx.init();
        app.music.init();
        app.keyboard.init();
        app.pointer.init();
        app.players.push(new app.Player("red", 512, 512, 512, 256, app.questions.add, true, 2));
        app.players.push(new app.Player("blue", 512, 768, 512, 256, app.questions.add, true, 2));
        
        app.gfx.screens.splash.load();
    }

})();

$(document).ready(app.run);
