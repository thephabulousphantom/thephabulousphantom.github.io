import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import AgentOpenAi from "./openAi.js";

class AgentOpenAiChat extends AgentOpenAi {

    system = null;

    constructor(name, type) {

        super(name, type ?? "OpenAiChat");

        this.model = AgentOpenAiChat.defaultModel;
        this.models = [
            "gpt-3.5-turbo",
            "gpt-4",
            "gpt-4-turbo",
            "gpt-4-turbo-preview"
        ];
    }

    async initUi() {

        await super.initUi();
        
        const dom = TemplateManager.getDom(AgentOpenAiChat.template, this);
        this.dom.append(...dom.childNodes);

        this.bindUiElement("system");
    }

    updateUiFrame() {

        super.updateUiFrame();
    }

    async saveState() {

        await super.saveState();

        await DataManager.set(`agent.${this.id}.openAiChat.system`, this.system);
    }

    async loadState() {

        await super.loadState();
        
        this.system = await DataManager.get(`agent.${this.id}.openAiChat.system`, this.system);
    }

    async invoke(prompt) {

        const messages = [];
        if (this.system) {

            messages.push({
                "role": "system",
                "content": this.system
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
                    'Authorization': `Bearer ${ this.key }`
                },
                body: JSON.stringify({
                    model: this.model,
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