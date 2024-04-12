import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import AgentOpenAi from "./openAi.js";

class AgentOpenAiChat extends AgentOpenAi {

    constructor(name, type) {

        super(name, type ?? "OpenAiChat");

        this.properties.model = AgentOpenAiChat.defaultModel;
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
        
        const dom = TemplateManager.getDom(AgentOpenAiChat.template, this.properties);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("system");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    /*async saveState() {

        await super.saveState();

        await DataManager.set(`agent.${this.properties.id}.openAiChat.system`, this.properties.system);
    }

    async loadState() {

        await super.loadState();
        
        this.properties.system = await DataManager.get(`agent.${this.properties.id}.openAiChat.system`, this.properties.system);
    }*/

    async invoke(prompt) {

        const messages = [];
        if (this.system) {

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

            return data.error.message;
        }

        return data.choices[0].message.content.trim();
    }
}
    
AgentOpenAiChat.defaultModel = "gpt-3.5-turbo";
AgentOpenAiChat.template = await TemplateManager.getTemplate("agentNodeOpenAiChat");

export default AgentOpenAiChat;