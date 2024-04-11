import Command from "./command.js";
import Agent from "../agents/agent.js";

class CommandAgentInvoke extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const idOrName = this.parameters[0];
        const prompt = this.parameters[1];

        const agent = Agent.lookupId[idOrName]
            ? Agent.lookupId[idOrName]
            : Agent.lookupName[idOrName];

        if (!agent) {

            throw new Error(`Unable to invoke agent ${idOrName} - id or name not found. Please use either a valid agent id or a valid agent name.`);
        }

        return await agent.invoke(prompt);
    }
}

export default CommandAgentInvoke;