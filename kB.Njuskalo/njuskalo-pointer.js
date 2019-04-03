app.pointer = new (function keyboard() {

    this.onpress = function(element, handler) {

        $(element).tclick(handler);
    };

    this.init = function init() {

        app.log.info("Initializing pointer...");

        (function ($) {
            $.fn.tclick = function (onclick) {

                this.bind("touchstart", function (e) { 
                    onclick.call(this, e); 
                    e.stopPropagation(); 
                    e.preventDefault(); 
                });

                this.bind("click", function (e) { 
                onclick.call(this, e);  //substitute mousedown event for exact same result as touchstart         
                });   

                return this;
            };
        })(jQuery);

        app.log.info("Pointer initialization done.");
    }

})();