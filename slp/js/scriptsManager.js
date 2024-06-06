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
    "example: comic" : `
!reset

!new textformat, input, "write a witty scenario for a comic book panel with 6 frames. repeat a very detailed description of the appearance of the characters in every panel. characters need to be consistent across all the frames. the comic book panel should tell the following story;"
!new openaichat, screenwriter
!connect
!new textformat, director, "a comic-book panel in black and white with strong contrasts, with great detail and linework, where all the characters look consistent across all frames of the panel, and story is based on the following scenario; "
!connect
!new dalle3, illustrator
!connect

!toggle input
!toggle screenwriter
!toggle director
!toggle illustrator

!hide`,
"example: sci-fi poster": `!reset

!new textformat, input, "Innovate a movie poster for a sci-fi genre film titled: '","'"
!new dalle3, poster illustrator,,1024x1792
!connect`,
"example: DSLR camera": `!reset
!new textformat, input,,"cinematic-style, photorealistic, DSLR camera, wide-angle lens, low-light exposure."
!new dalle3, DSLR camera,,1792x1024
!connect
!hide`
};

const scriptsManager = new ScriptsManager();

export default scriptsManager;