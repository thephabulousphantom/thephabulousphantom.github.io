import Result from "./result.js";
import TemplateManager from "../templateManager.js";

class ResultImage extends Result {

    constructor(urlOrData, source) {

        super("image", source);

        this.value.image = urlOrData;
    }

    toString() {

        return this.value.image;
    }

    toUrl() {

        return this.value.image;
    }

    preview() {

        return TemplateManager.getDom(ResultImage.template, this);
    }
}

ResultImage.template = await TemplateManager.getTemplate("resultImage");

export default ResultImage;