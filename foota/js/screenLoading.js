import Screen from "./screen.js";

export default class screenLoading extends Screen {

    constructor() {

        super("screenLoading");
    }

    init() {

        super.init();
    }

    beforeHide() {

        super.beforeHide();
    }

    afterHide() {

        super.afterHide();
    }

    beforeShow() {

        super.beforeShow();
    }

    afterShow() {

        super.afterShow();
    }
}

export const screen = new screenLoading();

Screen.current = screen;