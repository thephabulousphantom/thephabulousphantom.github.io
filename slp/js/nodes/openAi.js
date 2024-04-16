import TemplateManager from "../templateManager.js";
import Node from "./node.js";
import ResultError from "../results/error.js";
import ResultText from "../results/text.js";

class NodeOpenAi extends Node {

    constructor(name, type) {

        super(name, type ?? "OpenAi");

        this.properties.key = null;
        this.properties.model = NodeOpenAi.defaultModel;
        this.properties._models = ["gpt-3.5-turbo-instruct"];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeOpenAi.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("key");
        this.bindUiElement("model");
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
                    'Authorization': `Bearer ${ this.properties.key }`
                },
                body: JSON.stringify({
                    model: this.properties.model,
                    prompt: prompt,
                    max_tokens: 2048
                })
            }
        );

        const data = await response.json();

        if (data.error) {

            return new ResultError(
                data.error.message,
                this
            );
        }

        return new ResultText(
            data.choices[0].text.trim(),
            this
        );
    }
}
    
NodeOpenAi.defaultModel = "gpt-3.5-turbo-instruct";
NodeOpenAi.template = await TemplateManager.getTemplate("nodeOpenAi");

export default NodeOpenAi;