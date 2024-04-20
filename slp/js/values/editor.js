import App from "../app.js";
import TemplateManager from "../templateManager.js";

class Editor {

    value = null;
    callback = null;
    dom = null;

    constructor(value, callback) {

        this.value = value;
        this.callback = callback;
    }

    async initUi() {

        const dom = TemplateManager.getDom(Editor.template, this);
        
        const uiValueEditor = dom.querySelector(".uiValueEditor");
        const uiContent = dom.querySelector(".uiContent");
        const uiCloseButton = dom.querySelector(".uiCloseButton");

        uiContent.append(this.value.editDom());

        this.dom = uiValueEditor;

        App.dom.append(...dom.childNodes);

        uiCloseButton.addEventListener("mousedown", this.onClose.bind(this));
        uiCloseButton.addEventListener("touchstart", this.onClose.bind(this));

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

        if (this.dom) {

            this.dom.remove();
            this.dom = null;
        }
    }
}

Editor.template = await TemplateManager.getTemplate("valueEditor");

export default Editor;