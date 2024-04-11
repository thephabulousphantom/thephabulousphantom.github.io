import App from "../app.js";
import Console from "../console.js";
import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";

class Agent {

    id = Agent.nextId++;
    type = null;
    name = null;
    dom = undefined;

    constructor(name, type) {

        this.name = name;
        this.type = type;

        Agent.lookupId[this.id] = this;
        Agent.lookupName[this.name] = this;
    }

    async saveState() {

        await DataManager.set(`agent.${this.id}.name`, this.name);
        await DataManager.set(`agent.${this.id}.type`, this.type);
    }

    async loadState() {

        const savedType = await DataManager.get(`agent.${this.id}.type`);
        if (savedType != this.type) {

            throw new Error(`Stored agent ${this.id} is of incompatible type ${savedType}. Needs to be of ${this.type} type in order to be loaded.`);
        }

        this.name = await DataManager.get(`agent.${this.id}.name`, this.name);
    }

    async invoke(prompt) {

        throw new Error(`Unable to respond to prompt: "${prompt}". Base agent shouldn't be directly prompted. Use derived classes instead.`);
    }
    
    bindUiElement(propertyName) {

        this.dom.querySelector(`[data-property="${propertyName}"]`).onchange = (function(evt) {

            this[propertyName] = evt.target.value;

        }).bind(this);
    }

    async initUi() {

        const dom = TemplateManager.getDom(Agent.template, this);
        this.dom = dom.querySelector(".uiAgentNode");

        App.dom.append(...dom.childNodes);

        this.bindUiElement("name");

        const title = this.dom.querySelector(".nodeTitle");
        title.addEventListener("mousedown", this.onTitleMouseDown.bind(this));
        title.addEventListener("mouseup", this.onTitleMouseUp.bind(this));
    }

    onTitleMouseDown(evt) {

        const title = this.dom.querySelector(".nodeTitle");
        
        this.dragging = {

            active: true,
            startPosition: {
                x: this.dom.getBoundingClientRect().left,
                y: this.dom.getBoundingClientRect().top
            },
            startMousePosition: {
                x: App.mouse.x,
                y: App.mouse.y
            }
        };

        if (!evt) evt = window.event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();        
    }

    onTitleMouseUp(evt) {

        delete this.dragging;
    }

    updateUiFrame() {

        if (this.dragging && this.dragging.active) {

            this.dom.style.left = `${this.dragging.startPosition.x + App.mouse.x - this.dragging.startMousePosition.x}px`;
            this.dom.style.top = `${this.dragging.startPosition.y + App.mouse.y - this.dragging.startMousePosition.y}px`;
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

            agent.updateUiFrame();
        }
    }
}

export default Agent;