import { BufferGeometry, Float32BufferAttribute, Mesh, RawShaderMaterial } from 'three';
import { rand } from './utils';

const stripCount = 60 * 2;

export class LightStrips extends Mesh {

    active = false;
    infos = [];

    constructor() {
        super(new BufferGeometry(), new RawShaderMaterial({
            uniforms: {
                opacity: { value: 0.0 },
            },
            vertexShader: `
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float alpha;

varying float vAlpha;

void main() {
    vAlpha = alpha;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
            fragmentShader: `
precision mediump float;
precision mediump int;

uniform float opacity;

varying float vAlpha;

void main() {
    gl_FragColor = vec4( 1.0, 1.0, 1.0, vAlpha * opacity );
}`,
            transparent: true,
        }));

        this.init();
    }

    init() {
        const indices = [];

        // first point as the origin
        const points = [0, 0, -800];
        const alphas = [0];
        const infos = [true, 0];

        const minSize = 0.1;
        const maxSize = 1.2;
        const alphaScalar = (1 - 0.1) / (maxSize - minSize);

        let x, y;
        let h, scale;
        let size, angle;
        let alpha;

        for (let i = 0; i < stripCount; i++) {
            angle = rand(0, Math.PI * 2);
            size = rand(minSize, maxSize);

            x = Math.sin(angle) * 100;
            y = Math.cos(angle) * 100;

            h = Math.sqrt(x ** 2 + y ** 2);
            scale = size / h;

            points.push(
                x + scale * y, y - scale * x, 0,
                x - scale * y, y + scale * x, 0,
            );

            // one triangle per strip
            indices.push(0, i * 2 + 1, i * 2 + 2);

            alpha = size * alphaScalar;

            if (i < stripCount / 2) {
                infos.push(true, alpha);
                alphas.push(alpha, alpha);
            } else {
                infos.push(false, alpha);
                alphas.push(0, 0);
            }
        }

        this.geometry.setIndex(indices);
        this.geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
        this.geometry.setAttribute('alpha', new Float32BufferAttribute(alphas, 1));

        this.infos = infos;
    }

    update(dt) {
        if (this.active) {
            if (this.material.uniforms.opacity.value < 1)
                this.material.uniforms.opacity.value += 0.004 * dt;
        } else {
            if (this.material.uniforms.opacity.value > 0)
                this.material.uniforms.opacity.value -= 0.004 * dt;
            else
                return; // skip update when completely invisible
        }

        const infos = this.infos;

        let toggleIndex = -1;

        if (Math.random() < 0.04 * dt) {
            toggleIndex = ~~rand(0, stripCount);
        }

        // skip the origin
        let infoIndex = 2;
        let alphaIndex = 1;

        const alphas = this.geometry.attributes.alpha.array;
        const fadingStep = 0.003 * dt;

        for (let i = 0; i < stripCount; i++, infoIndex += 2, alphaIndex += 2) {
            if (i === toggleIndex) {
                infos[infoIndex] = !infos[infoIndex];
            }

            if (infos[infoIndex]) {
                if (alphas[alphaIndex] < infos[infoIndex + 1]) {
                    alphas[alphaIndex] = alphas[alphaIndex + 1] = alphas[alphaIndex] + fadingStep;
                }
            } else {
                if (alphas[alphaIndex] > 0) {
                    alphas[alphaIndex] = alphas[alphaIndex + 1] = alphas[alphaIndex] - fadingStep;
                }
            }
        }

        this.geometry.attributes.alpha.needsUpdate = true;
    }
}
