app.pointer = new (function keyboard() {

    this.onpress = function(element, handler, longHandler) {

        $(element).tclick(handler, longHandler);
    };

    this.init = function init() {

        app.log.info("Initializing pointer...");

        (function ($) {
            $.fn.tclick = function (onclick, onlongclick) {

                /*this.bind("touchstart", function (e) { 

                    this.pressTime = new Date().getTime();

                    onclick.call(this, e); 
                    e.stopPropagation(); 
                    e.preventDefault(); 
                });*/

                this.bind("contextmenu", function(e) {

                    e.preventDefault();
                    onlongclick.call(this, e); 
                    return false;
                });

                this.bind("mousedown", function (e) { 

                    this.pressTime = new Date().getTime();
                });

                this.bind("click", function (e) { 

                    if (onlongclick && (new Date().getTime() - this.pressTime) > 1000) {

                        onlongclick.call(this, e); 
                    }
                    else {

                        onclick.call(this, e);  //substitute mousedown event for exact same result as touchstart
                    }

                    e.stopPropagation(); 
                    e.preventDefault(); 
                });   

                return this;
            };
        })(jQuery);

        app.log.info("Pointer initialization done.");
    }

})();