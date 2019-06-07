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
        width: tile_width,
        height: tile_height
    };

    this.car = new app.gfx.sprite(tile_x, tile_y, tile_width, tile_height, 2);
    //this.car.style.position = "fixed";

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