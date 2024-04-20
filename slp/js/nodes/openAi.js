import TemplateManager from "../templateManager.js";
import App from "../app.js";
import Node from "./node.js";
import ValueError from "../values/error.js";
import ValueText from "../values/text.js";
import ConnectorSocket from "./connectorSocket.js";

class NodeOpenAi extends Node {

    constructor(name, type) {

        super(name, type ?? "OpenAi");

        this.sockets.input.push(new ConnectorSocket(this, "input", this.sockets.input.length, "text"));
        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "text"));

        this.properties.key = null;
        this.properties.model = null;
        this.properties.maxTokens = null;
        
        this.properties._models = [null, "gpt-3.5-turbo-instruct"];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeOpenAi.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("key");
        this.bindUiElement("model");
        this.bindUiElement("maxTokens");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async invoke(prompt) {

        const response = await fetch(
            'https://api.openai.com/v1/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ this.properties.key ?? App.defaults.key }`
                },
                body: JSON.stringify({
                    model: this.properties.model ?? App.defaults["openAiModel"],
                    prompt: prompt,
                    max_tokens: (this.properties.maxTokens ?? App.defaults.maxTokens)|0
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

            return this.saveResult( new ValueText(
                data.choices[0].text.trim(),
                this
            ));
        }
    }
}
    
NodeOpenAi.template = await TemplateManager.getTemplate("nodeOpenAi");

export default NodeOpenAi;