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


const staticNodes = [
    'Floor', 'Cube', 'Cube.001', 'Cube.002', 'Cube.003', 'Cube.004', 'Cube.005', 'Cube.006', 'Cube.007', 'Cube.008', 'Cube.009', 'SurfTorus', 'BézierCurve',
    'Plane', 'Cube.010', 'Cube.011', 'Cube.012', 'Cube.013', 'Cube.014', 'Cube.015', 'Torus', 'BézierCircle', 'BézierCircle.001', 'BézierCircle.002', 'BézierCircle.003',
    'Sphere', 'Cube.016', 'Plane.001', 'Sphere.001', 'Sphere.002', 'Sphere.003', 'Sphere.004', 'Cylinder', 'Cylinder.002', 'Cylinder.001', 'Cube.017', 'Cube.018',
    'Cone', 'Cube.019', 'Cube.020', 'Cube.021', 'Cube.022', 'Cube.023', 'Cube.024', 'Cube.025', 'Cube.026', 'Plane.002', 'Plane.003', 'Plane.004', 'Plane.005',
    'Plane.006', 'Cube.027', 'Cube.028', 'Cube.029', 'Cube.030', 'Cube.031', 'Cube.032', 'Cube.033', 'Cube.034', 'BézierCurve.001', 'SurfTorus.002', 'Sphere.005', 'Plane.010',
    'Plane.011', 'Plane.012', 'Sphere.006', 'Plane.007', 'Plane.008', 'Sphere.007', 'Plane.009', 'Plane.013', 'Cube.035', 'Text', 'Sphere.008', 'Sphere.009'
];

for (const nodeName of staticNodes) {
    const node = loader.loadNode(nodeName);
    node.isStatic = true;
}


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