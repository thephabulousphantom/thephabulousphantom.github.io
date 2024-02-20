export default class Thing {

    things = {};

    constructor() {

        if (document.readyState === "complete") {

            setTimeout(this.init.bind(this), 0);
        }
        else {

            window.addEventListener("load", this.init.bind(this));
        }
    }

    init() {

    }

    update(time, elapsed) {

        for (var thing in this.things) {

            thing.update(time, elapsed);
        }
    }
}