import Command from "./command.js";
import Node from "../nodes/node.js";
import ResultError from "../results/error.js";

class CommandInvoke extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const agentRef = this.parameters[0];
        const agent = Node.lookupId[agentRef] ?? Node.lookupName[agentRef];

        if (!agent) {

            return new ResultError(`Unable to invoke agent ${agentRef} - id or name not found. Please use either a valid agent id or a valid agent name.`);
        }

        const prompt = this.parameters[1];

        return await agent.invoke(prompt);
    }
}

export default CommandInvoke;