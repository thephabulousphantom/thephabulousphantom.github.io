import Result from "./result.js";

class ResultText extends Result {

    constructor(text, source) {

        super("text", source);

        this.value.text = text;
    }

    toString() {

        return this.value.text;
    }
}

export default ResultText;