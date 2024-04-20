import TemplateManager from "../templateManager.js";
import Node from "./node.js";
import ValueText from "../values/text.js";
import ConnectorSocket from "./connectorSocket.js";

class NodeTextFormat extends Node {

    constructor(name, type) {

        super(name, type ?? "TextFormat");

        this.sockets.input.push(new ConnectorSocket(this, "input", this.sockets.input.length, "text"));
        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "text"));

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

        return this.saveResult( new ValueText(
            `${this.properties.pre}${text}${this.properties.post}`,
            this
        ));
    }
}
    
NodeTextFormat.template = await TemplateManager.getTemplate("nodeTextFormat");

export default NodeTextFormat;