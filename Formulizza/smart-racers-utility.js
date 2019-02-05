app.utility = new (function Utility() {

    this.protocol = function protocol(value) {

        if (value) {

            window.location.protocol = value;
        }

        return window.location.protocol.toLowerCase();
    }

    this.host = function host() {

        return window.location.hostname.toLowerCase();
    }

    this.verifyProtocol = function verifyProtocol(protocol) {
        
        if (!protocol) {

            protocol = "https:";
        }
        else {

            protocol = ("" + protocol).toLowerCase();
        }

        if (app.utility.protocol() !== protocol
            && app.utility.protocol() != "file:"
            && app.utility.host() != "localhost") {
        
            app.utility.protocol(protocol);
        }
    }

    this.registerServiceWorker = function registerServiceWorker() {

        if ("serviceWorker" in navigator && app.utility.protocol() !== "file:") {

            try {

                navigator.serviceWorker.register("./smart-racers-service-worker.js").then(

                    function(registration) {

                        // Registration was successful
                        app.log.info("ServiceWorker registration successful with scope: ", registration.scope);
                    },

                    function(err) {

                        // registration failed :(
                        app.log.info("ServiceWorker registration failed: ", err);
                    }
                );
            }
            catch (ex) {

                app.log.warn("Couldn't register service worker: " + ex.toString());
            }
        }

        window.addEventListener("beforeinstallprompt", function(e) { 

            try {

                // prompt the user to add the app to the home screen

                app.log.info("Install platforms: " + e.platforms ? JSON.stringify(e.platforms) : "");

                try {

                    e.prompt();
                }
                catch (ex) {

                    app.log.warn("Couldn't prompt user to add to home screen: " + ex.toString());
                }

                // handle user's response
                e.userChoice.then(

                    function(outcome) { 

                        // either "accepted" or "dismissed"
                        console.log(outcome);
                    }, 
                    function (error) {

                        app.log.warn("User didn't want to add to home screen: " + error.toString());
                    }); 
            }
            catch (ex) {

                app.log.warn("Couldn't prompt user to install as app: " + ex.toString());
            }
        });
    }

    this.init = function init() {

        app.log.info("Initializing utilities...");

        //app.utility.verifyProtocol();
        app.utility.registerServiceWorker();

        app.log.info("Utilities initialization done.");
    }

})();