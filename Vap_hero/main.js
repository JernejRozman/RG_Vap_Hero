import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';
import { Camera } from 'engine/core.js';

import { Model } from 'engine/core.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from 'engine/core/MeshUtils.js';

import { Physics } from './Physics.js';
import { Player } from './game/Player.js'; // Dodaj razred Player

// Inicializacija platna in rendererja
const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

// Nalaganje scene in kamere
const loader = new GLTFLoader();
await loader.load(new URL('./scene/scene.gltf', import.meta.url));
const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');


// dodajanje Hose nekje
const hose_loader = new GLTFLoader;
//await hose_loader.load(new URL("./models/Powerwasher_Hose/Powerwasher_Hose.gltf", import.meta.url));

// Inicializacija igralca
const player = new Player(camera, canvas); // Ustvari igralca

// Dodaj statične objekte
loader.loadNode('Box.000').isStatic = true;
loader.loadNode('Box.001').isStatic = true;
loader.loadNode('Wall.000').isStatic = true;
//hose_loader.loadNode("Nozzle").isStatic = true;

// Inicializacija fizike
const physics = new Physics(scene);

// Izračun AABB za vsak objekt v sceni
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) return;

    const boxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

// Funkcija za posodobitev
function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    player.update(time, dt); // Posodobi igralca
    physics.update(time, dt);
}

// Funkcija za renderiranje
function render() {
    renderer.render(scene, camera);
}

// Funkcija za spremembo velikosti
function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

// Zaženi sisteme
new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
