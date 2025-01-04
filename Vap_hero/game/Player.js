// Player.js
import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';
import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { Camera } from 'engine/core.js';
import { Hose } from './Hose';

export class Player {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.hose = new Hose();

        // 1. Ustvarimo in dodamo FirstPersonController kameri
        this.controller = new FirstPersonController(camera, canvas);
        this.camera.addComponent(this.controller);

        // 2. Nastavimo, da se kamera obnaša dinamično (npr. za kolizije)
        this.camera.isDynamic = true;
        this.camera.aabb = {
            min: [-0.2, -0.2, -0.2],
            max: [0.2, 0.2, 0.2],
        };


    }

    update(time, dt) {
        this.hose.update(this.camera, this.controller.yaw);

        // Če bi bilo treba ročno klicati FPC ali urejati logiko vsakega frame-a,
        // to storimo tukaj.
    }
}
