import App from "../app.js";
import TemplateManager from "../templateManager.js";

class Viewer {

    value = null;
    dom = null;

    constructor(value) {

        this.value = value;
    }

    async initUi() {

        const dom = TemplateManager.getDom(Viewer.template, this);
        
        const uiValueViewer = dom.querySelector(".uiValueViewer");
        const uiCloseButton = dom.querySelector(".uiCloseButton");
        const uiContent = dom.querySelector(".uiContent");

        uiContent.append(this.value.viewDom());

        this.dom = uiValueViewer;

        App.dom.append(...dom.childNodes);

        uiCloseButton.addEventListener("mousedown", this.onClose.bind(this));
        uiCloseButton.addEventListener("touchstart", this.onClose.bind(this));
    }

    onClose() {

        if (this.dom) {

            this.dom.remove();
            this.dom = null;
        }
    }
}

Viewer.template = await TemplateManager.getTemplate("valueViewer");

export default Viewer;