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
        var node = Node.lookupId[nodeRef] ?? Node.lookupName[nodeRef];

        if (node) {

            if (node.toggle()) {

                return new ValueText(`Node ${nodeRef} restored.`);
            }
            else {

                return new ValueText(`Node ${nodeRef} minimised.`);
            }
        }

        for (const id in Node.lookupId) {

            node = Node.lookupId[id];
            node.toggle();
        }

        return new ValueText(`Toggled ${Object.keys(Node.lookupId).length} nodes.`);
    }
}

export default CommandToggle;