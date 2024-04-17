import Result from "./result.js";
import TemplateManager from "../templateManager.js";

class ResultText extends Result {

    constructor(text, source) {

        super("text", source);

        this.value.text = text;
    }

    toString() {

        return this.value.text;
    }

    preview() {

        return TemplateManager.getDom(ResultText.template, this);
    }
}

ResultText.template = await TemplateManager.getTemplate("resultText");

export default ResultText;