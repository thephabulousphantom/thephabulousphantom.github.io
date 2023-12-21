export default class Log {


    
    static Severity = {
        debug: 0,
        info: 1,
        warning: 2,
        error: 3
    }



    static log(severity, message) {

        if (severity < Log.Level) {

            return;
        }

        switch (severity) {

            case Log.Severity.debug:
                console.debug(message);
                break;

            case Log.Severity.info:
                console.log(message);
                break;

            case Log.Severity.warning:
                console.warn(message);
                break;

            case Log.Severity.error:
                console.error(message);
                break;
        }
    }

    static debug(message) {

        Log.log(Log.Severity.debug, message);
    }

    static info(message) {

        Log.log(Log.Severity.info, message);
    }

    static warning(message) {

        Log.log(Log.Severity.warning, message);
    }

    static error(message) {

        Log.log(Log.Severity.error, message);
    }
}
