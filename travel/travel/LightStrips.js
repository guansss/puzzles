import { BufferGeometry, Float32BufferAttribute, Mesh, RawShaderMaterial } from 'three';
import { rand } from './utils';

const stripCount = 100 * 2;

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
        const points = [];
        const alphas = [];
        const infos = [];

        const farZ = -5000;
        const nearZ = 10;
        const minRadius = 80;
        const maxRadius = 2000;
        const minSize = 0.2;
        const maxSize = 0.8;
        const alphaScalar = (1 - 0.1) / (maxSize - minSize);

        let centerX, centerY;
        let x1, y1, x2, y2;
        let h, scale;
        let size, angle, radius;
        let alpha;
        let offset;

        for (let i = 0; i < stripCount; i++) {
            angle = rand(0, Math.PI * 2);
            radius = rand(minRadius, maxRadius);
            size = rand(minSize, maxSize);

            centerX = Math.sin(angle) * radius;
            centerY = Math.cos(angle) * radius;

            h = Math.sqrt(centerX ** 2 + centerY ** 2);
            scale = size / h;

            x1 = centerX + scale * centerY;
            x2 = centerX - scale * centerY;
            y1 = centerY - scale * centerX;
            y2 = centerY + scale * centerX;

            points.push(
                x1, y1, nearZ,
                x2, y2, nearZ,
                x2, y2, farZ,
                x1, y1, farZ,
            );

            offset = i * 4;

            // two triangles per strip
            indices.push(
                offset, offset + 1, offset + 2,
                offset, offset + 2, offset + 3,
            );

            alpha = size * alphaScalar;

            if (i < stripCount / 2) {
                infos.push(true, alpha);
                alphas.push(alpha, alpha, alpha, alpha);
            } else {
                infos.push(false, alpha);
                alphas.push(0, 0, 0, 0);
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

        if (Math.random() < 0.14 * dt) {
            toggleIndex = ~~rand(0, stripCount);
        }

        // skip the origin
        let infoIndex = 0;
        let alphaIndex = 0;

        const alphas = this.geometry.attributes.alpha.array;
        const fadingStep = 0.003 * dt;

        for (let i = 0; i < stripCount; i++, infoIndex += 2, alphaIndex += 4) {
            if (i === toggleIndex) {
                infos[infoIndex] = !infos[infoIndex];
            }

            if (infos[infoIndex]) {
                if (alphas[alphaIndex] < infos[infoIndex + 1]) {
                    alphas[alphaIndex] =
                        alphas[alphaIndex + 1] =
                            alphas[alphaIndex + 2] =
                                alphas[alphaIndex + 3] =
                                    alphas[alphaIndex] + fadingStep;
                }
            } else {
                if (alphas[alphaIndex] > 0) {
                    alphas[alphaIndex] =
                        alphas[alphaIndex + 1] =
                            alphas[alphaIndex + 2] =
                                alphas[alphaIndex + 3] =
                                    alphas[alphaIndex] - fadingStep;
                }
            }
        }

        this.geometry.attributes.alpha.needsUpdate = true;
    }
}
