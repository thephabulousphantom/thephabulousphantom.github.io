import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import Agent from "./agent.js";

class AgentOpenAi extends Agent {

    constructor(name, type) {

        super(name, type ?? "OpenAi");

        this.properties.key = null;
        this.properties.model = AgentOpenAi.defaultModel;
        this.properties._models = ["gpt-3.5-turbo-instruct"];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(AgentOpenAi.template, this.properties);
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

            return data.error.message;
        }

        return data.choices[0].text.trim();
    }
}
    
AgentOpenAi.defaultModel = "gpt-3.5-turbo-instruct";
AgentOpenAi.template = await TemplateManager.getTemplate("agentNodeOpenAi");

export default AgentOpenAi;