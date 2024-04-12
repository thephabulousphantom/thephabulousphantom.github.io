import Command from "./command.js";
import Console from "../console.js";
import Agent from "../agents/agent.js";
import ConnectorManager from "../connectors/manager.js";

class CommandConnect extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const from = this.parameters[0];
        const agentFrom = Agent.lookupId[from] ?? Agent.lookupName[from];
        if (!agentFrom) {

            throw new Error(`Invalid source agent ${from}. Please specify either a valid agent id or a valid agent name.`);
        }

        const to = this.parameters[1];
        const agentTo = Agent.lookupId[to] ?? Agent.lookupName[to];
        if (!agentTo) {

            throw new Error(`Invalid destination agent ${to}. Please specify either a valid agent id or a valid agent name.`);
        }

        const connector = ConnectorManager.add(agentFrom, agentTo);

        return `Connected output of ${agentFrom.properties.name} to input of ${agentTo.properties.name}.`;
    }
}

export default CommandConnect;