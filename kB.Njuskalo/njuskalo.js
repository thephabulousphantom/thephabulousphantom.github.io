var app = new (function App() {

    this.run = function run() {

        app.utility.init();
        app.gfx.init();
        app.keyboard.init();
        app.pointer.init();
        
        app.gfx.screens.splash.load();
    }

})();

$(document).ready(app.run);
