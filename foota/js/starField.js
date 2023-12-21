export default class StarField {

    objects = [];

    size = {
        x: null, y: null, z: null
    };

    constructor(count, xMin, xMax, yMin, yMax, zMin, zMax, size) {

        this.size.x = Math.abs(xMax - xMin);
        this.size.y = Math.abs(yMax - yMin);
        this.size.z = Math.abs(zMax - zMin);

        this.objects.push(this.getStarFieldSector(count / 4, xMin / 2, xMax / 2, yMin, yMax, zMin / 2, zMax / 2, size));
        this.objects[0].position.x = ((xMax - xMin) / 2 + xMin) / 2;
        this.objects[0].position.z = ((zMax - zMin) / 2 + zMin) / 2;

        this.objects.push(this.getStarFieldSector(count / 4, xMin / 2, xMax / 2, yMin, yMax, zMin / 2, zMax / 2, size));
        this.objects[1].position.x = ((xMax - xMin) / 2 + xMax) / 2;
        this.objects[1].position.z = ((zMax - zMin) / 2 + zMin) / 2;

        this.objects.push(this.getStarFieldSector(count / 4, xMin / 2, xMax / 2, yMin, yMax, zMin / 2, zMax / 2, size));
        this.objects[2].position.x = ((xMax - xMin) / 2 + xMin) / 2;
        this.objects[2].position.z = ((zMax - zMin) / 2 + zMax) / 2;

        this.objects.push(this.getStarFieldSector(count / 4, xMin / 2, xMax / 2, yMin, yMax, zMin / 2, zMax / 2, size));
        this.objects[3].position.x = ((xMax - xMin) / 2 + xMax) / 2;
        this.objects[3].position.z = ((zMax - zMin) / 2 + zMax) / 2;
    }

    getStarFieldSector(count, xMin, xMax, yMin, yMax, zMin, zMax, size, color) {

        const starPositions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {

            starPositions[i + 0] = (Math.random() * (xMax - xMin)) + xMin;
            starPositions[i + 1] = (Math.random() * (yMax - yMin)) + yMin;
            starPositions[i + 2] = (Math.random() * (zMax - zMin)) + zMin;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(starPositions, 3)
        );
        const material = new THREE.PointsMaterial({ size: size, color: color ? color : 0xffffff });
        const starField = new THREE.Points(geometry, material);

        return starField;
    }

    update(x, z) {

        for (var i = 0; i < this.objects.length; i++) {

            const xOffset = this.objects[i].position.x - x;

            if (xOffset > (this.size.x / 2 + 1)) {

                this.objects[i].position.x -= this.size.x;
            }
            else if (xOffset < -(this.size.x / 2 + 1)) {

                this.objects[i].position.x += this.size.x;
            }

            const zOffset = this.objects[i].position.z - z;

            if (zOffset > (this.size.z / 2 + 1)) {

                this.objects[i].position.z -= this.size.z;
            }
            else if (zOffset < -(this.size.z / 2 + 1)) {

                this.objects[i].position.z += this.size.z;
            }
        }
    }
}