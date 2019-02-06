app.gfx.screens.gameOver = new app.gfx.Screen("gameOver", {

    onload: function onload(questions, random) {

        this.panel = document.querySelector("#gameOverContainer #panel");
        this.winner = document.querySelector("#gameOverContainer #panel #winner");
        this.winnerTitle = document.querySelector("#gameOverContainer #panel #winner #winnerTitle");
        this.winnerCar = document.querySelector("#gameOverContainer #panel #winner #winnerCar");
        this.winnerScore = document.querySelector("#gameOverContainer #panel #winner #winnerScore");
        this.loser = document.querySelector("#gameOverContainer #panel #loser");
        this.loserTitle = document.querySelector("#gameOverContainer #panel #loser #loserTitle");
        this.loserCar = document.querySelector("#gameOverContainer #panel #loser #loserCar");
        this.loserScore = document.querySelector("#gameOverContainer #panel #loser #loserScore");

        if (app.players[0].score > app.players[1].score) {

            $(this.panel).addClass(app.players[0].color);
            this.winnerScore.innerText = app.players[0].score;
            this.loserScore.innerText = app.players[1].score;
            this.winnerCar.appendChild(app.players[0].car);
            this.loserCar.appendChild(app.players[1].car);

            app.players[0].car.style.width = ((app.players[0].tile.width / app.players[0].tile.height) * this.winnerCar.clientHeight) + "px";
            app.players[0].car.style.height = (this.winnerCar.clientHeight) + "px";
            app.players[0].car.style.top = "0px";
            app.players[0].car.style.left = "0px";
            app.players[0].car.style.position = "relative";

            app.players[1].car.style.width = ((app.players[1].tile.width / app.players[1].tile.height) * this.loserCar.clientHeight) + "px";
            app.players[1].car.style.height = (this.loserCar.clientHeight) + "px";
            app.players[1].car.style.top = "0px";
            app.players[1].car.style.left = "0px";
            app.players[1].car.style.position = "relative";
        }
        else {

            $(this.panel).addClass(app.players[1].color);
            this.winnerScore.innerText = app.players[1].score;
            this.loserScore.innerText = app.players[0].score;
            this.winnerCar.appendChild(app.players[1].car);
            this.loserCar.appendChild(app.players[0].car);

            app.players[1].car.style.width = ((app.players[1].tile.width / app.players[1].tile.height) * this.winnerCar.clientHeight) + "px";
            app.players[1].car.style.height = (this.winnerCar.clientHeight) + "px";
            app.players[1].car.style.top = "0px";
            app.players[1].car.style.left = "0px";
            app.players[1].car.style.position = "relative";

            app.players[0].car.style.width = ((app.players[0].tile.width / app.players[0].tile.height) * this.loserCar.clientHeight) + "px";
            app.players[0].car.style.height = (this.loserCar.clientHeight) + "px";
            app.players[0].car.style.top = "0px";
            app.players[0].car.style.left = "0px";
            app.players[0].car.style.position = "relative";
        }

        document.onclick = app.gfx.screens.menu.load;

        this.loadMenuTimerId = setTimeout(app.gfx.screens.menu.load, 10000);
    },

    onrenderframe: function onrenderframe(frame, duration, time) {
    },

    onkeypress: function onKeyPressed(key) {

        app.gfx.screens.menu.load();
    },

    onunload: function onunload() {

        for (var i = 0; i < app.players.length; i++) {

            app.players[i].car.style.position = "fixed";
        }

        document.onclick = null;
        clearTimeout(this.loadMenuTimerId);
    }
});
