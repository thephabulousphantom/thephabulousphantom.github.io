import Console from "./console.js";
import CommandFactory from "./commands/factory.js";
import Node from "./nodes/node.js";
import NodeOpenAi from "./nodes/openAi.js";
import NodeOpenAiChat from "./nodes/openAiChat.js";
import DataManager from "./dataManager.js";
import ConnectorManager from "./connectors/manager.js";
import ResultError from "./results/error.js";
import Connector from "./connectors/connector.js";
import NodeTextFormat from "./nodes/textFormat.js";
import NodeDall_e from "./nodes/dall-e.js";

class App {

    pointer = {
        x: 0,
        y: 0
    }

    commandHistory = [];
    dom = null;
    svg = null;

    defaults = {
        openAiModel: "gpt-3.5-turbo-instruct",
        openAiChatModel: "gpt-3.5-turbo",
        dall_eModel: "dall-e-3",
        dall_eSize: "1024x1024",
        maxTokens: 2048,
        key: ""
    };

    size = {
        zoom: null,
        padding: null,
    };

    _sizeHelpers = { zoom: null, padding: null };

    async loadDefaults() {

        this.defaults = {
            openAiModel: await DataManager.get("defaults.openAiModel", "gpt-3.5-turbo-instruct"),
            openAiChatModel: await DataManager.get("defaults.openAiChatModel", "gpt-3.5-turbo"),
            dall_eModel: await DataManager.get("defaults.dall_eModel", "dall-e-3"),
            dall_eSize: await DataManager.get("defaults.dall_eSize", "1024x1024"),
            maxTokens: await DataManager.get("defaults.maxTokens", "2048"),
            key: await DataManager.get("defaults.key", "")
        };
    }

    constructor() {

        Console.write(null, "Application started, ready for your input.");

        DataManager.get(`app.zoom`, 3)
            .then((zoom) => {

                document.documentElement.style.setProperty("--appZoom", `${zoom}vmin`);
                DataManager.set(`app.zoom`, zoom);
            });

        this.dom = document.querySelector("#appContainer");
        this.dom.addEventListener("mousemove", this.onPointerMove.bind(this));
        this.dom.addEventListener("touchstart", this.onPointerMove.bind(this));
        this.dom.addEventListener("touchmove", this.onPointerMove.bind(this));
        this.dom.addEventListener("touchend", this.onPointerMove.bind(this));

        this.svg = document.querySelector("#appVectorContainer");

        this._sizeHelpers.zoom = document.querySelector("#zoomSizeHelper");
        this._sizeHelpers.padding = document.querySelector("#paddingSizeHelper");

        window.requestAnimationFrame(this.onUpdateFrame.bind(this));
    }

    async saveState() {

        await DataManager.set(`node.ids`, Object.getOwnPropertyNames(Node.lookupId));

        for (const id in Node.lookupId) {

            const node = Node.lookupId[id];
            await node.saveState();
        }

        await DataManager.set(`connector.ids`, Object.getOwnPropertyNames(Connector.lookupId));

        for (const connector of ConnectorManager.connectors) {

            await connector.saveState();
        }
    }

    async loadState() {

        const nodes = document.querySelectorAll(".uiNode");
        for (const node of nodes) {

            node.remove();
        }

        const connectorVectors = document.querySelectorAll(".uiConnector, .uiSocket");
        for (const uiConnector of connectorVectors) {

            uiConnector.remove();
        }

        const agentConstructors = {
            "OpenAi": NodeOpenAi,
            "OpenAiChat": NodeOpenAiChat,
            "TextFormat": NodeTextFormat,
            "Dall-e": NodeDall_e
        };

        Node.nextId = 0;

        const ids = await DataManager.get(`node.ids`);

        var nodesLoaded = [];

        for (const id of ids) {

            const type = await DataManager.get(`node.${id}.type`);
            const name = await DataManager.get(`node.${id}.name`);

            if (agentConstructors[type]) {

                var node = new agentConstructors[type](name);
                node.id = id;
                await node.loadState();

                nodesLoaded.push(node);
                if (Node.nextId <= id) {

                    Node.nextId = id + 1;
                }
            }
        }

        Node.lookupId = {};
        Node.lookupName = {};

        for (const node of nodesLoaded) {

            Node.lookupId[node.properties.id] = node;
            Node.lookupName[node.properties.name] = node;
        }

        Connector.nextId = 0;
        ConnectorManager.connectors.length = 0;
        const connectorIds = await DataManager.get(`connector.ids`);
        const connectorsLoaded = [];
        for (const connectorId of connectorIds) {

            const connector = await ConnectorManager.addFromState(connectorId);
            connectorsLoaded.push(connector);
            if (Connector.nextId <= connectorId) {

                Connector.nextId = connectorId + 1;
            }
        }

        Connector.lookupId = {};
        for (const connector of connectorsLoaded) {

            Connector.lookupId[connector.id] = connector;
        }
    }

    onPointerMove(evt) {

        this.pointer.x = evt.touches && evt.touches.length ? evt.touches[0].clientX : evt.clientX;
        this.pointer.y = evt.touches && evt.touches.length ? evt.touches[0].clientY : evt.clientY;
    }

    onUpdateFrame() {

        window.requestAnimationFrame(this.onUpdateFrame.bind(this));

        this.size.zoom = this._sizeHelpers.zoom.getClientRects()[0].width;
        this.size.padding = this.size.zoom / this._sizeHelpers.padding.getClientRects()[0].width;

        Node.updateUiFrame();
        ConnectorManager.updateUiFrame();
    }

    async processCommand(commandLine, saveInHistory) {

        Console.write(commandLine, "< ");

        var response = null;

        try {

            const command = await CommandFactory.get(commandLine);
            response = await command.execute();
        }
        catch (ex) {

            response = new ResultError(ex);
        }

        if (response !== undefined && response.toString().length > 0) {
                
            Console.write(
                response.toString(),
                response.value.type == "error"
                    ? "! "
                    : "> "
                );

            ConnectorManager.onResult(response);
        }

        if (saveInHistory) {

            this.commandHistory.push({
                command: commandLine,
                response: response
            });
        }
    }
}

// handlebars select helper - for selecting an option in select element
window.Handlebars.registerHelper('select', function(selected, options) {
    return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
});

const app = new App();

export default app;

await app.loadDefaults();

await app.processCommand("new textformat, input, \"write a funny scenario for a comic book panel containing 6 frames. the scenario should tell the following story. \"");
await app.processCommand("new openai, screenwriter");
await app.processCommand("connect input, screenwriter");

await app.processCommand("new textformat, daliInstructions, \"create great looking and detailed comic-book panel consisting of 6 frames. Make sure to follow the scenario so that frames in the picture closely follow frame descriptions in the scenario. Frames should be ordered left to right, top to bottom. Also make sure that text shown on each frame matches with scenario and is readable. What follows is the scenario.\"");
await app.processCommand("connect screenwriter, daliInstructions");

await app.processCommand("new dall-e, dali");
await app.processCommand("connect daliInstructions, dali");
