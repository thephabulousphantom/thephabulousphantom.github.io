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

        this.cars = [
            new Image(),
            new Image()
        ];

        this.cars[0].src = app.players[0].car.el().src;
        this.cars[1].src = app.players[1].car.el().src;

        if (app.players[0].score > app.players[1].score) {

            $(this.panel).addClass(app.players[0].color);
            this.winnerScore.innerText = app.players[0].score;
            this.loserScore.innerText = app.players[1].score;
            this.winnerCar.appendChild(this.cars[0]);
            this.loserCar.appendChild(this.cars[1]);

            this.cars[0].width = ((app.players[0].tile.width / app.players[0].tile.height) * this.winnerCar.clientHeight);
            this.cars[0].height = (this.winnerCar.clientHeight);
            this.cars[0].style.top = ($(this.winnerScore).offset() + $(this.winnerScore).height()) + "px";
            this.cars[0].style.left = ($(document).width() / 2 - this.winnderCar.clientHeight / 2) + "px";
            this.cars[0].style.clip = "rect(0px," + ((app.players[0].tile.width / app.players[0].tile.height) * this.winnerCar.clientHeight)  + "px," + (this.winnerCar.clientHeight) + "px,0px)";
            this.cars[0].style.position = "absolute";

            this.cars[1].width = ((app.players[1].tile.width / app.players[1].tile.height) * this.loserCar.clientHeight);
            this.cars[1].height = (this.loserCar.clientHeight);
            this.cars[1].style.top = ($(this.loserScore).offset() + $(this.loserScore).height()) + "px";
            this.cars[1].style.left = ($(document).width() / 2 - this.loserCar.clientHeight / 2) + "px";
            this.cars[1].style.clip = "rect(0px," + ((app.players[1].tile.width / app.players[1].tile.height) * this.loserCar.clientHeight)  + "px," + (this.loserCar.clientHeight) + "px,0px)";
            this.cars[1].style.position = "absolute";
        }
        else {

            $(this.panel).addClass(app.players[1].color);
            this.winnerScore.innerText = app.players[1].score;
            this.loserScore.innerText = app.players[0].score;
            this.winnerCar.appendChild(this.cars[1]);
            this.loserCar.appendChild(this.cars[0]);

            this.cars[1].width = (((app.players[1].tile.width * 2) / app.players[1].tile.height) * this.winnerCar.clientHeight);
            this.cars[1].height = (this.winnerCar.clientHeight);
            this.cars[1].style.top = ($(this.winnerScore).offset() + $(this.winnerScore).height()) + "px";
            this.cars[1].style.left = ($(document).width() / 2 - this.winnerCar.clientHeight / 2) + "px";
            this.cars[1].style.clip = "rect(0px," + ((app.players[1].tile.width / app.players[1].tile.height) * this.winnerCar.clientHeight)  + "px," + (this.winnerCar.clientHeight) + "px,0px)";
            this.cars[1].style.position = "absolute";

            this.cars[0].width = (((app.players[0].tile.width * 2) / app.players[0].tile.height) * this.loserCar.clientHeight);
            this.cars[0].height = (this.loserCar.clientHeight);
            this.cars[0].style.top = ($(this.loserScore).offset() + $(this.loserScore).height()) + "px";
            this.cars[0].style.left = ($(document).width() / 2 - this.loserCar.clientHeight / 2) + "px";
            this.cars[0].style.clip = "rect(0px," + ((app.players[0].tile.width / app.players[0].tile.height) * this.loserCar.clientHeight)  + "px," + (this.loserCar.clientHeight) + "px,0px)";
            this.cars[0].style.position = "absolute";
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

            this.cars[i].style.position = "fixed";
        }

        document.onclick = null;
        clearTimeout(this.loadMenuTimerId);
    }
});
