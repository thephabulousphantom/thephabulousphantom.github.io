import App from "../app.js";
import TemplateManager from "../templateManager.js";

class Viewer {

    result = null;
    dom = null;

    constructor(result) {

        this.result = result;
    }

    async initUi() {

        const dom = TemplateManager.getDom(Viewer.template, this);
        
        const uiResultViewer = dom.querySelector(".uiResultViewer");
        const uiContent = dom.querySelector(".uiContent");

        uiContent.append(this.result.preview());

        this.dom = uiResultViewer;

        App.dom.append(...dom.childNodes);

        uiResultViewer.addEventListener("mousedown", this.onClose.bind(this));
        uiResultViewer.addEventListener("touchstart", this.onClose.bind(this));
        uiContent.addEventListener("mousedown", this.onClose.bind(this));
        uiContent.addEventListener("touchstart", this.onClose.bind(this));
    }

    onClose() {

        this.dom.remove();
        this.dom = null;
    }
}

Viewer.template = await TemplateManager.getTemplate("resultViewer");

export default Viewer;