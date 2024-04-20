import Command from "./command.js";
import Node from "../nodes/node.js";
import ValueText from "../values/text.js";
import ValueError from "../values/error.js";

class CommandToggle extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const nodeRef = this.parameters[0];
        const node = Node.lookupId[nodeRef] ?? Node.lookupName[nodeRef];
        if (!node) {

            return new ValueError(`Invalid node ${nodeRef}. Please specify either a valid node id or a valid node name.`);
        }

        if (node.toggle()) {

            return new ValueText(`Node ${nodeRef} restored.`);
        }
        else {

            return new ValueText(`Node ${nodeRef} minimised.`);
        }
    }
}

export default CommandToggle;