import App from "../app.js";
import ValueEmpty from "./empty.js";
import TemplateManager from "../templateManager.js";
import Viewer from "../values/viewer.js";

class Editor extends Viewer {

    callback = null;

    constructor(value, callback) {

        super(value);

        this.callback = callback;
    }
    
    getBaseCssSelector() {

        return ".uiValueEditor";
    }

    getTemplate() {

        return Editor.template;
    }

    getValueDom(value) {

        return value.editDom();
    }

    async initUi() {

        super.initUi();

        switch (this.value.value.type) {

            case "empty":
            case "error":
            case "image":
                break;

            case "text":
                setTimeout((function() {
                    this.dom.querySelector(".uiEditText").focus();
                }).bind(this), 0);
                break;
        }
    }

    onClose() {

        switch (this.value.value.type) {

            case "empty":
            case "error":
            case "image":
                break;

            case "text":
                if(this.callback && this.dom) {

                    const uiEditText = this.dom.querySelector(".uiEditText");
                    this.callback(uiEditText.value);
                }
                break;
        }

        super.onClose();
    }
}

Editor.template = await TemplateManager.getTemplate("valueEditor");

export default Editor;