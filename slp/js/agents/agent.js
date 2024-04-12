import App from "../app.js";
import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";

class Agent {

    properties = {

        id: Agent.nextId++,
        type: null,
        name: null
    }

    dom = undefined;

    constructor(name, type) {

        this.properties.name = name;
        this.properties.type = type;

        Agent.lookupId[this.properties.id] = this;
        Agent.lookupName[this.properties.name] = this;
    }

    async saveState() {

        for (const propertyName in this.properties) {

            if (propertyName.charAt(0) == '_') {

                continue;
            }

            await DataManager.set(`agent.${this.properties.id}.${propertyName}`, this.properties[propertyName]);
        }
    }

    async loadState() {

        const savedType = await DataManager.get(`agent.${this.properties.id}.type`);
        if (savedType != this.properties.type) {

            throw new Error(`Stored agent ${this.properties.id} is of incompatible type ${savedType}. Needs to be of ${this.properties.type} type in order to be loaded.`);
        }

        for (const propertyName in this.properties) {

            if (propertyName.charAt(0) == '_') {

                continue;
            }

            this.properties[propertyName] = await DataManager.get(`agent.${this.properties.id}.${propertyName}`, this.properties[propertyName]);
        }
    }

    async invoke(prompt) {

        throw new Error(`Unable to respond to prompt: "${prompt}". Base agent shouldn't be directly prompted. Use derived classes instead.`);
    }
    
    bindUiElement(propertyName) {

        this.dom.querySelector(`[data-property="${propertyName}"]`).onchange = (function(evt) {

            this.properties[propertyName] = evt.target.value;

        }).bind(this);
    }

    async initUi() {

        const dom = TemplateManager.getDom(Agent.template, this.properties);
        this.dom = dom.querySelector(".uiAgentNode");

        App.dom.append(...dom.childNodes);

        this.bindUiElement("name");

        const title = this.dom.querySelector(".nodeTitle");
        title.addEventListener("mousedown", this.onTitlePointerDown.bind(this));
        title.addEventListener("touchstart", this.onTitlePointerDown.bind(this));
        title.addEventListener("mouseup", this.onTitlePointerUp.bind(this));
        title.addEventListener("touchend", this.onTitlePointerUp.bind(this));
    }

    onTitlePointerDown(evt) {

        App.pointer.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
        App.pointer.y = evt.touches ? evt.touches[0].clientY : evt.clientY;

        this.dragging = {

            startUiPosition: {
                x: this.dom.getBoundingClientRect().left,
                y: this.dom.getBoundingClientRect().top
            },
            startPointerPosition: {
                x: App.pointer.x,
                y: App.pointer.y
            }
        };

        evt.preventDefault();
    }

    onTitlePointerUp(evt) {

        delete this.dragging;
    }

    updateUiFrame() {

        if (this.dragging) {

            this.dom.style.left = `${this.dragging.startUiPosition.x + App.pointer.x - this.dragging.startPointerPosition.x}px`;
            this.dom.style.top = `${this.dragging.startUiPosition.y + App.pointer.y - this.dragging.startPointerPosition.y}px`;
        }
    }
}

Agent.nextId = 0;
Agent.lookupId = {};
Agent.lookupName = {};
Agent.template = await TemplateManager.getTemplate("agentNode");

Agent.updateUiFrame = function() {

    for (var id in Agent.lookupId) {

        const agent = Agent.lookupId[id];

        if (agent.dom === undefined) {

            agent.dom = false;
            agent.initUi();
        }
        else if (agent.dom) {

            if (!document.body.contains(agent.dom)) {

                delete agent.dom;
            }
            else {

                agent.updateUiFrame();
            }
        }
    }
}

export default Agent;