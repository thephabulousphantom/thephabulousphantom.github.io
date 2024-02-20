import Thing from "./thing.js";
import App from "./app.js";

export default class Physics extends Thing {

    bindings = [];
    objects = {};

    constructor() {

        super();

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9, 0);
    }

    update(time, elapsed) {

        if (!this.world) {

            return;
        }

        this.world.step(1.0 / 90.0, elapsed / 1000, 3);

        for (var i = 0; i < this.bindings.length; i++) {

            this.bindings[i].dest.x = this.bindings[i].src.x + this.bindings[i].offset.x;
            this.bindings[i].dest.y = this.bindings[i].src.y + this.bindings[i].offset.y;
            this.bindings[i].dest.z = this.bindings[i].src.z + this.bindings[i].offset.z;
        }
    }

    addBox(sx, sy, sz, x, y, z, m) {

        this.world.addBody(new CANNON.Body({
            mass: m,
            shape: new CANNON.Box(new CANNON.Vec3(sx, sy, sz)),
            position: new CANNON.Vec3(x, y, z)
        }));
    }
}