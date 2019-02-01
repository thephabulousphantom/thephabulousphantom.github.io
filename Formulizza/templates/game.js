app.gfx.screens.game = new app.gfx.Screen("game", {

    speed: 2,

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

        app.players[0].car.style.width = (app.players[0].tile.width * height / this.tiles.track.height) + "px";
        app.players[0].car.style.height = (app.players[0].tile.height * height / this.tiles.track.height) + "px";
        app.players[0].car.style.top = (68 * height / this.tiles.track.height) + "px";

        app.players[1].car.style.width = (app.players[1].tile.width * height / this.tiles.track.height) + "px";
        app.players[1].car.style.height = (app.players[1].tile.height * height / this.tiles.track.height) + "px";
        app.players[1].car.style.top = (300 * height / this.tiles.track.height) + "px";

        this.updateCarPositions();
    },

    updateCarPositions: function updateCarPositions() {

        var height = this.race.offsetHeight;
        var zero = this.race.offsetWidth / 2;

        var zeroCenter0 = - (app.players[0].tile.width * height / this.tiles.track.height) / 2;
        var zeroCenter1 = - (app.players[0].tile.width * height / this.tiles.track.height) / 2;
        var positionScale0 = ((this.race.offsetWidth - (app.players[0].tile.width * height / this.tiles.track.height) - (app.players[1].tile.width * height / this.tiles.track.height))/ 2 - zeroCenter0) / 1000;
        var positionScale1 = ((this.race.offsetWidth - (app.players[0].tile.width * height / this.tiles.track.height) - (app.players[1].tile.width * height / this.tiles.track.height)) / 2 - zeroCenter1) / 1000;

        app.players[0].car.style.left = (zero + zeroCenter0 + app.players[0].position * positionScale0) + "px";
        app.players[1].car.style.left = (zero + zeroCenter1 + app.players[1].position * positionScale1) + "px";
    },

    onload: function onload(questions, random) {

        app.players[0].questions = app.players[1].questions = questions;
        app.players[0].random = app.players[1].random = random;

        this.race = document.querySelector("#gameContainer #race");
        this.track = document.querySelector("#gameContainer #track");
        this.trackContext = this.track.getContext("2d");
        this.controllers = document.querySelector("#gameContainer #controllers");
        
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

        this.race.appendChild(app.players[0].car);
        this.race.appendChild(app.players[1].car);

        window.onresize = this.updateSize.bind(this);
        setTimeout(this.updateSize.bind(this), 1000);
        this.updateSize();
    },

    onrenderframe: function onrenderframe(frame, duration, time) {

        this.progress += duration * 0.2 + this.speed;
        var offset = this.progress % (this.track.height * 2);
        this.track.style.left = -offset + "px";

        app.players[0].position += app.players[0].controller.speed; 
        app.players[1].position += app.players[1].controller.speed;
        
        this.updateCarPositions();

        if (Math.abs(app.players[0].position) > 1000) {

            app.gfx.screens.menu.load();
        }

        if (Math.abs(app.players[1].position) > 1000) {
            
            app.gfx.screens.menu.load();
        }
    },

    onkeypress: function onKeyPressed(key) {

        switch (key.char) {

            case "+":
                this.speed++;
                break;

            case "-":
                this.speed--;
                break;
        }
    },

    onunload: function onunload() {

        app.players[0].controller = null;
        app.players[1].controller = null;
    }
});