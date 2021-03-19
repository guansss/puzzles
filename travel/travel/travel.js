import $ from 'jquery/dist/jquery.slim.js';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
import '../styles.styl';
import { LightStrips } from './LightStrips';
import { Space } from './Space';
import UnrealBloomPass from './UnrealBloomPass';
import { clamp, delay, rand } from './utils';

// expose utils for index.js
window.$ = $;
window.clamp = clamp;

let cameraShakeMagnitude = 0.7;

window.travel = async (result, line2) => {
    window.travel = () => {};

    $('#puzzle .wrapper2').addClass('shake');

    requestAnimationFrame(animate);

    await delay(1500);

    space.visible = true;
    space.material.opacity = 0;

    $('#puzzle').addClass('hide');

    await delay(2000);

    space.active = false;

    await delay(400);

    lightStrips.active = true;
    bloomPass.threshold = 1.2;
    cameraShakeMagnitude = 1;

    await delay(2500);

    space.active = true;
    lightStrips.active = false;

    await delay(300);

    cameraShakeMagnitude = 0;

    await delay(2000);

    $('#puzzle').css('display', 'none');
    $('#result').addClass('show');

    if (result) {
        $('#result .headline2').text(line2);
        $('#result .action').click(async () => {
            $('.cover').addClass('active');

            await delay(1000);
            location.href = result;
        });
    } else {
        $('#result .headline1').text('You\'ve lost in space');
        $('#result .action').text('Refresh').click(() => location.reload());
    }
};

const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 15000);
const renderer = new WebGLRenderer({
    canvas: document.getElementById('canvas'),
    alpha: true,
});
renderer.setClearColor(0, 0);
renderer.clearColor();

const space = new Space();
space.active = true;
space.visible = false;
scene.add(space);

const lightStrips = new LightStrips();
scene.add(lightStrips);

const bloomPass = new UnrealBloomPass();
const ssaaPass = new SSAARenderPass(scene, camera, 0x000000, 0);
ssaaPass.sampleLevel = 3;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(ssaaPass);
composer.addPass(bloomPass);

function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
}

window.addEventListener('resize', resize);
resize();

let lastTime = performance.now();

function animate(now) {
    const id = requestAnimationFrame(animate);

    try {
        if (stats) stats.begin();

        const dt = now - lastTime;
        lastTime = now;

        if (bloomPass.threshold > 0) {
            bloomPass.threshold -= 0.002 * dt;
        }

        lightStrips.update(dt);
        space.update(dt, now);

        // shake it!
        camera.position.set(rand(-1, 1) * cameraShakeMagnitude, rand(-1, 1) * cameraShakeMagnitude, 0);
        camera.rotation.z = rand(-1, 1) * 0.01 * cameraShakeMagnitude;

        if (!cameraShakeMagnitude) {
            camera.rotation.y = Math.sin(now / 2500) * 0.2;
        }

        composer.render(scene, camera);

        if (stats) stats.end();
    } catch (e) {
        console.warn(e);
        console.warn('Animation aborted');
        cancelAnimationFrame(id);
    }
}

// debug tools

let GUI, Stats, stats;

try {
    GUI = require('dat.gui').GUI;
} catch (e) {}
try {
    Stats = require('stats.js');
} catch (e) {}

if (Stats) {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
}

if (GUI) {
    const params = {
        pixelSize: 4,
        exposure: 1,
        bloomStrength: 1.5,
        bloomThreshold: 0,
        bloomRadius: 0,
    };
    const gui = new GUI();

    gui.add(params, 'exposure', 0.1, 2).onChange(value => renderer.toneMappingExposure = Math.pow(value, 4.0));
    gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(value => bloomPass.threshold = Number(value));
    gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(value => bloomPass.strength = Number(value));
    gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(value => bloomPass.radius = Number(value));
}
