import App from "../app.js";
import ValueEmpty from "./empty.js";
import TemplateManager from "../templateManager.js";

class Viewer {

    value = null;
    dom = null;
    currentValueIndex = null;

    constructor(value) {

        this.value = value;

        if (this.value instanceof Array) {

            if (this.value.length == 0) {

                this.value = Viewer.emptyValue;
            }
            else {

                this.currentValueIndex = 0;
            }
        }
    }

    getBaseCssSelector() {

        return ".uiValueViewer";
    }

    getTemplate() {

        return Viewer.template;
    }

    getValueDom(value) {

        return value.viewDom();
    }

    async initUi() {

        const dom = TemplateManager.getDom(this.getTemplate(), this);
        
        const uiValueViewer = dom.querySelector(this.getBaseCssSelector());
        const uiCloseButton = dom.querySelector(".uiCloseButton");
        const uiPreviousButton = dom.querySelector(".uiPreviousButton");
        const uiNextButton = dom.querySelector(".uiNextButton");
        const uiContent = dom.querySelector(".uiContent");

        if (this.currentValueIndex === null) {

            uiContent.append(this.getValueDom(this.value));
            uiValueViewer.classList.add("uiSingleValue");
        }
        else {

            uiContent.append(this.getValueDom(this.value[this.currentValueIndex]));
            if (this.value.length == 1) {

                uiValueViewer.classList.add("uiSingleValue");
            }
        }

        this.dom = uiValueViewer;

        App.dom.append(...dom.childNodes);

        uiCloseButton.addEventListener("mousedown", this.onClose.bind(this));
        uiCloseButton.addEventListener("touchstart", this.onClose.bind(this));

        uiPreviousButton.addEventListener("mousedown", this.onPrevious.bind(this));
        uiPreviousButton.addEventListener("touchstart", this.onPrevious.bind(this));

        uiNextButton.addEventListener("mousedown", this.onNext.bind(this));
        uiNextButton.addEventListener("touchstart", this.onNext.bind(this));
    }

    onClose() {

        if (this.dom) {

            this.dom.remove();
            this.dom = null;
        }
    }

    onPrevious() {

        if (this.currentValueIndex === null) {

            return;
        }

        this.currentValueIndex = (this.value.length + this.currentValueIndex - 1) % this.value.length;

        this.dom.remove();
        this.initUi();
    }

    onNext() {

        if (this.currentValueIndex === null) {

            return;
        }

        this.currentValueIndex = (this.currentValueIndex + 1) % this.value.length;

        this.dom.remove();
        this.initUi();
    }
}

Viewer.template = await TemplateManager.getTemplate("valueViewer");
Viewer.emptyValue = new ValueEmpty();

export default Viewer;