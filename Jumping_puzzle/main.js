import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';

import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';

import { Camera, Model, Transform, Light, Node } from 'engine/core.js';
import { Player } from './game/Player.js';

import { AudioController } from 'engine/controllers/AudioController.js';
const audioController = new AudioController('./audio/test.mp3');


import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from 'engine/core/MeshUtils.js';

import { Physics } from './game/Physics.js';

const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL('./models/game/game3.gltf', import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');

// Luč
const light = new Node();
scene.addChild(light);
light.addComponent(new Transform({
    // Pozicija luči
    translation: [0, 200, 0],
}));
light.addComponent(new Light({
    // Barva svetlobe - rahlo rumenkasta za simulacijo sončne svetlobe
    color: [1, 0.95, 0.8],
    // Ambientna svetloba - rahlo povečana za bolj naravno osvetlitev
    ambient: [0.4, 0.4, 0.4],
    // Smer svetlobe - usmerjena rahlo navzdol in naprej
    smer_luci: [0, -1, 0],
    // Širina svetlobnega snopa - nekoliko širša za bolj enakomerno osvetlitev
    sirina_svetlobnega_snopa: Math.cos(Math.PI/4),
    // Faktor usmerjenosti svetlobe - zmanjšan za bolj razpršeno svetlobo
    faktor_usmerjenosti: 20,
}));



camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.5, -0.5, -0.5],
    max: [0.5, 0.5, 0.5],
};

// Extract all node names except for cameras and lights
const staticNodes = loader.gltf.nodes
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

const positionDisplay = document.createElement('div');
positionDisplay.style.position = 'absolute';
positionDisplay.style.top = '10px';
positionDisplay.style.left = '10px';
positionDisplay.style.color = 'white';
positionDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
positionDisplay.style.border = '2px solid #4CAF50'; // Green border for better visibility
positionDisplay.style.borderRadius = '10px'; // Rounded corners
positionDisplay.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.3)'; // Add shadow for depth
positionDisplay.style.padding = '8px 12px';
positionDisplay.style.fontFamily = 'Arial, sans-serif';
positionDisplay.style.fontSize = '14px';
document.body.appendChild(positionDisplay);

const timerDisplay = document.createElement('div');
timerDisplay.style.position = 'absolute';
timerDisplay.style.top = '10px';
timerDisplay.style.right = '10px';
timerDisplay.style.color = 'white';
timerDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
timerDisplay.style.border = '2px solid #2196F3'; // Blue border for contrast
timerDisplay.style.borderRadius = '10px'; // Rounded corners
timerDisplay.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.3)'; // Add shadow for depth
timerDisplay.style.padding = '8px 12px';
timerDisplay.style.fontFamily = 'Arial, sans-serif';
timerDisplay.style.fontSize = '14px';
timerDisplay.innerHTML = '<strong>Time:</strong> 0s'; // Default text
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
        positionDisplay.textContent = `Camera position: x = ${translation[0].toFixed(2)}, y = ${translation[1].toFixed(2)}, z = ${translation[2].toFixed(2)}`;
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