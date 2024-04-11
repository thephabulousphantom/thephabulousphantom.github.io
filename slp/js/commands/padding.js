import Command from "./command.js";
import DataManager from "../dataManager.js";

class CommandPadding extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const padding = this.parameters[0];
        if (padding > 0 & padding < 10) {

            await DataManager.set(`app.padding`, padding);
            document.documentElement.style.setProperty("--appPadding", `${padding}`);
        }
    }
}

export default CommandPadding;