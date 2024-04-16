import Command from "./command.js";
import Node from "../nodes/node.js";
import App from "../app.js";
import ResultText from "../results/text.js";

class CommandLoad extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.loadState();

        return new ResultText(`${Object.getOwnPropertyNames(Node.lookupId).length} agents loaded.`);
    }
}

export default CommandLoad;