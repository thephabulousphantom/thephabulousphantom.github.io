import Command from "./command.js";
import Agent from "../agents/agent.js";
import App from "../app.js";

class CommandStateSave extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.saveState();
        
        return `${Object.getOwnPropertyNames(Agent.lookupId).length} agents saved.`;
    }
}

export default CommandStateSave;