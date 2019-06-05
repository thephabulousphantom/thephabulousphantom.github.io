app.Player = function Player(color, tile_x, tile_y, tile_width, tile_height, questions, random, frames) {

    if (!frames) {

        frames = 1;
    }

    this.color = color;

    this.freezeBy = null;

    this.score = 0;
    
    this.tile = {
        x: tile_x,
        y: tile_y,
        width: tile_width / frames,
        height: tile_height
    };

    this.frames = [];

    for (var f = frames; f > 0; f--) {

        this.car = app.gfx.getTile(tile_x + (f - 1) * (tile_width / frames), tile_y, tile_width / frames, tile_height);
        this.car.style.position = "fixed";
        if (f != 1) {

            this.car.style.display = "none";
        }

        this.frames.push(this.car);
    }

    this.questions = questions;
    this.random = random;
};

app.Player.kind = {
    red: {
        color: "red"
    },
    blue: {
        color: "blue"
    }
}