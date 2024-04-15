import Command from "./command.js";
import Agent from "../agents/agent.js";
import App from "../app.js";
import ResultText from "../results/text.js";

class CommandStateLoad extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.loadState();

        return new ResultText(`${Object.getOwnPropertyNames(Agent.lookupId).length} agents loaded.`);
    }
}

export default CommandStateLoad;