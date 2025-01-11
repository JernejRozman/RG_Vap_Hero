import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';

import { Camera, Model } from 'engine/core.js';
import { Player } from './game/Player.js';


import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from 'engine/core/MeshUtils.js';

import { Physics } from './game/Physics.js';

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL('./models/game/game.gltf', import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');

camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.5, -0.5, -0.5],
    max: [0.5, 0.5, 0.5],
};


loader.loadNode('Floor').isStatic = true;
loader.loadNode('Cube').isStatic = true;
loader.loadNode('Cube.001').isStatic = true;
loader.loadNode('Cube.002').isStatic = true;
loader.loadNode('Cube.003').isStatic = true;
loader.loadNode('Cube.004').isStatic = true;
loader.loadNode('Cube.005').isStatic = true;
loader.loadNode('Cube.006').isStatic = true;
loader.loadNode('Cube.007').isStatic = true;
loader.loadNode('Cube.008').isStatic = true;
loader.loadNode('Cube.009').isStatic = true;
loader.loadNode('SurfTorus').isStatic = true;
loader.loadNode('BézierCurve').isStatic = true;
loader.loadNode('Plane').isStatic = true;
loader.loadNode('Cube.010').isStatic = true;
loader.loadNode('Cube.011').isStatic = true;
loader.loadNode('Cube.012').isStatic = true;
loader.loadNode('Cube.013').isStatic = true;
loader.loadNode('Cube.014').isStatic = true;
loader.loadNode('Cube.015').isStatic = true;
loader.loadNode('Torus').isStatic = true;
loader.loadNode('BézierCircle').isStatic = true;
loader.loadNode('BézierCircle.001').isStatic = true;
loader.loadNode('BézierCircle.002').isStatic = true;
loader.loadNode('BézierCircle.003').isStatic = true;
loader.loadNode('Sphere').isStatic = true;
loader.loadNode('Cube.016').isStatic = true;
loader.loadNode('Plane.001').isStatic = true;
loader.loadNode('Sphere.001').isStatic = true;
loader.loadNode('Sphere.002').isStatic = true;
loader.loadNode('Sphere.003').isStatic = true;
loader.loadNode('Sphere.004').isStatic = true;
loader.loadNode('Cylinder').isStatic = true;
loader.loadNode('Cylinder.002').isStatic = true;
loader.loadNode('Cylinder.001').isStatic = true;
loader.loadNode('Cube.017').isStatic = true;
loader.loadNode('Cube.018').isStatic = true;
loader.loadNode('Cone').isStatic = true;
loader.loadNode('Cube.019').isStatic = true;
loader.loadNode('Cube.020').isStatic = true;
loader.loadNode('Cube.021').isStatic = true;
loader.loadNode('Cube.022').isStatic = true;
loader.loadNode('Cube.023').isStatic = true;
loader.loadNode('Cube.024').isStatic = true;
loader.loadNode('Cube.025').isStatic = true;
loader.loadNode('Cube.026').isStatic = true;
loader.loadNode('Plane.002').isStatic = true;
loader.loadNode('Plane.003').isStatic = true;
loader.loadNode('Plane.004').isStatic = true;
loader.loadNode('Plane.005').isStatic = true;
loader.loadNode('Plane.006').isStatic = true;
loader.loadNode('Cube.027').isStatic = true;
loader.loadNode('Cube.028').isStatic = true;
loader.loadNode('Cube.029').isStatic = true;
loader.loadNode('Cube.030').isStatic = true;
loader.loadNode('Cube.031').isStatic = true;
loader.loadNode('Cube.032').isStatic = true;
loader.loadNode('Cube.033').isStatic = true;
loader.loadNode('Cube.034').isStatic = true;
loader.loadNode('BézierCurve.001').isStatic = true;
loader.loadNode('SurfTorus.002').isStatic = true;
loader.loadNode('Sphere.005').isStatic = true;
loader.loadNode('Plane.010').isStatic = true;
loader.loadNode('Plane.011').isStatic = true;
loader.loadNode('Plane.012').isStatic = true;
loader.loadNode('Sphere.006').isStatic = true;
loader.loadNode('Plane.007').isStatic = true;
loader.loadNode('Plane.008').isStatic = true;
loader.loadNode('Sphere.007').isStatic = true;
loader.loadNode('Plane.009').isStatic = true;
loader.loadNode('Plane.013').isStatic = true;
loader.loadNode('Cube.035').isStatic = true;
loader.loadNode('Text').isStatic = true;
loader.loadNode('Sphere.008').isStatic = true;
loader.loadNode('Sphere.009').isStatic = true;


const physics = new Physics(scene);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();