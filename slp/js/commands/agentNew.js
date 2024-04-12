import Command from "./command.js";
import Console from "../console.js";
import AgentOpenAi from "../agents/openAi.js";
import AgentOpenAiChat from "../agents/openAiChat.js";

class CommandNewAgent extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const type = this.parameters[0];
        const name = this.parameters[1];

        switch (type.toLowerCase()) {
            case "openai":
                {
                    Console.write(`Constructing OpenAI instruct agent ${name}...`);
                    const agent = new AgentOpenAi(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        agent.properties.key = openAiKey;
                    }

                    const openAiModel = this.parameters[3];
                    if (openAiModel) {

                        agent.properties.model = openAiModel;
                    }
                }

                return `OpenAI instruct agent ${name} constructed.`;

            case "openaichat":
                {
                    Console.write(`Constructing OpenAI chat agent ${name}...`);
                    const agent = new AgentOpenAiChat(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        agent.properties.key = openAiKey;
                    }

                    const openAiModel = this.parameters[3];
                    if (openAiModel) {

                        agent.properties.model = openAiModel;
                    }

                    const openAiSystem = this.parameters[4];
                    if (openAiSystem) {

                        agent.properties.system = openAiSystem;
                    }

                }

                return `OpenAI chat agent ${name} constructed.`;

            default:
                throw new Error(`Unsupported agent type: ${type}`);
        }
    }
}

export default CommandNewAgent;