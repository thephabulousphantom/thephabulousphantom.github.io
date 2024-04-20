import App from "../app.js";
import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import ConnectorManager from "../connectors/manager.js";
import ValueEmpty from "../values/empty.js"
import ValueError from "../values/error.js"
import ValueText from "../values/text.js"
import ConnectorSocket from "./connectorSocket.js";
import ValueViewer from "../values/viewer.js";
import ValueEditor from "../values/editor.js";

class Node {

    properties = {

        id: Node.nextId++,
        type: null,
        name: null,
        minimised: false
    }

    dom = undefined;
    svg = undefined;
    results = [];
    sockets = {
        input: [],
        output: []
    };

    constructor(name, type) {

        this.properties.name = name;
        this.properties.type = type;

        Node.lookupId[this.properties.id] = this;
        Node.lookupName[this.properties.name] = this;

        this.sockets.output.push(new ConnectorSocket(this, "output", this.sockets.output.length, "error"));
    }

    async saveState() {

        for (const propertyName in this.properties) {

            if (propertyName.charAt(0) == '_') {

                continue;
            }

            await DataManager.set(`node.${this.properties.id}.${propertyName}`, this.properties[propertyName]);
        }
    }

    async loadState() {

        const savedType = await DataManager.get(`node.${this.properties.id}.type`);
        if (savedType != this.properties.type) {

            throw new Error(`Stored node ${this.properties.id} is of incompatible type ${savedType}. Needs to be of ${this.properties.type} type in order to be loaded.`);
        }

        for (const propertyName in this.properties) {

            if (propertyName.charAt(0) == '_') {

                continue;
            }

            this.properties[propertyName] = await DataManager.get(`node.${this.properties.id}.${propertyName}`, this.properties[propertyName]);
        }
    }

    lastResult() {

        return this.results.length
            ? this.results[this.results.length - 1]
            : new ValueEmpty();
    }

    lastResultText() {

        return (
            this.results.length
                ? this.results[this.results.length - 1]
                : new ValueEmpty()
        ).toString();
    }

    saveResult(result) {

        this.results.push(result);
        this.dom.querySelector(".nodeLastResult").innerText = result.toString();

        return result;
    }

    async invoke(prompt) {

        return new ValueError(
            new Error(`Unable to respond to prompt: "${prompt}". Base node shouldn't be directly prompted. Use derived classes instead.`),
            this
        );
    }
    
    bindUiElement(propertyName) {

        this.getPropertyUi(propertyName).onchange = (function(evt) {

            if (propertyName == "name") {

                this.updateName(evt.target.value);
            }
            else {

                this.properties[propertyName] = evt.target.value == "" ? null : evt.target.value;
            }

        }).bind(this);
    }

    getPropertyUi(propertyName) {

        return this.dom.querySelector(`[data-property="${propertyName}"]`);
    }

    async initUi() {

        const dom = TemplateManager.getDom(Node.template, this.properties);
        this.dom = dom.querySelector(".uiNode");
        this.nodeSizeToggle = this.dom.querySelector(".nodeSizeToggle");
        this.nodeSizeToggle.addEventListener("click", this.onSizeToggle.bind(this));

        App.dom.append(...dom.childNodes);

        if (this.properties.minimised) {

            this.dom.classList.add("uiMinimised");
        }

        this.bindUiElement("name");

        const title = this.dom.querySelector(".nodeTitle");
        title.addEventListener("mousedown", this.onTitlePointerDown.bind(this));
        title.addEventListener("touchstart", this.onTitlePointerDown.bind(this));
        title.addEventListener("mouseup", this.onTitlePointerUp.bind(this));
        title.addEventListener("touchend", this.onTitlePointerUp.bind(this));

        const resultLabel = this.dom.querySelector(".nodeResultLabel");
        resultLabel.addEventListener("mousedown", this.onViewResult.bind(this));
        resultLabel.addEventListener("touchstart", this.onViewResult.bind(this));

        const nameInput = this.dom.querySelector(".nodeNameInput");
        nameInput.addEventListener("mousedown", this.onEditName.bind(this));
        nameInput.addEventListener("touchstart", this.onEditName.bind(this));
    }

    removeUi() {

        this.dom.remove();
    }

    remove() {

        ConnectorManager.removeFromNode(this.properties.id);
        for (const connectorSocket of this.sockets.input) {

            connectorSocket.removeUi();
        }
        this.sockets.input.length = 0;
        for (const connectorSocket of this.sockets.output) {

            connectorSocket.removeUi();
        }
        this.sockets.output.length = 0;
        this.removeUi();
        delete Node.lookupName[this.properties.name];
        delete Node.lookupId[this.properties.id];
    }

    toggle() {

        this.properties.minimised = !this.properties.minimised;

        if (this.dom) {

            this.dom.querySelector(".nodeTitleName").innerText = this.properties.name;

            if (this.dom.classList.contains("uiMinimised") && !this.properties.minimised) {
    
                this.dom.classList.remove("uiMinimised");
            }
            else if (!this.dom.classList.contains("uiMinimised") && this.properties.minimised) {
                
                this.dom.classList.add("uiMinimised");
            }
        }
        
        return !this._minimised;
    }

    onViewResult() {

        const valueViewer = new ValueViewer(this.lastResult());
        valueViewer.initUi();
    }

    onEditName() {

        const nameValue = new ValueText(this.properties.name);
        const valueEditor = new ValueEditor(nameValue, this.updateName.bind(this));
        valueEditor.initUi();
    }

    updateName(name) {

        delete Node.lookupName[this.properties.name];
        this.properties.name = name;
        Node.lookupName[this.properties.name] = this;
        this.dom.querySelector(`[data-property="name"]`).value = name;
    }

    onSizeToggle(evt) {

        this.toggle();
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

    highlight(highlight) {

        if (highlight && !this.dom.classList.contains("uiHighlight")) {

            this.dom.classList.add("uiHighlight");
        }
        else if (!highlight && this.dom.classList.contains("uiHighlight")) {

            this.dom.classList.remove("uiHighlight");
        }
    }

    updateUiFrame() {

        if (this.dragging) {

            this.dom.style.left = `${this.dragging.startUiPosition.x + App.pointer.x - this.dragging.startPointerPosition.x}px`;
            this.dom.style.top = `${this.dragging.startUiPosition.y + App.pointer.y - this.dragging.startPointerPosition.y}px`;
        }

        for (const socketConnector of this.sockets.input) {

            socketConnector.updateUiFrame();
        }

        for (const socketConnector of this.sockets.output) {

            socketConnector.updateUiFrame();
        }
    }
}

Node.nextId = 0;
Node.lookupId = {};
Node.lookupName = {};
Node.template = await TemplateManager.getTemplate("node");

Node.updateUiFrame = function() {

    for (var id in Node.lookupId) {

        const node = Node.lookupId[id];

        if (node.dom === undefined) {

            node.dom = false;
            node.initUi();
        }
        else if (node.dom) {

            if (!document.body.contains(node.dom)) {

                delete node.dom;
            }
            else {

                node.updateUiFrame();
            }
        }
    }
}

export default Node;