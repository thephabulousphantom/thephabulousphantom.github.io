import DataManager from "./dataManager.js";

class ScriptsManager {

    scripts = {

    }

    constructor() {

        DataManager.get(`scripts`, []).then((scriptNames) => {

            if (!scriptNames.length) {

                this.initDefaultScripts();
            }
            else {

                for (const scriptName of scriptNames) {

                    DataManager.get(`script.${scriptName}`, "").then((commands) => {
    
                        this.scripts[scriptName] = commands;
                    });
                }
            }
        });
    }

    async initDefaultScripts() {

        for (const scriptName in ScriptsManager.defaultScripts) {

            this.scripts[scriptName] = ScriptsManager.defaultScripts[scriptName];
            await DataManager.set(`script.${scriptName}`, ScriptsManager.defaultScripts[scriptName]);
        }

        await DataManager.set(`scripts`, Object.keys(this.scripts));
    }

    async set(name, commands) {

        this.scripts[name] = commands;
        await DataManager.set(`script.${name}`, commands);
        await DataManager.set(`scripts`, Object.keys(this.scripts));
    }

    async rename(name, newName) {

        this.scripts[newName] = this.scripts[name];
        delete this.scripts[name];
        await DataManager.clear(`script.${name}`);
        await DataManager.set(`script.${newName}`, this.scripts[newName]);
        await DataManager.set(`scripts`, Object.keys(this.scripts));
    }

    async remove(name) {

        delete this.scripts[name];
        await DataManager.clear(`script.${name}`);
        await DataManager.set(`scripts`, Object.keys(this.scripts));
    }

    async get(name, defaultValue) {

        return await DataManager.get(`script.${name}`, defaultValue);
    }
}

ScriptsManager.defaultScripts = {
    "comic book" : `\
new textformat, input, "write a funny scenario for a comic book panel containing 6 frames. the scenario should tell the following story."
new openai, screenwriter
connect input, screenwriter
new textformat, daliInstructions, "create great looking and detailed comic-book panel consisting of 6 frames. Make sure to follow the scenario so that frames in the picture closely follow frame descriptions in the scenario. Frames should be ordered left to right, top to bottom. Also make sure that text shown on each frame matches with scenario and is readable. What follows is the scenario."
connect screenwriter, daliInstructions
new dall-e, dali
connect daliInstructions, dali`
};

const scriptsManager = new ScriptsManager();

export default scriptsManager;