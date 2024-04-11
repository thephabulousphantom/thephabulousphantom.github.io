import Command from "./command.js";
import Agent from "../agents/agent.js";
import App from "../app.js";

class CommandStateLoad extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.loadState();

        return `${Object.getOwnPropertyNames(Agent.lookupId).length} agents loaded.`;
    }
}

export default CommandStateLoad;