import { PerspectiveCamera } from 'three';
import { rand } from './utils';

const FOV = 75;
const SHAKE_MAGNITUDE = 0.7;

export class Camera extends PerspectiveCamera {

    shake = false;
    shakeMagnitude = SHAKE_MAGNITUDE;

    transitionStartTime = 0;

    _highSpeed = false;

    set highSpeed(value) {
        this._highSpeed = value;
        this.transitionStartTime = performance.now();
    }

    constructor() {
        super(FOV, innerWidth / innerHeight, 0.1, 15000);
    }

    update(dt, now) {
        if (this.shake) {
            this.position.set(rand(-1, 1) * this.shakeMagnitude, rand(-1, 1) * this.shakeMagnitude, 0);
            this.rotation.z = rand(-1, 1) * 0.01 * this.shakeMagnitude;
        }

        const t = (now - this.transitionStartTime) / 1500;

        if (this._highSpeed) {
            if (t < 1) {
                this.fov = FOV + 60 * t ** 2;
                this.shakeMagnitude = SHAKE_MAGNITUDE + 3 * t ** 2;
            }
        } else {
            if (t < 1) {
                this.fov = FOV + 60 * (1 - t) ** 10;
                this.shakeMagnitude = SHAKE_MAGNITUDE + 3 * (1 - t) ** 5;
            }
        }
    }
}
