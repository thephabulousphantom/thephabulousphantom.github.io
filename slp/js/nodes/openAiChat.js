import TemplateManager from "../templateManager.js";
import NodeOpenAi from "./openAi.js";
import ResultError from "../results/error.js";
import ResultText from "../results/text.js";

class NodeOpenAiChat extends NodeOpenAi {

    constructor(name, type) {

        super(name, type ?? "OpenAiChat");

        this.properties.model = NodeOpenAiChat.defaultModel;
        this.properties.system = null;
        this.properties._models = [
            "gpt-3.5-turbo",
            "gpt-4",
            "gpt-4-turbo",
            "gpt-4-turbo-preview"
        ];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(NodeOpenAiChat.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("system");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async invoke(prompt) {

        const messages = [];
        if (this.properties.system) {

            messages.push({
                "role": "system",
                "content": this.properties.system
            });
        }

        messages.push({
            "role": "user",
            "content": prompt
        });

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ this.properties.key }`
                },
                body: JSON.stringify({
                    model: this.properties.model,
                    "messages": messages,
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
            data.choices[0].message.content.trim(),
            this
        );
    }
}
    
NodeOpenAiChat.defaultModel = "gpt-3.5-turbo";
NodeOpenAiChat.template = await TemplateManager.getTemplate("nodeOpenAiChat");

export default NodeOpenAiChat;