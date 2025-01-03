// Player.js
import { FirstPersonController } from 'engine/controllers/FirstPersonController.js';

export class Player {
    constructor(camera, canvas) {
        // Povežemo kamero, platno in FPC
        this.camera = camera;
        this.canvas = canvas;

        // Na kamero dodamo FirstPersonController
        this.controller = new FirstPersonController(camera, canvas);
        this.camera.addComponent(this.controller);

        // Definiramo AABB (Axis-Aligned Bounding Box) za igralca
        this.camera.isDynamic = true;
        this.camera.aabb = {
            min: [-0.2, -0.2, -0.2],
            max: [0.2, 0.2, 0.2],
        };
    }

    update(time, dt) {
        // Če bi želeli neko dodatno logiko za igralca v vsakem frame-u,
        // jo vpišemo sem.
        // Tvoj FirstPersonController že vsebuje funkcijo update v svoji koda,
        // zato jo engine (oz. node) običajno sam kliče.

        // Primer: recimo, da bi morali ročno klicati FPC:
        // this.controller.update?.(time, dt);
    }
}
