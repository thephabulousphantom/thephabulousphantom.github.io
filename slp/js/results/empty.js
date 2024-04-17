import Result from "./result.js";
import TemplateManager from "../templateManager.js";

class ResultEmpty extends Result {

    constructor(source) {

        super("empty", source);
    }

    toString() {

        return "";
    }

    preview() {

        return TemplateManager.getDom(ResultEmpty.template, this);
    }
}

ResultEmpty.template = await TemplateManager.getTemplate("resultEmpty");

export default ResultEmpty;