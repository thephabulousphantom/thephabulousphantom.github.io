import Screen from "./screen.js";

export default class screenLoading extends Screen {

    constructor() {

        super("screenLoading");
    }

    init() {

        super.init();

        this.labelLevel = document.getElementById("labelLoading");

    }

    beforeHide() {

        super.beforeHide();

        this.labelLevel.style.display = "none";
    }

    afterHide() {

        super.afterHide();
    }

    beforeShow() {

        super.beforeShow();

        this.labelLevel.style.display = "";
    }

    afterShow() {

        super.afterShow();
    }
}

export const screen = new screenLoading();

Screen.current = screen;