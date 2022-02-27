import { Vector2 } from 'three';
import { UnrealBloomPass as _UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export default class UnrealBloomPass extends _UnrealBloomPass {
    constructor() {
        super(new Vector2(innerWidth, innerHeight), 2, 0, 1);
    }

    getSeperableBlurMaterial(kernelRadius) {
        const material = super.getSeperableBlurMaterial(kernelRadius);

        // https://github.com/mrdoob/three.js/issues/14104
        material.fragmentShader =
            '#include <common>\
            varying vec2 vUv;\n\
            uniform sampler2D colorTexture;\n\
            uniform vec2 texSize;\
            uniform vec2 direction;\
            \
            float gaussianPdf(in float x, in float sigma) {\
                return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\
            }\
            void main() {\n\
                vec2 invSize = 1.0 / texSize;\
                float fSigma = float(SIGMA);\
                float weightSum = gaussianPdf(0.0, fSigma);\
                float alphaSum = 0.0;\
                vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\
                for( int i = 1; i < KERNEL_RADIUS; i ++ ) {\
                    float x = float(i);\
                    float w = gaussianPdf(x, fSigma);\
                    vec2 uvOffset = direction * invSize * x;\
                    vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\
                    vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\
                    diffuseSum += (sample1.rgb + sample2.rgb) * w;\
                    alphaSum += (sample1.a + sample2.a) * w;\
                    weightSum += 2.0 * w;\
                }\
                gl_FragColor = vec4(diffuseSum/weightSum, alphaSum/weightSum);\n\
            }';

        return material;
    }
}
