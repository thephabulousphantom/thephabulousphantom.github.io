app.gfx.sprite = new (function Sprite(tileX, tileY, tileWidth, tileHeight, frames, x, y, width, height) {

    var _me = this;

    var _tile = {
        x: tileX,
        y: tileY,
        width: tileWidth,
        height: tileHeight
    }

    var _x = typeof(x) == "undefined" ? _tile.x : x;
    this.x = function x(value) {

        if (typeof(value) != "undefined") {

            _x = value | 0;
            _updateView();
        }

        return _x;
    }

    var _y = typeof(y) == "undefined" ? _tile.y : y;
    this.y = function y(value) {

        if (typeof(value) != "undefined") {

            _y = value | 0;
            _updateView();
        }

        return _y;
    }

    var _width = typeof(width) == "undefined" ? _tile.width : width;
    this.width = function width(value) {

        if (typeof(value) != "undefined") {

            _width = value | 0;
            _updateView();
        }

        return _width;
    }

    var _height = typeof(height) == "undefined" ? _tile.height : height;
    this.height = function height(value) {

        if (typeof(value) != "undefined") {

            _height = value | 0;
            _updateView();
        }

        return _height;
    }

    var _frames = frames ? frames : 1;
    this.frames = function frames() {

        return _frames;
    }

    var _frame = 0;
    this.frame = function frame(value) {

        if (typeof(value) != "undefined") {

            _frame = value | 0;
            _updateView();
        }

        return _frame;
    }

    var _visible = false;
    this.visible = function visible(value) {

        if (typeof(value) != "undefined") {

            _visible = value || 0;
            _updateView();
        }

        return _visible;
    }

    this.show = function show() {

        return _me.visible(true);
    }

    this.hide = function hide() {

        return _me.visible(false);
    }

    var _element = app.gfx.getTile(_tile.x, _tile.y, _tile.width * _frames, _tile.height);
    _element.style.display = "none";
    _element.style.position = "absolute";
    document.appendChild(_element);

    var _updateView = function updateView() {

        _element.style.left = _x - (_frame * _width);
        _element.style.top = _y;
        _element.style.width = _width * _frames;
        _element.style.height = _height;
        _element.style.clip = "rect(0px," + ((_frames - _frame - 1) * _width) + "px,0px," + (_frame * _width) + "px)";

        _element.style.display = _visible ? "inline-block" : "none";
    }

    _updateView();

})();