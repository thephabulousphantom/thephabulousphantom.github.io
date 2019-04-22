app.music = new (function Music() {

    var _modPlayer = null;
    var _volume = 1.0;
    var _fadeInInterval = null;
    var _fadeInStartTime = null;
    var _fadeInEndTime = null;

    this.player = function player() {

        return _modPlayer;
    };

    this.volume = function volume(value) {

        if (typeof(value) !== "undefined") {

            _volume = value;
            if (_modPlayer && _modPlayer.context) {

                if (!_fadeInInterval) {

                    _modPlayer.gainNode.gain.setValueAtTime(_volume, _modPlayer.context.currentTime);
                }
            }
        }

        return _volume;
    }

    this.load = function load(module) {

        _modPlayer.load(module);
    }

    var initializeAudio = function initializeAudio() {

        // _modPlayer.autostart = true;
        _modPlayer.onReady = function () {

            _modPlayer.samplerate = 22050;

            _fadeInStartTime = 1.0 * new Date().getTime();
            _fadeInEndTime = _fadeInStartTime + 20000.0;
            _fadeInInterval = setInterval(function fadeIn() {

                var currentTime = 1.0 * new Date().getTime();
                if (currentTime >= _fadeInEndTime) {

                    if (_modPlayer && _modPlayer.context) {

                        _modPlayer.gainNode.gain.setValueAtTime(_volume, _modPlayer.context.currentTime);
                    }
                    
                    clearInterval(_fadeInInterval);
                    _fadeInInterval = null;

                    return;
                }

                var fadeInProgress = (currentTime - _fadeInStartTime) / (_fadeInEndTime - _fadeInStartTime)
                if (_modPlayer && _modPlayer.context) {

                    _modPlayer.gainNode.gain.setValueAtTime(fadeInProgress * _volume, _modPlayer.context.currentTime);
                }

                console.log("fading in volume to: " + fadeInProgress * _volume);

            }, 500);

            _modPlayer.play();
        };

        //_modPlayer.load("./lib/jhalme/mods/overload.mod");

        window.removeEventListener("click", initializeAudio);
    }
    
    this.init = function init() {

        _modPlayer = new Modplayer();
        window.addEventListener("click", initializeAudio);
    }

})();