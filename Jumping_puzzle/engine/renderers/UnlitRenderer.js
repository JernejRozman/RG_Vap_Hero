import { mat4, vec3 } from 'glm';

import * as WebGPU from '../WebGPU.js';

import { Camera, Model, Light } from '../core.js';

import {
    getLocalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,

    // Dodano
    getGlobalModelMatrix,

} from '../core/SceneUtils.js';

import { BaseRenderer } from './BaseRenderer.js';

const vertexBufferLayout = {
    arrayStride: 32,
    attributes: [
        {
            name: 'position',
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3',
        },
        {
            name: 'texcoords',
            shaderLocation: 1,
            offset: 12,
            format: 'float32x2',
        },
        {
            name: 'normal',
            shaderLocation: 2,
            offset: 20,
            format: 'float32x3',
        },
    ],
};

export class UnlitRenderer extends BaseRenderer {

    constructor(canvas) {
        super(canvas);
    }

    async initialize() {
        await super.initialize();

        const code = await fetch(new URL('UnlitRenderer.wgsl', import.meta.url))
            .then(response => response.text());
        const module = this.device.createShaderModule({ code });

        this.pipeline = await this.device.createRenderPipelineAsync({
            layout: 'auto',
            vertex: {
                module,
                buffers: [ vertexBufferLayout ],
            },
            fragment: {
                module,
                targets: [{ format: this.format }],
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });

        this.recreateDepthTexture();
    }

    recreateDepthTexture() {
        this.depthTexture?.destroy();
        this.depthTexture = this.device.createTexture({
            format: 'depth24plus',
            size: [this.canvas.width, this.canvas.height],
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    prepareNode(node) {
        if (this.gpuObjects.has(node)) {
            return this.gpuObjects.get(node);
        }

        const modelUniformBuffer = this.device.createBuffer({
            size: 128,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const modelBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: { buffer: modelUniformBuffer } },
            ],
        });

        const gpuObjects = { modelUniformBuffer, modelBindGroup };
        this.gpuObjects.set(node, gpuObjects);
        return gpuObjects;
    }

    prepareCamera(camera) {
        if (this.gpuObjects.has(camera)) return this.gpuObjects.get(camera);
    
        const cameraUniformBuffer = this.device.createBuffer({
            size: 144, // 2 * 64 (matrices) + 16 (position + padding)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    
        const cameraBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: cameraUniformBuffer } },
            ],
        });
    
        const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
        this.gpuObjects.set(camera, gpuObjects);
        return gpuObjects;
    }

    updateCamera(camera) {
        const { cameraUniformBuffer } = this.prepareCamera(camera);
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        const position = camera.getComponentOfType(Transform).translation;
    
        this.device.queue.writeBuffer(cameraUniformBuffer, 0, new Float32Array(viewMatrix));
        this.device.queue.writeBuffer(cameraUniformBuffer, 64, new Float32Array(projectionMatrix));
        this.device.queue.writeBuffer(cameraUniformBuffer, 128, new Float32Array([...position, 0])); // Add position
    }

    prepareTexture(texture) {
        if (this.gpuObjects.has(texture)) {
            return this.gpuObjects.get(texture);
        }

        const { gpuTexture } = this.prepareImage(texture.image); // ignore sRGB
        const { gpuSampler } = this.prepareSampler(texture.sampler);

        const gpuObjects = { gpuTexture, gpuSampler };
        this.gpuObjects.set(texture, gpuObjects);
        return gpuObjects;
    }

    prepareMaterial(material) {
        if (this.gpuObjects.has(material)) {
            return this.gpuObjects.get(material);
        }

        const baseTexture = this.prepareTexture(material.baseTexture);

        const materialUniformBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const materialBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                { binding: 0, resource: { buffer: materialUniformBuffer } },
                { binding: 1, resource: baseTexture.gpuTexture.createView() },
                { binding: 2, resource: baseTexture.gpuSampler },
            ],
        });

        const gpuObjects = { materialUniformBuffer, materialBindGroup };
        this.gpuObjects.set(material, gpuObjects);
        return gpuObjects;
    }
    /*
    ###########################################################################################
    ###########################################################################################
    ########################### DELO S SVETLOBO ########################  START   #############
    ###########################################################################################
    ###########################################################################################
    */
    prepareLight(light) {
        if (this.gpuObjects.has(light)) return this.gpuObjects.get(light);
    
        const lightUniformBuffer = this.device.createBuffer({
            size: 80,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    
        const lightBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(3),
            entries: [
                { binding: 0, resource: { buffer: lightUniformBuffer } },
            ],
        });
    
        const gpuObjects = { lightUniformBuffer, lightBindGroup };
        this.gpuObjects.set(light, gpuObjects);
        return gpuObjects;
    }
    
    updateLight(light) {
        const { lightUniformBuffer } = this.prepareLight(light);
        this.device.queue.writeBuffer(lightUniformBuffer, 0, new Float32Array([
            ...light.position, 0,
            ...light.color, 0,
            ...light.ambient, 0,
            ...light.smer_luci, 0,
            light.sirina_svetlobnega_snopa,
            light.faktor_usmerjenosti,
        ]));
    }
    


        /*
    ###########################################################################################
    ###########################################################################################
    ########################### DELO S SVETLOBO #######################  END    ###############
    ###########################################################################################
    ###########################################################################################
    */



    render(scene, camera) {
        if (this.depthTexture.width !== this.canvas.width || this.depthTexture.height !== this.canvas.height) {
            this.recreateDepthTexture();
        }

        const encoder = this.device.createCommandEncoder();
        this.renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: [1, 1, 1, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'discard',
            },
        });
        this.renderPass.setPipeline(this.pipeline);

        const cameraComponent = camera.getComponentOfType(Camera);
        const viewMatrix = getGlobalViewMatrix(camera);
        const projectionMatrix = getProjectionMatrix(camera);
        const { cameraUniformBuffer, cameraBindGroup } = this.prepareCamera(cameraComponent);
        this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
        this.device.queue.writeBuffer(cameraUniformBuffer, 64, projectionMatrix);
        this.renderPass.setBindGroup(0, cameraBindGroup);

        /*
    ###########################################################################################
    ###########################################################################################
    ########################### DELO S SVETLOBO #####################   START   ###############
    ###########################################################################################
    ###########################################################################################
    */
        const light = scene.find(node => node.getComponentOfType(Light));
        const lightComponent = light.getComponentOfType(Light);
        const lightPosition = mat4.getTranslation(vec3.create(), getGlobalModelMatrix(light));
        const { lightUniformBuffer, lightBindGroup } = this.prepareLight(lightComponent);
        this.device.queue.writeBuffer(lightUniformBuffer, 0, new Float32Array([
            ...lightPosition, 0, 
            ...lightComponent.color, 0,
            ...lightComponent.ambient, 0,
            ...lightComponent.smer_luci, 0,
            lightComponent.sirina_svetlobnega_snopa,
            lightComponent.faktor_usmerjenosti,
        ]));
        this.renderPass.setBindGroup(3, lightBindGroup);

        /*
    ###########################################################################################
    ###########################################################################################
    ########################### DELO S SVETLOBO ###############   END  ########################
    ###########################################################################################
    ###########################################################################################
    */

        this.renderNode(scene);

        this.renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    renderNode(node, modelMatrix = mat4.create()) {
        const localMatrix = getLocalModelMatrix(node);
        modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
        const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);

        const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
        this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
        this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
        this.renderPass.setBindGroup(1, modelBindGroup);

        for (const model of node.getComponentsOfType(Model)) {
            this.renderModel(model);
        }

        for (const child of node.children) {
            this.renderNode(child, modelMatrix);
        }
    }

    renderModel(model) {
        for (const primitive of model.primitives) {
            this.renderPrimitive(primitive);
        }
    }

    renderPrimitive(primitive) {
        const { materialUniformBuffer, materialBindGroup } = this.prepareMaterial(primitive.material);
        this.device.queue.writeBuffer(materialUniformBuffer, 0, new Float32Array(primitive.material.baseFactor));
        this.renderPass.setBindGroup(2, materialBindGroup);

        const { vertexBuffer, indexBuffer } = this.prepareMesh(primitive.mesh, vertexBufferLayout);
        this.renderPass.setVertexBuffer(0, vertexBuffer);
        this.renderPass.setIndexBuffer(indexBuffer, 'uint32');

        this.renderPass.drawIndexed(primitive.mesh.indices.length);
    }

}
