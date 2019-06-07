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
            x: 0,
            y: 512,
            width: 512,
            height: 512
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

        for (var i = 0; i < app.players.length; i++) {

            app.players[i].car.width(app.players[i].tile.width * height / this.tiles.track.height);
            app.players[i].car.height(app.players[i].tile.height * height / this.tiles.track.height);
            app.players[i].car.y((i == 0 ? 32 : 220) * height / this.tiles.track.height);
        }

        this.updateCarPositions();
    },

    updateCarPositions: function updateCarPositions() {

        var height = this.race.offsetHeight;
        var zero = this.race.offsetWidth / 2;

        var zeroCenter0 = - (app.players[0].tile.width * height / this.tiles.track.height) / 2;
        var zeroCenter1 = - (app.players[0].tile.width * height / this.tiles.track.height) / 2;
        var positionScale0 = ((this.race.offsetWidth - (app.players[0].tile.width * height / this.tiles.track.height) - (app.players[1].tile.width * height / this.tiles.track.height))/ 2 - zeroCenter0) / 1000;
        var positionScale1 = ((this.race.offsetWidth - (app.players[0].tile.width * height / this.tiles.track.height) - (app.players[1].tile.width * height / this.tiles.track.height)) / 2 - zeroCenter1) / 1000;

        app.players[0].car.x(zero + zeroCenter0 + app.players[0].position * positionScale0);
        app.players[1].car.x(zero + zeroCenter1 + app.players[1].position * positionScale1);
    },

    updateScores: function updateScores() {

        var end = false;
        for (var i = 0; i < app.players.length; i++) {

            $(this.scores[i]).text(app.players[i].score);

            if (app.players[i].score == 0 || app.players[i].score == 10) {

                end = true;
            }
        }

        if (end) {

            app.gfx.screens.gameOver.load();
        }
    },

    onload: function onload(questions, random) {
      
        app.players[0].score = app.players[1].score = 5;
        app.players[0].questions = app.players[1].questions = questions;
        app.players[0].random = app.players[1].random = random;

        this.speed = 1;
        this.speedLabel = document.querySelector("#gameContainer #speedLabel");

        if ($(this.speedLabel).text() != Math.round(this.speed)) {

                    app.players[0].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                    app.players[1].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
        }

        $(this.speedLabel).text(Math.round(this.speed));

        this.race = document.querySelector("#gameContainer #race");
        this.track = document.querySelector("#gameContainer #track");
        this.trackContext = this.track.getContext("2d");
        this.controllers = document.querySelector("#gameContainer #controllers");
        this.startTime = 0;
        this.scores = [
            document.querySelector("#gameContainer #leftScore"),
            document.querySelector("#gameContainer #rightScore")
        ];
        
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
        app.players[0].car.animate(10);
        app.players[1].car.animate(10);

        this.updateScores();

        window.onresize = this.updateSize.bind(this);
        setTimeout(this.updateSize.bind(this), 1000);
        this.updateSize();
    },

    onPlayerGained: function onPlayerGained(player, time) {

        player.position = 1000;
        player.score++;
        //player.freezeBy = time += player.controller.control.modeDuration[0] / 2;

        player.controller.speed = -Math.min(this.speed / 2, player.controller.speed / 3);

        this.updateScores();
    },

    onPlayerLost: function onPlayerLost(player, time) {

        player.position = -1000;
        player.score--;
        //player.freezeBy = time += player.controller.control.modeDuration[0] / 2;

        player.controller.speed = Math.min(this.speed, Math.abs(player.controller.speed));

        this.updateScores();
    },

    checkForGainsOrLosses: function checkForGainsOrLosses(time) {

        for (var i = 0; i < app.players.length; i++) {

            if (app.players[i].position > 1000) {

                this.onPlayerGained(app.players[i], time);
            }
            else if (app.players[i].position < -1000) {

                this.onPlayerLost(app.players[i], time);
            }
            else if (app.players[i].freezeBy && app.players[i].freezeBy < time) {

                if (app.players[i].position == 0) {

                    app.players[i].freezeBy = null;
                    app.players[i].car.show();
                }
                else {
                    
                    app.players[i].position = 0
                    app.players[i].freezeBy = time + app.players[i].controller.control.modeDuration[0] / 2;
                }
            }
        }
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

        if (!this.startTime) {

            this.startTime = time;
        }

        this.progress += duration * 0.1 * this.speed;
        
        if (((frame % 30) | 0) == 0) {

            for (var i = 0; i < app.players.length; i++) {

                app.players[i].controller.speed -= this.speed / 10;
            }
        }

        if (((frame % 60) | 0) == 0) {

            this.speed = Math.min(1 + (time - this.startTime) / 10000, 6);

            if ($(this.speedLabel).text() != Math.round(this.speed)) {

                app.players[0].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                app.players[1].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
            }

            $(this.speedLabel).text(Math.round(this.speed));

            for (var i = 0; i < app.players.length; i++) {

                app.players[i].controller.updateModeDurations(this.speed);
            }
        }

        var offset = this.progress % (this.track.height * 2);
        this.track.style.left = -offset + "px";

        for (var i = 0; i < app.players.length; i++) {

            app.players[i].position += app.players[i].controller.speed;

            if (app.players[i].freezeBy) {

                var timeLeft = app.players[i].freezeBy - time;
                var playerVisible = !!(((timeLeft / 100) % 2) | 0);

                if (playerVisible) {

                    if (!app.players[i].car.visible()) {

                        app.players[i].car.style.show();;
                    }
                }
                else if (app.players[i].car.visible()) {

                    app.players[i].car.hide();
                }
            }
        }

        this.updateCarPositions();

        this.checkForGainsOrLosses(time);
    },

    onkeypress: function onKeyPressed(key) {

        switch (key.char) {

            case "+":
                this.speed++;

                if ($(this.speedLabel).text() != Math.round(this.speed)) {

                    app.players[0].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                    app.players[1].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                }

                $(this.speedLabel).text(Math.round(this.speed));
                break;

            case "-":
                this.speed--;

                if ($(this.speedLabel).text() != Math.round(this.speed)) {

                    app.players[0].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                    app.players[1].car.animate(10 + 50 * Math.round((this.speed - 1) / 5));
                }

                $(this.speedLabel).text(Math.round(this.speed));
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