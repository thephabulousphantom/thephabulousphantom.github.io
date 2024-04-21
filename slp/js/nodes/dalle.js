import TemplateManager from "../templateManager.js";
import Node from "./node.js";
import ConnectorSocket from "./connectorSocket.js";

class NodeDalle extends Node {

    constructor(name, type) {

        super(name, type);

        this.sockets.input.push(new ConnectorSocket(this, "input", this.sockets.input.length, "text"));
        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "image"));

        this.properties.key = null;

        this.properties._sizes = [null];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeDalle.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("key");
        this.bindUiElement("size");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }
}
    
NodeDalle.template = await TemplateManager.getTemplate("nodeDalle");

export default NodeDalle;