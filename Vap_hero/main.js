// main.js
import { ResizeSystem } from 'engine/systems/ResizeSystem.js';
import { UpdateSystem } from 'engine/systems/UpdateSystem.js';

import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { UnlitRenderer } from 'engine/renderers/UnlitRenderer.js';

import { Camera, Model } from 'engine/core.js';
import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes
} from 'engine/core/MeshUtils.js';

import { Physics } from './Physics.js';

// Uvozimo naš novi Player razred (vse v JS!)
import { Player } from './game/Player.js';


// 1. Inicializiramo renderer in platno
const canvas = document.querySelector('canvas');
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

// 2. Naložimo gltf sceno (če še vedno želiš uporabljati obstoječo sceno)
const loader = new GLTFLoader();
await loader.load(new URL('./models/donut/donut.gltf', import.meta.url));

// 3. Ustvarimo sceno in kamero
const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode('Camera');

// 4. Namesto, da tukaj direktno dodajamo FirstPersonController na kamero,
//    to raje naredimo v Player razredu.
const player = new Player(camera, canvas);

// 5. Še vedno imamo zunanjo fiziko (Physics.js)
const physics = new Physics(scene);

// 6. Nastavimo statične objekte (škatle, stene, ...)

//loader.loadNode('Wall.000').isStatic = true;
//loader.loadNode('Wall.001').isStatic = true;
//loader.loadNode('Wall.002').isStatic = true;
//loader.loadNode('Wall.003').isStatic = true;



// 7. Za vsak node v sceni izračunamo bounding box,
//    da lahko fizika ve, kje so “udarne” površine
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) return;
    
    const boxes = model.primitives.map(primitive => 
        calculateAxisAlignedBoundingBox(primitive.mesh)
    );
    node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});

// 8. Glavna update zanka
function update(time, dt) {
    // Preletimo vse node in pokličemo .update na njihovih komponentah
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
    
    // Pokličemo update logiko našega igralca
    player.update(time, dt);

    // Posodobimo fiziko
    physics.update(time, dt);
}

// 9. Render funkcija
function render() {
    renderer.render(scene, camera);
}

// 10. Funkcija za resize
function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

// 11. Zaženemo ResizeSystem in UpdateSystem
new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
