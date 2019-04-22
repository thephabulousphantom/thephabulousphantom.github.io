app.log = new (function Log() {

    this.write = function write(severity, message) {

        switch (severity.toLowerCase) {

            case "info": app.log.info(message); break;
            case "warning": app.log.warning(message); break;
            case "error": app.log.error(message); break;
            default: break;
        }
    }

    this.info = function info(message) {

        try {

            console.info(message);
        }
        catch (ex) {

        }
    }

    this.warning = function warning(message) {

        try {

            console.warn(message);
        }
        catch (ex) {

        }
    }

    this.error = function error(message) {

        try {

            console.error(message);
        }
        catch (ex) {

        }
    }
})();