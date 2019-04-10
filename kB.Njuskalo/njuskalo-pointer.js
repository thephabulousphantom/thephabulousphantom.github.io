app.pointer = new (function keyboard() {

    this.onpress = function(element, handler) {

        $(element).tclick(handler);
    };

    this.onlongpress = function (element, handler) {

        $(element).tlongclick(handler);
    }

    this.init = function init() {

        app.log.info("Initializing pointer...");

        (function ($) {
            $.fn.tclick = function (onclick) {

                this.bind("touchstart", function (e) { 
                    
                    onclick.call(this, e); 
                    e.stopPropagation(); 
                    e.preventDefault(); 
                });

                this.bind("mousedown", function (e) { 

                    onclick.call(this, e);  //substitute mousedown event for exact same result as touchstart
                    e.stopPropagation(); 
                    e.preventDefault(); 
                });   

                return this;
            };
        })(jQuery);

        (function ($) {
            $.fn.tlongclick = function (onlongclick) {

                var downHandler = function (e) { 

                    if (this.dataset.longClickTimerId) {

                        clearTimeout(this.dataset.longClickTimerId);
                        delete this.dataset.longClickTimerId;
                    }

                    this.dataset.longClickTimerId = setTimeout(
                        (function() {
                            
                            delete this.dataset.longClickTimerId;
                            onlongclick.call(this, e);

                        }).bind(this),
                        1000
                    );

                    e.stopPropagation(); 
                    e.preventDefault(); 
                }

                this.bind("touchstart", downHandler);
                this.bind("mousedown", downHandler);

                var upHandler = function (e) { 

                    if (this.dataset.longClickTimerId) {

                        clearTimeout(this.dataset.longClickTimerId);
                        delete this.dataset.longClickTimerId;
                    }

                    e.stopPropagation(); 
                    e.preventDefault(); 
                };

                this.bind("touchend", upHandler);
                this.bind("mouseup", upHandler);

                return this;
            };
        })(jQuery);

        app.log.info("Pointer initialization done.");
    }

})();