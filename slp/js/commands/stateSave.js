import Command from "./command.js";
import Agent from "../agents/agent.js";
import App from "../app.js";
import ResultText from "../results/text.js";

class CommandStateSave extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.saveState();
        
        return new ResultText(`${Object.getOwnPropertyNames(Agent.lookupId).length} agents saved.`);
    }
}

export default CommandStateSave;