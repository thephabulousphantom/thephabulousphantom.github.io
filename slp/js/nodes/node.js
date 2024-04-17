import App from "../app.js";
import DataManager from "../dataManager.js";
import TemplateManager from "../templateManager.js";
import ResultEmpty from "../results/empty.js"
import ResultError from "../results/error.js"
import ConnectorSocket from "./connectorSocket.js";
import ResultViewer from "../results/viewer.js";

class Node {

    properties = {

        id: Node.nextId++,
        type: null,
        name: null,
        results: [],
        minimised: false
    }

    dom = undefined;
    svg = undefined;
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

        return this.properties.results.length
            ? this.properties.results[this.properties.results.length - 1]
            : new ResultEmpty();
    }

    lastResultText() {

        return (
            this.properties.results.length
                ? this.properties.results[this.properties.results.length - 1]
                : new ResultEmpty()
        ).toString();
    }

    saveResult(result) {

        this.properties.results.push(result);
        this.dom.querySelector(".nodeLastResult").innerText = result.toString();

        return result;
    }

    async invoke(prompt) {

        return new ResultError(
            new Error(`Unable to respond to prompt: "${prompt}". Base node shouldn't be directly prompted. Use derived classes instead.`),
            this
        );
    }
    
    bindUiElement(propertyName) {

        this.dom.querySelector(`[data-property="${propertyName}"]`).onchange = (function(evt) {

            this.properties[propertyName] = evt.target.value;

        }).bind(this);
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
        resultLabel.addEventListener("mousedown", this.onPreview.bind(this));
        resultLabel.addEventListener("touchstart", this.onPreview.bind(this));
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

    onPreview() {

        const resultViewer = new ResultViewer(this.lastResult());
        resultViewer.initUi();
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