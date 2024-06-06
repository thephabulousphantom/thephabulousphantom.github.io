import Command from "./command.js";
import Console from "../console.js";
import NodeOpenAi from "../nodes/openAi.js";
import NodeOpenAiChat from "../nodes/openAiChat.js";
import NodeTextFormat from "../nodes/textFormat.js";
import NodeDalle2 from "../nodes/dalle2.js";
import NodeDalle3 from "../nodes/dalle3.js";
import NodeGoogle from "../nodes/google.js";
import ValueError from "../values/error.js";
import ValueText from "../values/text.js";

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
                    Console.writeVerbose(`Constructing OpenAI instruct node ${name}...`);
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

                return new ValueText(`OpenAI instruct node ${name} constructed.`);

            case "openaichat":
                {
                    Console.writeVerbose(`Constructing OpenAI chat node ${name}...`);
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

                return new ValueText(`OpenAI chat node ${name} constructed.`);

            case "dalle2":
                {
                    Console.writeVerbose(`Constructing Dall-e 2 node ${name}...`);
                    const node = new NodeDalle2(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        node.properties.key = openAiKey;
                    }

                    const dalleSize = this.parameters[4];
                    if (dalleSize) {

                        node.properties.size = dalleSize;
                    }
                }

                return new ValueText(`Dall-e 2 node ${name} constructed.`);

            case "dalle3":
                {
                    Console.writeVerbose(`Constructing Dall-e 3 node ${name}...`);
                    const node = new NodeDalle3(name);

                    const openAiKey = this.parameters[2];
                    if (openAiKey) {

                        node.properties.key = openAiKey;
                    }

                    const dalleSize = this.parameters[3];
                    if (dalleSize) {

                        node.properties.size = dalleSize;
                    }

                    const dalleStyle = this.parameters[4]
                    if (dalleStyle) {

                        node.properties.style = dalleStyle;
                    }

                    const dalleQuality = this.parameters[5];
                    if (dalleQuality) {

                        node.properties.quality = dalleQuality;
                    }
                }

                return new ValueText(`Dall-e 3 node ${name} constructed.`);

            case "textformat":
                {
                    Console.writeVerbose(`Constructing TextFormat node ${name}...`);
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

                return new ValueText(`TextFormat node ${name} constructed.`);

            case "google":
                {
                    Console.writeVerbose(`Constructing Google node ${name}...`);
                    const node = new NodeGoogle(name);

                    const googleApiKey = this.parameters[2];
                    if (googleApiKey) {

                        node.properties.key = googleApiKey;
                    }

                    const engine = this.parameters[3];
                    if (engine) {

                        node.properties.engine = engine;
                    }

                    const results = this.parameters[4]
                    if (results) {

                        node.properties.results = results;
                    }
                }

                return new ValueText(`Google node ${name} constructed.`);

            default:
                return new ValueError(`Unsupported node type: ${type}`);
        }
    }
}

export default CommandNew;