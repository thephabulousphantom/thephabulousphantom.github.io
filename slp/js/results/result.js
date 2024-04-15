class Result {

    value = {
    }
    source = null;

    constructor(type, source) {

        this.value.type = type;
        this.source = source;
    }

    toString() {

        throw new Error(`Result type ${this.value.type} doesn't implement toString method.`);
    }
}

export default Result;