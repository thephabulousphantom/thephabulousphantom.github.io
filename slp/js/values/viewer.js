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
        const uiContent = dom.querySelector(".uiContent");

        uiContent.append(this.value.preview());

        this.dom = uiValueViewer;

        App.dom.append(...dom.childNodes);

        uiValueViewer.addEventListener("mousedown", this.onClose.bind(this));
        uiValueViewer.addEventListener("touchstart", this.onClose.bind(this));
        uiContent.addEventListener("mousedown", this.onClose.bind(this));
        uiContent.addEventListener("touchstart", this.onClose.bind(this));
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