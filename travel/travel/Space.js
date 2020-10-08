import { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial } from 'three';
import { rand } from './utils';

export class Space extends Points {

    _active = false;

    get active() {
        return this._active;
    }

    set active(value) {
        this.visible = true;
        this._active = value;
        this.transitionStartTime = performance.now();
    }

    transitionStartTime = 0;

    constructor() {
        super(new BufferGeometry(), new PointsMaterial({
            size: 1,
            color: 0xffffff,
            sizeAttenuation: true,
            // alphaTest: 0.5,
            transparent: true,
        }));

        this.material.opacity = 0;

        this.init();
    }

    init() {
        let x, y, z;

        const points = [];

        for (let i = 0; i < 1000; i++) {
            x = rand(-1, 1);
            y = rand(-1, 1);
            z = rand(-1, 1);

            points.push(x * 600, y * 600, z * 600);
        }

        this.geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    }

    update(dt, now) {
        this.rotateX(0.00005 * dt);

        const t = (now - this.transitionStartTime) / 500;

        if (this._active) {
            if (this.material.opacity < 1)
                this.material.opacity += 0.002 * dt;

            if (t < 1) {
                this.position.z = -100 * (1 - t) ** 2;
            }
        } else {
            if (this.material.opacity > 0)
                this.material.opacity -= 0.002 * dt;
            else
                this.visible = false;

            if (t < 1) {
                this.position.z = 100 * t ** 3;
            }
        }
    }
}
