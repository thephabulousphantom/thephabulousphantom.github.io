import Result from "./result.js";

class ResultEmpty extends Result {

    constructor(source) {

        super("empty", source);
    }

    toString() {

        return "";
    }
}

export default ResultEmpty;