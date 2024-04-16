import Console from "./console.js";
import CommandFactory from "./commands/factory.js";
import Agent from "./agents/agent.js";
import AgentOpenAi from "./agents/openAi.js";
import AgentOpenAiChat from "./agents/openAiChat.js";
import DataManager from "./dataManager.js";
import ConnectorManager from "./connectors/manager.js";
import ResultError from "./results/error.js";
import Connector from "./connectors/connector.js";

class App {

    pointer = {
        x: 0,
        y: 0
    }

    commandHistory = [];
    dom = null;
    svg = null;
    size = {
        zoom: null,
        padding: null,
    };
    _sizeHelpers = { zoom: null, padding: null };

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

        await DataManager.set(`agent.ids`, Object.getOwnPropertyNames(Agent.lookupId));

        for (const id in Agent.lookupId) {

            const agent = Agent.lookupId[id];
            await agent.saveState();
        }

        await DataManager.set(`connector.ids`, Object.getOwnPropertyNames(Connector.lookupId));

        for (const connector of ConnectorManager.connectors) {

            await connector.saveState();
        }
    }

    async loadState() {

        const agentNodes = document.querySelectorAll(".uiAgentNode");
        for (const agentNode of agentNodes) {

            agentNode.remove();
        }

        const connectorVectors = document.querySelectorAll(".uiConnector, .uiSocket");
        for (const uiConnector of connectorVectors) {

            uiConnector.remove();
        }

        const agentConstructors = {
            "OpenAi": AgentOpenAi,
            "OpenAiChat": AgentOpenAiChat
        };

        Agent.nextId = 0;

        const ids = await DataManager.get(`agent.ids`);

        var agentsLoaded = [];

        for (const id of ids) {

            const type = await DataManager.get(`agent.${id}.type`);
            const name = await DataManager.get(`agent.${id}.name`);

            if (agentConstructors[type]) {

                var agent = new agentConstructors[type](name);
                agent.id = id;
                await agent.loadState();

                agentsLoaded.push(agent);
                if (Agent.nextId <= id) {

                    Agent.nextId = id + 1;
                }
            }
        }

        Agent.lookupId = {};
        Agent.lookupName = {};

        for (const agent of agentsLoaded) {

            Agent.lookupId[agent.id] = agent;
            Agent.lookupName[agent.name] = agent;
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

        Agent.updateUiFrame();
        ConnectorManager.updateUiFrame();
    }

    async processCommand(commandLine) {

        Console.write(commandLine, "< ");

        var response = null;

        try {

            const command = await CommandFactory.get(commandLine);
            response = await command.execute();
        }
        catch (ex) {

            response = new ResultError(ex);
        }

        if (response !== undefined) {
                
            Console.write(
                response.toString(),
                response.value.type == "error"
                    ? "! "
                    : "> "
                );

            ConnectorManager.onResult(response);
        }

        this.commandHistory.push({
            command: commandLine,
            response: response
        });
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

await app.processCommand("agentnew openai,robot");
await app.processCommand("agentnew openaichat,kid,,,\"pretend that you are an actual living and breathing, silly 5 year old kid\"");