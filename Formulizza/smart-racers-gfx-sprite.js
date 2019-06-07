app.gfx.sprite = function Sprite(tileX, tileY, tileWidth, tileHeight, frames, x, y, width, height) {

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

    var _animateIntervalId = null;
    this.animate = function animate(fps, from, to) {

        if (_animateIntervalId) {

            clearInterval(_animateIntervalId);
            _animateIntervalId = null;
        }

        if (typeof(fps) == "undefined") {

            return;
        }

        if (fps > 60) {

            fps = 60;
        }

        if (fps < 1) {

            fps = 1;
        }

        if (typeof(from) == "undefined") {

            from = 0;
        }

        if (typeof(to) == "undefined") {

            to = _frames - 1;
        }

        _animateIntervalId = setInterval(
            (function(from, to) {

                var frame = _me.frame();
                if (frame < from) {

                    frame = from;
                }

                if (++frame > to) {

                    frame = from;
                }

                _me.frame(frame);

            }).bind(this, from, to),
            1000 / fps
        );
    }

    var _element = app.gfx.getTile(_tile.x, _tile.y, _tile.width * _frames, _tile.height);
    _element.style.display = "none";
    _element.style.zIndex = "10000";
    _element.style.position = "absolute";
    document.body.appendChild(_element);

    this.el = function el() {

        return _element;
    }

    var _updateView = function updateView() {

        _element.style.left = (_x - (_frame * _width)) + "px";
        _element.style.top = (_y) + "px";
        _element.width = (_width * _frames) | 0;
        _element.height = (_height) | 0;
        _element.style.clip = "rect(0px," + ((_frame + 1) * _width) + "px," + _height + "px," + (_frame * _width) + "px)";

        _element.style.display = _visible ? "" : "none";
    }

    _updateView();

};