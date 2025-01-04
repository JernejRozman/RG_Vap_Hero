import { GLTFLoader } from 'engine/loaders/GLTFLoader.js';
import { rotateZ, rotateY } from './quat.js';

export class Hose {
    constructor() {
        this.make_hose();
    }

    async make_hose() {
        // Use a relative path that matches the file location in the 'game' folder.
        const modelPath = 'Powerwasher_Hose.gltf';

        try {
            this.loader_hose = new GLTFLoader();
            
            // Load the GLTF file.
            await this.loader_hose.load(new URL(modelPath, import.meta.url));
            
            // Load the default scene from the GLTF model.
            this.hose_scene = await this.loader_hose.loadScene(this.loader_hose.defaultScene);

            console.log('Hose loaded successfully:', this.hose_scene);
        } catch (error) {
            console.error('Error loading hose model:', error);
        }
    }

    update(camera, yaw) {
        let out = [0, 0, 0, 0];
        let angle = (yaw - 4) * (180 / Math.PI);

        rotateZ(out, camera.rotation, 1.57);
        rotateY(out, out, 3.14);

        let x = 0.3 * Math.sin((Math.PI * 2 * angle) / 360) + camera.translation[0];
        let y = 0.3 * Math.cos((Math.PI * 2 * angle) / 360) + camera.translation[2];
        let z = camera.translation[1] - 0.05;

        if (this.hose_scene && this.hose_scene.nodes[1]) {
            this.hose_scene.nodes[1].rotation = out;
            this.hose_scene.nodes[1].translation = [x, z, y];
        }
    }
}
