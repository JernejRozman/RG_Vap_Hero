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
await loader.load(new URL('./models/hope_advanced/hope.gltf', import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');
const hose = loader.loadNode("Nozzle");

camera.addComponent(new FirstPersonController(camera, canvas));
camera.addComponent(hose)
camera.isDynamic = true;
camera.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.2, 0.2, 0.2],
};


loader.loadNode('Floor').isStatic = true;
loader.loadNode('Floor.001').isStatic = true;
loader.loadNode('Floor.002').isStatic = true;
loader.loadNode('Floor.003').isStatic = true;
loader.loadNode('Floor.004').isStatic = true;
loader.loadNode('Cube').isStatic = true;
loader.loadNode('Plane').isStatic = true;
loader.loadNode('Sphere').isStatic = true;
loader.loadNode('Nozzle').isStatic = true;


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
