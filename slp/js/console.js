import TemplateManager from "./templateManager.js";
import App from "./app.js";

class Console {

    model = {
        id: "console"
    }

    dom = {};

    constructor() {

        const template = TemplateManager.getTemplateFromString(Console.templateString);
        const dom = TemplateManager.getDom(template,this.model);

        this.dom.appContainer = document.querySelector("#appContainer");
        this.dom.appContainer.append(...dom.childNodes);

        this.dom.content = document.querySelector(`#${this.model.id}-content`);
        this.dom.input = document.querySelector(`#${this.model.id}-input`);
        this.dom.inputTextBox = document.querySelector(`#${this.model.id}-inputTextBox`);

        this.dom.inputTextBox.addEventListener(
            "keypress",
            this.onInputTextBoxKeyPress.bind(this)
        );

        this.write("Console started. Ready for your input.");
    }

    async onInputTextBoxKeyPress(event) {

        try {

            switch (event.code) {

                case "Enter":
                case "NumpadEnter":
                    await this.processCommandLine();
                    break;
            }
        }
        catch (ex) {

            this.write(`An error ocurred: ${ex.message}`);
        }
    }

    async write(text) {

        var textBlock = document.createElement("div");
        textBlock.className = "console-outputText";
        textBlock.innerText = text;

        this.dom.content.appendChild(textBlock);
        this.dom.content.scrollTop = this.dom.content.scrollHeight;
    }

    async processCommandLine() {

        const commandLine = this.dom.inputTextBox.value;
        this.dom.inputTextBox.value = "";

        App.processCommand(commandLine);
    }
}

Console.templateString = `
    <div id="{{id}}-content" class="console-content uiElement uiBackground"></div>
    <div id="{{id}}-input" class="console-input uiElement uiBackground uiBorder uiShadowUp">
        <input id="{{id}}-inputTextBox" type="text" placeholder="Type your input here." enterkeyhint="enter">
    </div>
`;

const console = new Console();

export default console;