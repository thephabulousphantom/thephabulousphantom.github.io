import Command from "./command.js";
import Console from "../console.js";
import Node from "../nodes/node.js";
import ResultText from "../results/text.js";

class CommandList extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        var count = 0;
        for (var id in Node.lookupId) {

            const agent = Node.lookupId[id];

            Console.write(` - ${agent.properties.type} agent ${agent.properties.id}, name: ${agent.properties.name}`);

            count++;
        }

        return new ResultText(`${count} agents listed.`);
    }
}

export default CommandList;