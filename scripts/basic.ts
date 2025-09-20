/// <reference types="dat.gui" />
declare const dat: typeof import("dat.gui");

import { Util } from "../src/Util.js";
import { Renderer } from "../src/Renderer.js";
import { Vector2 } from "../src/Vector2.js";
import { Vector3 } from "../src/Vector3.js";
import { Matrix4x4 } from "../src/Matrix4x4.js";
import { DevUI,
         EngineState,
         CameraState } from "../src/DevUI.js";

const MSAA_SAMPLES = 4;
const QUERY_BEGIN_AND_END = 2;

async function main() {
    const renderer = await Renderer.Init("aphrodite-output");

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

    const timestampQuery = renderer.createTimestampQuery(QUERY_BEGIN_AND_END);
    // const inputHandler = renderer.createInputHandler();

    const engineState = new EngineState();
    engineState.setClearColor(new Vector3(0.1, 0.1, 0.2))

    const cameraState = new CameraState();
    const devUI = new DevUI(engineState, cameraState, { autoPlace: false });

    const dt = Util.genDeltaTimeComputer();
    let totalTime = 0.0;
    const render = async () => {
        renderer.resizeCanvas((newWidth, newHeight) => {
            depthTexture.destroy();
            depthTextureDesc.size = [ newWidth, newHeight, 1 ];
            depthTexture = renderer.createTexture(depthTextureDesc);
            depthTextureView = depthTexture.createView();

            msaaTexture.destroy();
            msaaTextureDesc.size = [ newWidth, newHeight ];
            msaaTexture = renderer.createTexture(msaaTextureDesc);
            msaaTextureView = msaaTexture.createView();
        });

        /*
        if (inputHandler.isPressed("KeyW")) {
            console.log("W is pressed");
        }
        else if (inputHandler.isPressed("KeyS")) {
            console.log("S is pressed");
        }
        */

        const deltaTime = dt();
        totalTime += deltaTime;
        devUI.update(deltaTime);

        const canvasWidth = renderer.getCanvasWidth();
        const canvasHeight = renderer.getCanvasHeight();
        const projectionMatrix = Matrix4x4.GenPerspective(cameraState.fovy,
                                                          canvasWidth / canvasHeight,
                                                          1.0, 0.0);

        const viewMatrix = Matrix4x4.GenView(cameraState.position,
                                             cameraState.rotation);

        const translationMatrix = Matrix4x4.GenTranslation(new Vector3(0, 0, -3));
        const rotationMatrix = Matrix4x4.GenRotationXYZ(new Vector3(0.0, 0.0, totalTime * 1e-3));
        const scaleMatrix = Matrix4x4.GenScale(new Vector3(1, 1, 1));

        const pvmMatrix = projectionMatrix.mul(viewMatrix)
                                          .mul(translationMatrix)
                                          .mul(rotationMatrix)
                                          .mul(scaleMatrix);

        const texcoordMultiplierFactor = 2.0;
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
            devUI.addRenderpassMS(Number(value) * 1e-6);
        });

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

try {
    main();
}
catch (e) {
    if (e && typeof e.toString === "function") {
        console.error(e.toString());
    }
    else {
        console.error("Unknown exception");
    }
}
