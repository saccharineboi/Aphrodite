/// <reference types="dat.gui" />
declare const dat: typeof import("dat.gui");

import { Util } from "../src/Util.js";
import { Renderer } from "../src/Renderer.js";
import { Vector2 } from "../src/Vector2.js";
import { Vector3 } from "../src/Vector3.js";
import { Matrix4x4 } from "../src/Matrix4x4.js";

const MSAA_SAMPLES = 4;
const QUERY_BEGIN_AND_END = 2;

async function main() {
    const renderer = await Renderer.Init("aphrodite-output");
    renderer.resizeCanvas(innerWidth, innerHeight);

    const basicShaderModule = await renderer.createShaderModule("../shaders/basic.wgsl");

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

    const vertexBuffer = renderer.createBufferWithData(vertexBufferDesc, vertexData);

    const indexData = new Uint32Array([ 0, 2, 1, 0, 3, 2 ]);

    const indexBufferDesc: GPUBufferDescriptor = {
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    };

    const indexBuffer = renderer.createBufferWithData(indexBufferDesc, indexData);

    const transformBufferGPUDesc: GPUBufferDescriptor = {
        size: 512,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false,
    };
    const transformBufferGPU = renderer.createBuffer(transformBufferGPUDesc);

    const wallTexture = await renderer.createMipmappedTexture("../textures/wall",
                                                              "rgba8unorm",
                                                              GPUTextureUsage.COPY_DST |
                                                              GPUTextureUsage.TEXTURE_BINDING |
                                                              GPUTextureUsage.RENDER_ATTACHMENT);

    const wallTextureSamplerDesc: GPUSamplerDescriptor = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
        maxAnisotropy: 4
    };
    const wallTextureSampler = renderer.createSampler(wallTextureSamplerDesc);

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
    const uniformGroup0Layout = renderer.createBindGroupLayout(uniformGroup0LayoutDesc);

    const uniformGroup0Desc: GPUBindGroupDescriptor = {
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
    };
    const uniformGroup0 = renderer.createBindGroup(uniformGroup0Desc);

    const msaaTextureDesc: GPUTextureDescriptor = {
        size: [ renderer.getCanvasWidth(), renderer.getCanvasHeight()],
        sampleCount: MSAA_SAMPLES,
        format: navigator.gpu.getPreferredCanvasFormat(),
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };
    let msaaTexture = renderer.createTexture(msaaTextureDesc);
    let msaaTextureView = msaaTexture.createView();

    const depthTextureDesc: GPUTextureDescriptor = {
        size: [ renderer.getCanvasWidth(), renderer.getCanvasHeight(), 1 ],
        sampleCount: MSAA_SAMPLES,
        dimension: "2d",
        format: "depth32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    };

    let depthTexture = renderer.createTexture(depthTextureDesc);
    let depthTextureView = depthTexture.createView();

    const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
        bindGroupLayouts: [uniformGroup0Layout],
    };
    const pipelineLayout = renderer.createPipelineLayout(pipelineLayoutDesc);

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
            count: MSAA_SAMPLES
        }
    };

    const pipeline = await renderer.createRenderPipeline(pipelineDesc);

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

    const fpsElem = document.querySelector("#fps");
    if (!fpsElem) {
        throw new Error("Couldn't find FPS element");
    }

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

                fpsElem.innerHTML = this.fps.toFixed(0);
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

    Util.addVec3ToGUIFolder({
        parentFolder: cameraFolder,
        folderName: "Position",
        vec3: cameraState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });

    Util.addVec3ToGUIFolder({
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
    Util.addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Position",
        vec3: modelState.position,
        min: -10.0,
        max: 10.0,
        step: 0.01
    });
    Util.addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Rotation",
        vec3: modelState.rotation,
        min: 0.0,
        max: Math.PI * 2.0,
        step: 0.01
    });
    Util.addVec3ToGUIFolder({
        parentFolder: modelFolder,
        folderName: "Scale",
        vec3: modelState.scale,
        min: 0.0,
        max: 100.0,
        step: 0.01
    });
    modelFolder.add(modelState, "texcoordMultiplierFactor", 1.0, 50.0, 0.01);
    modelFolder.open();

    const timestampQuery = renderer.createTimestampQuery(QUERY_BEGIN_AND_END);
    const inputHandler = renderer.createInputHandler();

    const dt = Util.genDeltaTimeComputer();
    const render = async () => {
        renderer.resizeCanvas(innerWidth, innerHeight, () => {
            depthTexture.destroy();
            depthTextureDesc.size = [ innerWidth, innerHeight, 1 ];
            depthTexture = renderer.createTexture(depthTextureDesc);
            depthTextureView = depthTexture.createView();

            msaaTexture.destroy();
            msaaTextureDesc.size = [ innerWidth, innerHeight ];
            msaaTexture = renderer.createTexture(msaaTextureDesc);
            msaaTextureView = msaaTexture.createView();
        });
        if (inputHandler.isPressed("KeyW")) {
            console.log("W is pressed");
        }
        else if (inputHandler.isPressed("KeyS")) {
            console.log("S is pressed");
        }

        performanceState.update(dt());

        const canvasWidth = renderer.getCanvasWidth();
        const canvasHeight = renderer.getCanvasHeight();
        const projectionMatrix = Matrix4x4.GenPerspective(cameraState.fovy,
                                                          canvasWidth / canvasHeight,
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

        renderer.writeMatrix4x4ToBuffer(transformBufferGPU, 0, pvmMatrix);
        renderer.writeVector2ToBuffer(transformBufferGPU, 256, texcoordMultiplier);

        const colorTexture = renderer.getCanvasTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: msaaTextureView,
            resolveTarget: colorTextureView,
            clearValue: { r: (engineState.clearColor[0] ?? 0.0) / 255.0,
                          g: (engineState.clearColor[1] ?? 0.0) / 255.0,
                          b: (engineState.clearColor[2] ?? 0.0) / 255.0,
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
                querySet: timestampQuery.getQuerySet(),
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1
            }
        };

        const commandEncoder = renderer.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, renderer.getCanvasWidth(), renderer.getCanvasHeight(), 0.0, 1.0);
        renderpass.setPipeline(pipeline);
        renderpass.setBindGroup(0, uniformGroup0);
        renderpass.setVertexBuffer(0, vertexBuffer);
        renderpass.setIndexBuffer(indexBuffer, "uint32");
        renderpass.drawIndexed(indexData.length);
        renderpass.end();

        timestampQuery.resolve(commandEncoder);
        renderer.submitCommandBuffers([ commandEncoder.finish() ]);
        timestampQuery.map((value: BigInt) => {
            performanceState.totalRenderpass += Number(value) * 1e-6;
        });

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
