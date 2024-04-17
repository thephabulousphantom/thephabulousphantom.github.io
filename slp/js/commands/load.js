import Command from "./command.js";
import Node from "../nodes/node.js";
import Connector from "../connectors/connector.js";
import App from "../app.js";
import ResultText from "../results/text.js";

class CommandLoad extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        await App.loadState();

        return new ResultText(`${Object.getOwnPropertyNames(Node.lookupId).length} node(s) with ${Object.getOwnPropertyNames(Connector.lookupId).length} connection(s) loaded.`);
    }
}

export default CommandLoad;