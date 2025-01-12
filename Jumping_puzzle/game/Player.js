import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';
import { Camera } from 'engine/core.js';
import { Physics } from './Physics.js';

export class Player {
    constructor(camera, canvas, scene) {
        this.camera = camera;
        this.canvas = canvas;
        this.controller = new FirstPersonController(camera, canvas);
        this.camera.addComponent(this.controller);

        this.camera.isDynamic = true;
        this.camera.aabb = {
            min: [-0.2, -0.2, -0.2],
            max: [0.2, 0.2, 0.2],
        };

        this.physics = new Physics(scene);
    }

    update(time, dt) {
        this.physics.update(time, dt);
    }
}