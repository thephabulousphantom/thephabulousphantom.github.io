import Result from "./result.js"

class ResultError extends Result {

    constructor(error, source) {

        super("error", source);

        if (typeof error === 'string' || error instanceof String) {

            this.value.text = error;
        }
        else if (error instanceof Error) {

            this.value.exception = error;
        }
        else {

            this.value.object = error;
        }
    }

    toString() {

        if (this.value.text !== undefined) {

            return this.value.text;
        }
        else if (this.value.exception !== undefined) {

            return this.value.exception.message;
        }
        else {

            return JSON.toString(this.value.object);
        }
    }
}

export default ResultError;