import Console from "./console.js";
import CommandFactory from "./commands/factory.js";
import Agent from "./agents/agent.js";
import AgentOpenAi from "./agents/openAi.js";
import AgentOpenAiChat from "./agents/openAiChat.js";
import DataManager from "./dataManager.js";

class App {

    pointer = {
        x: 0,
        y: 0
    }

    constructor() {

        Console.write("Application started.");

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

        window.requestAnimationFrame(this.onUpdateFrame.bind(this));
    }

    async saveState() {

        await DataManager.set(`agent.ids`, Object.getOwnPropertyNames(Agent.lookupId));

        for (var id in Agent.lookupId) {

            const agent = Agent.lookupId[id];
            await agent.saveState();
        }
    }

    async loadState() {

        const agentNodes = document.querySelectorAll(".uiAgentNode");
        for (const agentNode of agentNodes) {

            agentNode.remove();
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
    }

    onPointerMove(evt) {

        this.pointer.x = evt.touches && evt.touches.length ? evt.touches[0].clientX : evt.clientX;
        this.pointer.y = evt.touches && evt.touches.length ? evt.touches[0].clientY : evt.clientY;
    }

    onUpdateFrame() {

        window.requestAnimationFrame(this.onUpdateFrame.bind(this));

        Agent.updateUiFrame();
    }

    async processCommand(commandLine) {

        Console.write(`< ${commandLine}`);

        try {

            const command = await CommandFactory.get(commandLine);
            const response = await command.execute();
    
            if (response !== undefined) {
    
                Console.write(`> ${response}`);
            }
        }
        catch (ex) {

            Console.write(`An error ocurred: ${ex.message}`);
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

app.processCommand("agentnew(openai,instruct)");
app.processCommand("agentnew(openaichat,chat,,,pretend that you are an actual living and breathing silly 5 year old kid)");

export default app;