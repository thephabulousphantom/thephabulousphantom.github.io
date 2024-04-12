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

    parseFunctionAndArguments(input) {

        const match = input.match(/(\w+)/);
        if (match) {

            const commandName = match[1].toLowerCase();
            const argumentString = input.substring(commandName.length).trim();
            const matches = [...argumentString.matchAll(/("(?:\\"|[^"])*"|[^",]*)(?:,|$)/g)];
            const args = [];
            matches.map(match => args.push(match[1].replace(/"/g, "").trim()));

            return {
                commandName: commandName,
                args: (args ? args.map(arg => arg.replace(/"/g, "").trim()) : null)
            };
        }
        
        return null;
    }

    async get(commandLine) {

        var parsed = this.parseFunctionAndArguments(commandLine);
        if (parsed) {

            if (this.commands[parsed.commandName]) {

                return new this.commands[parsed.commandName](commandLine, parsed.commandName, parsed.args);
            }
            else {

                throw new Error(`Unsupported command: ${parsed.commandName}`);
            }
        }

        throw Error("Syntax error.");
    }
}

CommandFactory.functionCallRegex = 
    ///^(\w+)(?:\(([^)]*)\))?$/;
    /^(\w+)\s+(?:([^,]+),\s*)*(?:(\w+))*$/;

const commandFactory = new CommandFactory();
export default commandFactory;