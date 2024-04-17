import Command from "./command.js";
import Console from "../console.js";
import NodeOpenAi from "../nodes/openAi.js";
import NodeOpenAiChat from "../nodes/openAiChat.js";
import NodeTextFormat from "../nodes/textFormat.js";
import NodeDall_e from "../nodes/dall-e.js";
import ResultError from "../results/error.js";
import ResultText from "../results/text.js";

class CommandNew extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const type = this.parameters[0];
        const name = this.parameters[1];

        switch (type.toLowerCase()) {
            case "openai":
                {
                    Console.write(`Constructing OpenAI instruct node ${name}...`);
                    const node = new NodeOpenAi(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        node.properties.key = openAiKey;
                    }

                    const openAiModel = this.parameters[3];
                    if (openAiModel) {

                        node.properties.model = openAiModel;
                    }
                }

                return new ResultText(`OpenAI instruct node ${name} constructed.`);

            case "openaichat":
                {
                    Console.write(`Constructing OpenAI chat node ${name}...`);
                    const node = new NodeOpenAiChat(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        node.properties.key = openAiKey;
                    }

                    const openAiModel = this.parameters[3];
                    if (openAiModel) {

                        node.properties.model = openAiModel;
                    }

                    const openAiSystem = this.parameters[4];
                    if (openAiSystem) {

                        node.properties.system = openAiSystem;
                    }

                }

                return new ResultText(`OpenAI chat node ${name} constructed.`);

            case "dall-e":
                {
                    Console.write(`Constructing Dall-e node ${name}...`);
                    const node = new NodeDall_e(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        node.properties.key = openAiKey;
                    }

                    const openAiModel = this.parameters[3];
                    if (openAiModel) {

                        node.properties.model = openAiModel;
                    }

                    const dall_eSize = this.parameters[4];
                    if (dall_eSize) {

                        node.properties.size = dall_eSize;
                    }
                }

                return new ResultText(`Dall-e node ${name} constructed.`);

            case "textformat":
                {
                    Console.write(`Constructing TextFormat node ${name}...`);
                    const node = new NodeTextFormat(name);

                    const pre = this.parameters[2];
                    if (pre) {

                        node.properties.pre = pre;
                    }

                    const post = this.parameters[3];
                    if (post) {

                        node.properties.post = post;
                    }
                }

                return new ResultText(`TextFormat node ${name} constructed.`);
                break;

            default:
                return new ResultError(`Unsupported node type: ${type}`);
        }
    }
}

export default CommandNew;