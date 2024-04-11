import Command from "./command.js";
import Console from "../console.js";
import Agent from "../agents/agent.js";

class CommandListAgents extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        var count = 0;
        for (var id in Agent.lookupId) {

            const agent = Agent.lookupId[id];

            Console.write(` - ${agent.type} agent ${agent.id}, name: ${agent.name}`);

            count++;
        }

        return `${count} agents listed.`
    }
}

export default CommandListAgents;