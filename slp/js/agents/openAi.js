import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import Agent from "./agent.js";

class AgentOpenAi extends Agent {

    key = null;
    model = AgentOpenAi.defaultModel;
    models = ["gpt-3.5-turbo-instruct"];

    constructor(name, type) {

        super(name, type ?? "OpenAi");
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(AgentOpenAi.template, this);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("key");
        this.bindUiElement("model");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async saveState() {

        await super.saveState();

        await DataManager.set(`agent.${this.id}.openAi.key`, this.key);
        await DataManager.set(`agent.${this.id}.openAi.model`, this.model);
    }

    async loadState() {

        await super.loadState();
        
        this.key = await DataManager.get(`agent.${this.id}.openAi.key`, this.key);
        this.model = await DataManager.get(`agent.${this.id}.openAi.model`, this.model);
    }

    async invoke(prompt) {

        const response = await fetch(
            'https://api.openai.com/v1/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ this.key }`
                },
                body: JSON.stringify({
                    model: this.model,
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