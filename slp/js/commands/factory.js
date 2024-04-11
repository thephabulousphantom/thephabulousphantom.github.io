import CommandClear from "./clear.js";
import CommandZoom from "./zoom.js";
import CommandPadding from "./padding.js";
import CommandAgentNew from "./agentNew.js";
import CommandAgentList from "./agentList.js";
import CommandAgentInvoke from "./agentInvoke.js";
import CommandStateSave from "./stateSave.js";
import CommandStateLoad from "./stateLoad.js";

class CommandFactory {

    commands = {
        "clear": CommandClear,
        "zoom": CommandZoom,
        "padding": CommandPadding,
        "agentnew": CommandAgentNew,
        "agentlist": CommandAgentList,
        "agentinvoke": CommandAgentInvoke,
        "statesave": CommandStateSave,
        "stateload": CommandStateLoad
    };

    constructor() {
        
    }

    async get(commandLine) {

        const match = commandLine.match(CommandFactory.functionCallRegex);

        if (match) {

            const commandName = match[1].toLowerCase();
            const parameters = match[2] ? match[2].split(',').map(param => param.trim()) : [];

            if (this.commands[commandName]) {

                return new this.commands[commandName](commandLine, commandName, parameters);
            }
            else {

                throw new Error(`Unsupported command: ${commandName}`);
            }
        }

        throw Error("Syntax error.");
    }
}

CommandFactory.functionCallRegex = 
    /^(\w+)(?:\(([^)]*)\))?$/;

const commandFactory = new CommandFactory();
export default commandFactory;