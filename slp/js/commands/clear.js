import Command from "./command.js";
import Console from "../console.js";

class CommandClear extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        Console.dom.content.innerHTML = "";
    }
}

export default CommandClear;