/* window.CustomEvent */
(function () {

    if ( typeof window.CustomEvent === "function" ) return false; //If not IE

    function CustomEvent ( event, params ) {
        
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;

})();

/* performance.now */
(function () {

    // prepare base perf object
    if (typeof window.performance === 'undefined') {

        window.performance = {};
    }

    if (!window.performance.now) {

        var nowOffset = Date.now();

        if (performance.timing && performance.timing.navigationStart) {

            nowOffset = performance.timing.navigationStart;
        }

        window.performance.now = function now() {

            return Date.now() - nowOffset;
        }
    }

})();

/* localStorage */
if (!('localStorage' in window)) {
  window.localStorage = {
    _data       : {},
    setItem     : function(id, val) { return this._data[id] = String(val); },
    getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
    removeItem  : function(id) { return delete this._data[id]; },
    clear       : function() { return this._data = {}; }
  };
};