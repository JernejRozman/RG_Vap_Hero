import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';

import { Camera, Model, Transform } from 'engine/core.js';
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

// Extract all node names except for cameras and lights
const staticNodes = loader.gltf.nodes
    .filter(node => !node.camera && !node.extensions)
    .map(node => node.name);

// Load and set static property for each node
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

// Create an HTML element to display the camera position
const positionDisplay = document.createElement('div');
positionDisplay.style.position = 'absolute';
positionDisplay.style.top = '10px';
positionDisplay.style.left = '10px';
positionDisplay.style.color = 'white';
positionDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
positionDisplay.style.padding = '5px';
document.body.appendChild(positionDisplay);

// Create an HTML element to display the timer
const timerDisplay = document.createElement('div');
timerDisplay.style.position = 'absolute';
timerDisplay.style.top = '10px';
timerDisplay.style.right = '10px';
timerDisplay.style.color = 'white';
timerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
timerDisplay.style.padding = '5px';
document.body.appendChild(timerDisplay);

let startTime = null;

function update(time, dt) {
    if (startTime === null) {
        startTime = time;
    }

    const elapsedTime = (time - startTime) / 1000;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const milliseconds = Math.floor((elapsedTime % 1) * 1000);

    timerDisplay.textContent = `Time: ${milliseconds}s`;

    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    // Update the camera position display
    const cameraTransform = camera.getComponentOfType(Transform);
    if (cameraTransform) {
        const { translation } = cameraTransform;
        positionDisplay.textContent = `Camera position: x=${translation[0].toFixed(2)}, y=${translation[1].toFixed(2)}, z=${translation[2].toFixed(2)}`;
    }

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