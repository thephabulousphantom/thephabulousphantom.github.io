app.gfx.screens.game = new app.gfx.Screen("game", {

    speed: 1,

    progress: 0,

    tiles: {
        track: {
            x: 0, 
            y: 0,
            width: 1024,
            height: 512
        },
        road: {
            x: 256,
            y: 512,
            width: 256,
            height: 256
        }
    },

    rasterizeTrack: function rasterizeTrack() {

        var block = 0;
        for (var x = 0; x < this.track.width; x += this.track.height * 2, block++) {

            this.trackContext.drawImage(this.roadImage, this.tiles.track.x, this.tiles.track.y, this.tiles.track.width, this.tiles.track.height, x, 0, this.track.height * 2, this.track.height);
        }
    },

    updateSize: function UpdateSize() {
      
        var height = this.race.offsetHeight;
        var repetitions = Math.floor(this.race.offsetWidth / height) + 3;
        var width = height * repetitions;

        this.track.width = width;
        this.track.height = height;

        this.rasterizeTrack();

        this.controllers.style.backgroundSize = width;

        var playerWidth = 400; // app.players[i].tile.width;
        var playerHeight = 400; // app.players[i].tile.height;

        for (var i = 0; i < app.players.length; i++) {

            app.players[i].car.width(playerWidth * height / this.tiles.track.height);
            app.players[i].car.height(playerHeight * height / this.tiles.track.height);
            app.players[i].car.y((i == 0 ? -16 : 104) * height / this.tiles.track.height);
        }

        this.updateCarPositions();
    },

    updateCarPositions: function updateCarPositions() {

        var height = this.race.offsetHeight;
        var zero = this.race.offsetWidth / 2;
        var playerWidth = 400; //app.players[0].tile.width;
        var playerHeight = 400; //app.players[0].tile.height;

        var zeroCenter0 = - (playerWidth * height / this.tiles.track.height) / 2;
        var zeroCenter1 = - (playerWidth * height / this.tiles.track.height) / 2;
        var positionScale0 = ((this.race.offsetWidth - (playerWidth * height / this.tiles.track.height) - (playerWidth * height / this.tiles.track.height))/ 2 - zeroCenter0) / 1000;
        var positionScale1 = ((this.race.offsetWidth - (playerWidth * height / this.tiles.track.height) - (playerWidth * height / this.tiles.track.height)) / 2 - zeroCenter1) / 1000;

        app.players[0].car.x(zero + zeroCenter0 + app.players[0].position * positionScale0);
        app.players[1].car.x(zero + zeroCenter1 + app.players[1].position * positionScale1);
    },

    checkForGameOver: function checkForGameOver() {

        for (var i = 0; i < app.players.length; i++) {

            if (app.players[i].score == 0 || app.players[i].score == 10 || app.players[i].score == 5) {

                app.gfx.screens.gameOver.load();
                return;
            }
        }
    },

    updateAnimationSpeed: function updateAnimationSpeed() {

        app.players[0].car.animate(5 + 10 * Math.round((this.speed - 1) / 5));
        app.players[1].car.animate(5 + 10 * Math.round((this.speed - 1) / 5));
    },

    onload: function onload(questions, random) {
      
        app.players[0].score = app.players[1].score = null;
        app.players[0].questions = app.players[1].questions = questions;
        app.players[0].random = app.players[1].random = random;

        this.speed = 1;

        this.race = document.querySelector("#gameContainer #race");
        this.track = document.querySelector("#gameContainer #track");
        this.trackContext = this.track.getContext("2d");
        this.controllers = document.querySelector("#gameContainer #controllers");
        this.startTime = 0;
        this.controllers.style.backgroundImage = "url(" + app.gfx.getTileSrc(this.tiles.road.x, this.tiles.road.y, this.tiles.road.width, this.tiles.road.height) + ")";

        app.players[0].position = 0;

        app.players[0].controller = app.gfx.controls.controller.load("leftController", document.querySelector("#gameContainer #controllers #left"), {

            player: app.players[0],
            questions: app.questions.add,
            onload: function onload() {
            },
            onrenderframe: function onrenderframe(frame, duration, time) {
            },
            onunload: function onunload() {
            }
        });

        app.players[1].position = 0;
        
        app.players[1].controller = app.gfx.controls.controller.load("rightController", document.querySelector("#gameContainer #controllers #right"), {

            player: app.players[1],
            onload: function onload() {
            },
            onrenderframe: function onrenderframe(frame, duration, time) {
            },
            onunload: function onunload() {
            }
        });

        this.roadImage = app.gfx.getTile(this.tiles.track.x, this.tiles.track.y, this.tiles.track.width, this.tiles.track.height, this.updateSize.bind(this));

        app.players[0].car.show();
        app.players[1].car.show();
        this.updateAnimationSpeed();

        this.checkForGameOver();

        window.onresize = this.updateSize.bind(this);
        setTimeout(this.updateSize.bind(this), 1000);
        this.updateSize();
    },

    onPlayerWon: function onPlayerWon(player, time) {

        if (app.players[0] == player) {


            app.players[0].score = 10;
            app.players[1].score = 0;

        } else {

            app.players[1].score = 10;
            app.players[0].score = 0;
        }

        this.checkForGameOver();
    },

    onPlayerLost: function onPlayerLost(player, time) {

        if (app.players[0] == player) {


            app.players[0].score = 0;
            app.players[1].score = 5;

        } else {

            app.players[1].score = 0;
            app.players[0].score = 5;
        }

        this.checkForGameOver();
    },

    checkForWinOrLoss: function checkForWinOrLoss(time) {

        for (var i = 0; i < app.players.length; i++) {

            if (app.players[i].position >= 1000) {

                this.onPlayerWon(app.players[i], time);
            }
            else if (app.players[i].position <= -1000) {

                this.onPlayerLost(app.players[i], time);
            }
        }
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

        if (!this.startTime) {

            this.startTime = time;
        }

        this.progress += duration * 0.1 * this.speed;
        
        /*if (((frame % 30) | 0) == 0) {

            for (var i = 0; i < app.players.length; i++) {

                app.players[i].controller.speed -= this.speed / 10;
            }
        }*/

        if (((frame % 60) | 0) == 0) {

            var startingSpeed = Math.round(this.speed);
            this.speed = Math.min(1 + (time - this.startTime) / 10000, 6);
            if (startingSpeed != Math.round(this.speed)) {

                this.updateAnimationSpeed();
            }

            for (var i = 0; i < app.players.length; i++) {

                app.players[i].controller.updateModeDurations(this.speed);
            }
        }

        var offset = this.progress % (this.track.height * 2);
        this.track.style.left = -offset + "px";

        for (var i = 0; i < app.players.length; i++) {

            var targetPosition = 100 * app.players[i].controller.speed;
            if (Math.abs(app.players[i].position - targetPosition) < 1) {

                app.players[i].position = targetPosition;
            }
            else {

                app.players[i].position += (targetPosition - app.players[i].position) / ((7 - this.speed) * 15);
            }
        }

        this.updateCarPositions();
        this.checkForWinOrLoss(time);
    },

    onkeypress: function onKeyPressed(key) {

        switch (key.char) {

            case "+":
                //this.speed++;
                break;

            case "-":
                //this.speed--;
                break;
        }
    },

    onunload: function onunload() {

        app.players[0].controller = null;
        app.players[1].controller = null;

        app.players[0].car.animate();
        app.players[1].car.animate();
        app.players[0].car.hide();
        app.players[1].car.hide();
 }
});