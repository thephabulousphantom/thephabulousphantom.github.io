app.gfx.screens.gameOver = new app.gfx.Screen("gameOver", {

    onload: function onload(questions, random) {

        this.panel = document.querySelector("#gameOverContainer #panel");
        this.winner = document.querySelector("#gameOverContainer #panel #winner");
        this.winnerTitle = document.querySelector("#gameOverContainer #panel #winner #winnerTitle");
        this.winnerCar = document.querySelector("#gameOverContainer #panel #winner #winnerCar");

        var winnerColor = app.players[0].score > app.players[1].score
            ? app.players[0].color
            : app.players[1].color;

        $(this.panel).addClass(winnerColor);

        this.car = app.players[0].score > app.players[1].score
            ?  app.players[0].car
            :  app.players[1].car;

        this.car.x($(document).width() / 2 - this.winnerCar.clientHeight / 2);
        this.car.y($(this.winnerTitle).offset().top + $(this.winnerTitle).height());
        this.car.width((app.players[0].tile.width / app.players[0].tile.height) * (this.panel.clientHeight / 2));
        this.car.height(this.panel.clientHeight / 2);
        this.car.animate();
        this.car.show();

        document.onclick = app.gfx.screens.menu.load;

        this.loadMenuTimerId = setTimeout(app.gfx.screens.menu.load, 10000);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onkeypress: function onKeyPressed(key) {

        app.gfx.screens.menu.load();
    },

    onunload: function onunload() {

        this.car.hide();

        document.onclick = null;
        clearTimeout(this.loadMenuTimerId);
    }
});
