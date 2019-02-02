app.Player = function Player(color, tile_x, tile_y, tile_width, tile_height, questions, random) {

    this.color = color;

    this.freezeBy = null;

    this.score = null;
    
    this.tile = {
        x: tile_x,
        y: tile_y,
        width: tile_width,
        height: tile_height
    };

    this.car = app.gfx.getTile(tile_x, tile_y, tile_width, tile_height);
    this.car.style.position = "fixed";

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