import Command from "./command.js";
import Node from "../nodes/node.js";
import ConnectorManager from "../connectors/manager.js";
import ResultError from "../results/error.js";
import ResultText from "../results/text.js";

class CommandConnect extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const from = this.parameters[0];
        const agentFrom = Node.lookupId[from] ?? Node.lookupName[from];
        if (!agentFrom) {

            return new ResultError(`Invalid source agent ${from}. Please specify either a valid agent id or a valid agent name.`);
        }

        const to = this.parameters[1];
        const agentTo = Node.lookupId[to] ?? Node.lookupName[to];
        if (!agentTo) {

            return new ResultError(`Invalid destination agent ${to}. Please specify either a valid agent id or a valid agent name.`);
        }

        const type = this.parameters[2];

        const connector = ConnectorManager.add(agentFrom, agentTo, type);

        return new ResultText(`Connected output of ${agentFrom.properties.name} to input of ${agentTo.properties.name}.`);
    }
}

export default CommandConnect;