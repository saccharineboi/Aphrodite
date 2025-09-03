/// <reference types="dat.gui" />
declare const dat: typeof import("dat.gui");

import { resizeCanvas,
         downloadText,
         downloadImageWithMipmaps,
         addVec3ToGUIFolder,
         genDeltaTimeComputer } from "../src/Util.js";
import { Vector2 } from "../src/Vector2.js";
import { Vector3 } from "../src/Vector3.js";
import { Matrix4x4 } from "../src/Matrix4x4.js";
import { Input } from "../src/Input.js";

async function main() {
    if (!navigator.gpu) {
        throw new Error("WebGPU is not available");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("Failed to request an adapter");
    }

    const deviceDescriptor: GPUDeviceDescriptor = {
        requiredFeatures: [
            "timestamp-query"
        ]
    };
    const device = await adapter.requestDevice(deviceDescriptor);
    if (!device) {
        throw new Error("Failed to request a device");
    }

    const canvas = document.querySelector("#aphrodite-canvas") as undefined | HTMLCanvasElement;
    if (!canvas) {
        throw new Error("Canvas couldn't be found");
    }
    resizeCanvas(canvas);

    const ctx = canvas.getContext("webgpu");
    if (!ctx) {
        throw new Error("getContext() failed");
    }

    const canvasConfig: GPUCanvasConfiguration = {
        device: device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: "opaque"
    };
    ctx.configure(canvasConfig);

    const basicShaderSource = await downloadText("../shaders/basic.wgsl");
    const basicShaderDesc: GPUShaderModuleDescriptor = { code: basicShaderSource };
    const basicShaderModule = device.createShaderModule(basicShaderDesc)

    const colorState: GPUColorTargetState = {
        format: "bgra8unorm"
    };

    const aPosAttribDesc: GPUVertexAttribute = {
        shaderLocation: 0,
        offset: 0,
        format: "float32x3"
    };

    const aNormAttribDesc: GPUVertexAttribute = {
        shaderLocation: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3,
        format: "float32x3"
    };

    const aTexCoordAttribDesc: GPUVertexAttribute = {
        shaderLocation: 2,
        offset: Float32Array.BYTES_PER_ELEMENT * 6,
        format: "float32x2"
    };

    const vertexBufferLayoutDesc: GPUVertexBufferLayout = {
        attributes: [aPosAttribDesc, aNormAttribDesc, aTexCoordAttribDesc],
        arrayStride: Float32Array.BYTES_PER_ELEMENT * 8,
        stepMode: "vertex"
    };

    const vertexData = new Float32Array([
        -0.5, -0.5, 0.0,        0.0, 0.0, 1.0,      -0.5, -0.5,
        -0.5,  0.5, 0.0,        0.0, 0.0, 1.0,      -0.5,  0.5,
         0.5,  0.5, 0.0,        0.0, 0.0, 1.0,       0.5,  0.5,
         0.5, -0.5, 0.0,        0.0, 0.0, 1.0,       0.5, -0.5
    ]);

    const vertexBufferDesc: GPUBufferDescriptor = {
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    };

    const vertexBuffer = device.createBuffer(vertexBufferDesc);
    let writeArray = new Float32Array(vertexBuffer.getMappedRange());
    writeArray.set(vertexData);
    vertexBuffer.unmap();

    const indexData = new Uint32Array([ 0, 2, 1, 0, 3, 2 ]);

    const indexBufferDesc: GPUBufferDescriptor = {
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    };

    const indexBuffer = device.createBuffer(indexBufferDesc);
    const writeArrayU32 = new Uint32Array(indexBuffer.getMappedRange());
    writeArrayU32.set(indexData);
    indexBuffer.unmap();

    const transformBufferGPUDesc: GPUBufferDescriptor = {
        size: 512,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false,
    };
    const transformBufferGPU = device.createBuffer(transformBufferGPUDesc);

    const wallTextureData = await downloadImageWithMipmaps("../textures/wall");

    const wallTextureDescriptor: GPUTextureDescriptor = {
        size: [ wallTextureData[0].width, wallTextureData[1].height ],
        mipLevelCount: wallTextureData.length,
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    };
    const wallTexture = device.createTexture(wallTextureDescriptor);
    for (let i = 0; i < wallTextureData.length; ++i) {
        let newWidth = (wallTextureDescriptor.size as Array<number>)[0] >> i;
        let newHeight = (wallTextureDescriptor.size as Array<number>)[1] >> i;

        if (!newWidth) {
            newWidth = 1;
        }
        if (!newHeight) {
            newHeight = 1;
        }
        device.queue.copyExternalImageToTexture({source: wallTextureData[i]},
                                                {texture: wallTexture, mipLevel: i},
                                                [ newWidth, newHeight ]);
    }

    const wallTextureSamplerDesc: GPUSamplerDescriptor = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
        maxAnisotropy: 4
    };
    const wallTextureSampler = device.createSampler(wallTextureSamplerDesc);

    const uniformGroup0LayoutDesc: GPUBindGroupLayoutDescriptor = {
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {}
        }, {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 3,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {}
        }]
    };
    const uniformGroup0Layout = device.createBindGroupLayout(uniformGroup0LayoutDesc);
    const uniformGroup0 = device.createBindGroup({
        layout: uniformGroup0Layout,
        entries: [{
            binding: 0,
            resource: {
                offset: 0,
                buffer: transformBufferGPU
            }
        }, {
            binding: 1,
            resource: wallTexture.createView()
        }, {
            binding: 2,
            resource: wallTextureSampler
        }, {
            binding: 3,
            resource: {
                offset: 256,
                buffer: transformBufferGPU
            }
        }]
    });

    const msaaTextureDesc: GPUTextureDescriptor = {
        size: [ canvas.width, canvas.height],
        sampleCount: 4,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };
    let msaaTexture = device.createTexture(msaaTextureDesc);
    let msaaTextureView = msaaTexture.createView();

    const depthTextureDesc: GPUTextureDescriptor = {
        size: [ canvas.width, canvas.height, 1 ],
        sampleCount: 4,
        dimension: "2d",
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };

    let depthTexture = device.createTexture(depthTextureDesc);
    let depthTextureView = depthTexture.createView();

    const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
        bindGroupLayouts: [uniformGroup0Layout],
    };
    const pipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);

    const pipelineDesc: GPURenderPipelineDescriptor = {
        layout: pipelineLayout,
        vertex: {
            module: basicShaderModule,
            entryPoint: "vs_main",
            buffers: [vertexBufferLayoutDesc]
        },
        fragment: {
            module: basicShaderModule,
            entryPoint: "fs_main",
            targets: [colorState]
        },
        primitive: {
            topology: "triangle-list",
            frontFace: "ccw",
            cullMode: "back"
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: "greater-equal",
            format: "depth32float",
        },
        multisample: {
            count: 4
        }
    };

    const pipeline = await device.createRenderPipelineAsync(pipelineDesc);

    const gui = new dat.GUI({ autoPlace: false });
    const guiElem = document.querySelector("#gui") as HTMLElement;
    if (!guiElem) {
        throw new Error("GUI element for dat.gui doesn't exist");
    }

    guiElem.append(gui.domElement);

    const engineFolder = gui.addFolder("Engine");
    const engineState = {
        clearColor: [10, 10, 20]
    };
    engineFolder.addColor(engineState, "clearColor")
    engineFolder.open();

    const performanceFolder = gui.addFolder("Performance");
    const performanceState = {
        ms: 0,
        fps: 0,
        totalTimePassed: 0,
        delay: 1000,
        frameCount: 0,
        totalRenderpass: 0,
        renderpass: 0,
        update: function(dt: number) {
            this.frameCount += 1;
            this.totalTimePassed += dt;
            if (this.totalTimePassed >= this.delay) {
                this.ms = this.totalTimePassed / this.frameCount;
                this.fps = 1000.0 / this.ms;
                this.renderpass = this.totalRenderpass / this.frameCount;

                this.totalTimePassed = 0;
                this.totalRenderpass = 0;
                this.frameCount = 0;
            }
        }
    };
    performanceFolder.add(performanceState, "ms").step(0.00001).listen();
    performanceFolder.add(performanceState, "fps").step(0.00001).listen();
    performanceFolder.add(performanceState, "renderpass").step(0.00001).listen();
    performanceFolder.add(performanceState, "delay");
    performanceFolder.open();

    const cameraFolder = gui.addFolder("Camera");
    const cameraState = {
        position: new Vector3(0.0, 0.0, 2.0),
        rotation: new Vector3(0.0, 0.0, 0.0),
        fovy: Math.PI / 2,
    };

    addVec3ToGUIFolder({
        parentFolder: cameraFolder,
        folderName: "Position",
        vec3: cameraState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });

    addVec3ToGUIFolder({
        parentFolder: cameraFolder,
        folderName: "Rotation",
        vec3: cameraState.rotation,
        min: -Math.PI / 2,
        max: Math.PI / 2,
        step: 0.01
    });
    cameraFolder.add(cameraState, "fovy", Math.PI / 10, Math.PI, 0.01);
    cameraFolder.open();

    const modelFolder = gui.addFolder("Model");
    const modelState = {
        position: new Vector3(0, -3, 0),
        rotation: new Vector3(Math.PI / 2, 0, 0),
        scale: new Vector3(100.0, 100.0, 100.0),
        texcoordMultiplierFactor: 20,
    };
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Position",
        vec3: modelState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Rotation",
        vec3: modelState.rotation,
        min: 0.0,
        max: Math.PI * 2.0,
        step: 0.01
    });
    addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Scale",
        vec3: modelState.scale,
        min: 0.0,
        max: 10.0,
        step: 0.01
    });
    modelFolder.add(modelState, "texcoordMultiplierFactor", 1.0, 50.0, 0.01);
    modelFolder.open();

    const querySetDesc: GPUQuerySetDescriptor = {
        type: "timestamp",
        count: 2
    };
    const querySet = device.createQuerySet(querySetDesc);

    const queryResolveBufferDesc: GPUBufferDescriptor = {
        size: 2 * Float64Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
    };
    const queryResolveBuffer = device.createBuffer(queryResolveBufferDesc);

    const queryResultBufferDesc: GPUBufferDescriptor = {
        size: 2 * Float64Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    };
    const queryResultBuffer = device.createBuffer(queryResultBufferDesc);

    const input = new Input(canvas);

    const dt = genDeltaTimeComputer();
    const render = async () => {
        resizeCanvas(canvas, (width: number, height: number) => {
            depthTexture.destroy();
            depthTextureDesc.size = [ width, height, 1 ];
            depthTexture = device.createTexture(depthTextureDesc);
            depthTextureView = depthTexture.createView();

            msaaTexture.destroy();
            msaaTextureDesc.size = [ width, height ];
            msaaTexture = device.createTexture(msaaTextureDesc);
            msaaTextureView = msaaTexture.createView();
        });

        if (input.isPressed("KeyW")) {
            console.log("W is pressed");
        }
        else if (input.isPressed("KeyS")) {
            console.log("S is pressed");
        }

        const deltaTime = dt();
        performanceState.update(deltaTime);

        const projectionMatrix = Matrix4x4.GenPerspective(cameraState.fovy,
                                                          canvas.width / canvas.height,
                                                          1.0, 0.0);

        const viewMatrix = Matrix4x4.GenView(cameraState.position,
                                             cameraState.rotation);

        const translationMatrix = Matrix4x4.GenTranslation(modelState.position);
        const rotationMatrix = Matrix4x4.GenRotationXYZ(modelState.rotation);
        const scaleMatrix = Matrix4x4.GenScale(modelState.scale);

        const pvmMatrix = projectionMatrix.mul(viewMatrix)
                                          .mul(translationMatrix)
                                          .mul(rotationMatrix)
                                          .mul(scaleMatrix);

        const texcoordMultiplierFactor = modelState.texcoordMultiplierFactor;
        const texcoordMultiplier = new Vector2(texcoordMultiplierFactor,
                                               texcoordMultiplierFactor);

        device.queue.writeBuffer(transformBufferGPU,
                                 0,
                                 pvmMatrix.toFloat32Array() as GPUAllowSharedBufferSource);
        device.queue.writeBuffer(transformBufferGPU,
                                 256,
                                 texcoordMultiplier.toFloat32Array() as GPUAllowSharedBufferSource);

        const colorTexture = ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: msaaTextureView,
            resolveTarget: colorTextureView,
            clearValue: { r: engineState.clearColor[0] / 255.0,
                          g: engineState.clearColor[1] / 255.0,
                          b: engineState.clearColor[2] / 255.0,
                          a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: depthTextureView,
            depthClearValue: 0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
        };

        const renderpassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment,
            timestampWrites: {
                querySet: querySet,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1
            }
        };

        const commandEncoder = device.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, canvas.width, canvas.height, 0.0, 1.0);
        renderpass.setPipeline(pipeline);
        renderpass.setBindGroup(0, uniformGroup0);
        renderpass.setVertexBuffer(0, vertexBuffer);
        renderpass.setIndexBuffer(indexBuffer, "uint32");
        renderpass.drawIndexed(indexData.length);
        renderpass.end();
        commandEncoder.resolveQuerySet(querySet,
                                       0,
                                       querySet.count,
                                       queryResolveBuffer,
                                       0);
        if (queryResultBuffer.mapState === "unmapped") {
            commandEncoder.copyBufferToBuffer(queryResolveBuffer, queryResultBuffer);
        }

        device.queue.submit([commandEncoder.finish()]);
        if (queryResultBuffer.mapState === "unmapped") {
            queryResultBuffer.mapAsync(GPUMapMode.READ).then(() => {
                const result = new BigInt64Array(queryResultBuffer.getMappedRange());
                performanceState.totalRenderpass += Number(result[1] - result[0]) * 1e-6;
                queryResultBuffer.unmap();
            });
        }

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

try {
    main();
}
catch (e: any) {
    const errorElem = document.querySelector("#error");
    if (errorElem) {
        (errorElem as HTMLDivElement).style.display = "block";
        errorElem.innerHTML = e.toString();
    }
}
