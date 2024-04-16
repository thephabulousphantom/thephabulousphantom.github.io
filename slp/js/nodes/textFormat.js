import TemplateManager from "../templateManager.js";
import Node from "./node.js";
import ResultText from "../results/text.js";

class NodeTextFormat extends Node {

    constructor(name, type) {

        super(name, type ?? "TextFormat");

        this.properties.pre = "";
        this.properties.post = "";
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeTextFormat.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("pre");
        this.bindUiElement("post");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async invoke(text) {

        return new ResultText(
            `${this.properties.pre}${text}${this.properties.post}`,
            this
        );
    }
}
    
NodeTextFormat.template = await TemplateManager.getTemplate("nodeTextFormat");

export default NodeTextFormat;