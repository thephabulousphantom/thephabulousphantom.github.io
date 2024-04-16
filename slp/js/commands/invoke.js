import Command from "./command.js";
import Node from "../nodes/node.js";
import ResultError from "../results/error.js";

class CommandInvoke extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const nodeRef = this.parameters[0];
        const node = Node.lookupId[nodeRef] ?? Node.lookupName[nodeRef];

        if (!node) {

            return new ResultError(`Unable to invoke node ${nodeRef} - id or name not found. Please use either a valid node id or a valid node name.`);
        }

        const prompt = this.parameters[1];

        return await node.invoke(prompt);
    }
}

export default CommandInvoke;