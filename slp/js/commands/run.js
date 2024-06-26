import Command from "./command.js";
import CommandFactory from "./factory.js";
import TemplateManager from "../templateManager.js";
import App from "../app.js";
import ValueError from "../values/error.js";

class CommandRun extends Command {

    dom = null;

    properties = {        
    };

    constructor(commandLine, commandName, parameters) {

        super(commandLine, commandName, parameters);

        this.properties.title = "Untitled application";

        if (App.properties.title) {

            this.properties.title = App.properties.title;
        }

        this.properties.prompt = "Type in your prompt here:";

        if (App.properties.prompt) {

            this.properties.prompt = App.properties.prompt;
        }

        this.properties.action = "Run";
        
        if (App.properties.action) {

            this.properties.action = App.properties.action;
        }
        
        if (parameters && parameters.length > 0) {

            this.properties.input = parameters[0];            
        }
    }

    async help(category) {

        return `
Runs current multi agent graph. If input parameter is provided, it is used to
initialise "prompt" text box on the user-application UI and automatically runs.
Otherwise UI for collecting input prompt is presented and the app runs only
when "action" button is pressed by user. In order for a user-application to
be runnable, one of the agents needs to be named "input". Prompt collected from
user or from command line is passed to this agent as an input and the agent is
activated. Once the last agent finishes activation, its result is collected and
displayed in user-application UI.

syntax:

   run [<prompt>]
   
parameters:

   prompt : Prompt to initialise user-application with and run the application.
            If not specified, user needs to provide the prompt using the user-
            application UI and click "action" button.`;
    }

    async initUi() {

        if (this.dom) {

            this.dom.remove();
        }

        const dom = TemplateManager.getDom(CommandRun.template, this.properties);
        this.dom = dom.querySelector(".uiAppFrontEnd");

        App.dom.append(this.dom);

        this.buttonClose = this.dom.querySelector(".uiAppClose.uiButton");
        this.buttonClose.addEventListener("click", this.onCloseButtonClick.bind(this));

        this.buttonAction = this.dom.querySelector(".uiAppInput button");
        this.buttonAction.addEventListener("click", this.onActionButtonClick.bind(this));

        this.input = this.dom.querySelector(".uiAppInput input");
        this.input.addEventListener(
            "keyup",
            this.onInputTextBoxKey.bind(this)
        );
        this.input.focus();

        this.dom.addEventListener("keyup", this.onKey.bind(this));

        if (this.properties.input) {

            this.input.value = this.properties.input;
            this.onActionButtonClick();
        }
    }

    async onKey(event) {

        try {

            switch (event.code.toLowerCase()) {

                case "escape":
                    this.close();
                    return;
            }            
        }
        catch (ex) {

            App.write(`An error ocurred: ${ex.message}`);
        }
    }

    async onInputTextBoxKey(event) {

        try {

            switch (event.code.toLowerCase()) {

                case "enter":
                case "numpadenter":
                    await this.onActionButtonClick();
                    return;
            }            

            switch (event.keyCode) {

                case 13:
                case 10:
                    await this.onActionButtonClick();
                    return;
            }
        }
        catch (ex) {

            App.write(`An error ocurred: ${ex.message}`);
        }
    }

    async close() {

        if (!this.dom) {

            return;
        }

        this.dom.remove();
        this.dom = null;

        if (CommandRun.executeComplete) {

            CommandRun.executeComplete(new ValueError("Aborted."));
            CommandRun.executeComplete = null;
        }
    }

    async onCloseButtonClick() {

        this.close();
    }

    async onActionButtonClick() {

        if (!this.dom) {

            return;
        }

        this.input.blur();
        const input = this.input.value;
        App.processCommand(`text input,"${input}"`);

        if (!this.dom.classList.contains("uiRunning")) {

            this.dom.classList.add("uiRunning");
        }
    }

    async onOutput(output) {

    }

    async execute() {

        await this.initUi();

        const promise = new Promise(

            (function (resolve) {

                if (CommandRun.executeComplete) {

                    CommandRun.executeComplete(new ValueError("Aborting old run."));
                }

                CommandRun.executeComplete = resolve;

            }).bind(this)
        );

        const result = await promise;

        if (result instanceof ValueError) {

            if (!this.dom) {

                return;
            }
    
            this.dom.remove();
            this.dom = null;
        }

        return result;
    }
}

CommandRun.template = await TemplateManager.getTemplate("app");
CommandRun.executeComplete = null;
CommandRun.onOutput = function(output) {

    const dom = App.dom.querySelector(".uiAppFrontEnd");
    if (!dom) {

        return false;
    }

    const outputContainer = dom.querySelector(".uiAppOutput");
    outputContainer.innerHTML = "";
    outputContainer.append(output.viewDom());

    if (CommandRun.executeComplete) {

        CommandRun.executeComplete(output);
        CommandRun.executeComplete = null;
    }

    dom.querySelector(".uiAppInput input").focus();
    if (dom.classList.contains("uiRunning")) {

        dom.classList.remove("uiRunning");
    }

    return true;
}

export default CommandRun;