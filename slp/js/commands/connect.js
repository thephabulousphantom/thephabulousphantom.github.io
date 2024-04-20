import Command from "./command.js";
import Node from "../nodes/node.js";
import ConnectorManager from "../connectors/manager.js";
import ValueError from "../values/error.js";
import ValueText from "../values/text.js";

class CommandConnect extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const from = this.parameters[0];
        const nodeFrom = Node.lookupId[from] ?? Node.lookupName[from];
        if (!nodeFrom) {

            return new ValueError(`Invalid source node ${from}. Please specify either a valid node id or a valid node name.`);
        }

        const to = this.parameters[1];
        const nodeTo = Node.lookupId[to] ?? Node.lookupName[to];
        if (!nodeTo) {

            return new ValueError(`Invalid destination node ${to}. Please specify either a valid node id or a valid node name.`);
        }

        const type = this.parameters[2];

        const connector = ConnectorManager.add(nodeFrom, nodeTo, type);

        return new ValueText(`Connected output of ${nodeFrom.properties.name} to input of ${nodeTo.properties.name}.`);
    }
}

export default CommandConnect;