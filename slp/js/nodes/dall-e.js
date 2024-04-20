import TemplateManager from "../templateManager.js";
import App from "../app.js";
import Node from "./node.js";
import ValueError from "../values/error.js";
import ValueImage from "../values/image.js";
import ConnectorSocket from "./connectorSocket.js";

class NodeDall_e extends Node {

    constructor(name, type) {

        super(name, type ?? "Dall-e");

        this.sockets.input.push(new ConnectorSocket(this, "input", this.sockets.input.length, "text"));
        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "image"));

        this.properties.key = null;
        this.properties.model = null;

        this.properties._models = [null, "dall-e-2", "dall-e-3"];
        this.properties._sizes = [null, "256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeDall_e.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("key");
        this.bindUiElement("model");
        this.bindUiElement("size");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async invoke(prompt) {

        const response = await fetch(
            'https://api.openai.com/v1/images/generations',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ this.properties.key ?? App.defaults.key }`
                },
                body: JSON.stringify({
                    model: this.properties.model ?? App.defaults.dall_eModel,
                    prompt: prompt,
                    n: 1,
                    size: this.properties.size ?? App.defaults.dall_eSize
                })
            }
        );

        const data = await response.json();

        if (data.error) {

            return this.saveResult( new ValueError(
                data.error.message,
                this
            ));
        }
        else {

            return this.saveResult( new ValueImage(
                data.data[0].url.trim(),
                this
            ));
        }
    }
}
    
NodeDall_e.template = await TemplateManager.getTemplate("nodeDall-e");

export default NodeDall_e;