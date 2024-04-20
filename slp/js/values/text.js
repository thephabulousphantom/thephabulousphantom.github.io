import Value from "./value.js";
import TemplateManager from "../templateManager.js";

class ValueText extends Value {

    constructor(text, source) {

        super("text", source);

        this.value.text = text;
    }

    toString() {

        return this.value.text;
    }

    preview() {

        return TemplateManager.getDom(ValueText.templateView, this);
    }
}

ValueText.templateView = await TemplateManager.getTemplate("valueViewText");

export default ValueText;