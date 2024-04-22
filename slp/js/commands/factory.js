import CommandClear from "./clear.js";
import CommandZoom from "./zoom.js";
import CommandPadding from "./padding.js";
import CommandNew from "./new.js";
import CommandList from "./list.js";
import CommandText from "./text.js";
import CommandSave from "./save.js";
import CommandLoad from "./load.js";
import CommandConnect from "./connect.js";
import CommandToggle from "./toggle.js";
import CommandDefault from "./default.js";
import CommandKill from "./kill.js";
import CommandReset from "./reset.js";
import CommandContinue from "./continue.js";

class CommandFactory {

    commands = {
        "clear": CommandClear,
        "zoom": CommandZoom,
        "padding": CommandPadding,
        "new": CommandNew,
        "list": CommandList,
        "text": CommandText,
        "save": CommandSave,
        "load": CommandLoad,
        "connect": CommandConnect,
        "toggle": CommandToggle,
        "default": CommandDefault,
        "kill": CommandKill,
        "reset": CommandReset,
        "continue": CommandContinue
    };

    constructor() {
        
    }

    parseFunctionAndArguments(input) {

        if (input.trim()[0] == "!") {

            input = input.substring(1).trim();
        }
        else {

            input = `text input,"${input}"`;
        }

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
    /^(\w+)\s+(?:([^,]+),\s*)*(?:(\w+))*$/;

const commandFactory = new CommandFactory();
export default commandFactory;