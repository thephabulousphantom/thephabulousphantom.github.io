import Command from "./command.js";
import App from "../app.js";
import DataManager from "../dataManager.js";
import ResultEmpty from "../results/empty.js";
import ResultText from "../results/text.js";

class CommandDefault extends Command {

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);
    }

    async execute() {

        const varName = this.parameters[0];
        const value = this.parameters[1];

        if (App.defaults[varName] !== undefined) {

            App.defaults[varName] = value;
            await DataManager.set(`defaults.${varName}`, value);

            return new ResultText(value);
        }

        return new ResultEmpty();
    }
}

export default CommandDefault;