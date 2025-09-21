import { Util } from "./Util.js";
import { Vector2 } from "./Vector2.js";
import { Vector4 } from "./Vector4.js";
import { Matrix4x4 } from "./Matrix4x4.js";
import { EngineState } from "./DevUI.js";
import { Mesh } from "./Mesh.js";

type BufferDataType = Float32Array | Uint32Array;
type TextureUsageType = GPUTextureUsage["TEXTURE_BINDING"] |
                        GPUTextureUsage["TEXTURE_BINDING"] |
                        GPUTextureUsage["COPY_SRC"] |
                        GPUTextureUsage["COPY_DST"] |
                        GPUTextureUsage["RENDER_ATTACHMENT"];

class TimestampQuery {
    private device: GPUDevice;
    private querySet: GPUQuerySet;
    private queryResolveBuffer: GPUBuffer;
    private queryResultBuffer: GPUBuffer;

    public getQuerySet(): GPUQuerySet {
        return this.querySet;
    }

    public resolve(encoder: GPUCommandEncoder): void {
        encoder.resolveQuerySet(this.querySet,
                                0,
                                this.querySet.count,
                                this.queryResolveBuffer,
                                0);
        if (this.queryResultBuffer.mapState === "unmapped") {
            encoder.copyBufferToBuffer(this.queryResolveBuffer, this.queryResultBuffer);
        }
    }

    public map(callback: (value: BigInt) => void) {
        if (this.queryResultBuffer.mapState === "unmapped") {
            this.queryResultBuffer.mapAsync(GPUMapMode.READ).then(() => {
                const result = new BigInt64Array(this.queryResultBuffer.getMappedRange());
                const resultBegin = result[0] ?? BigInt(0);
                const resultEnd = result[1] ?? BigInt(0);
                callback(resultEnd - resultBegin);
                this.queryResultBuffer.unmap();
            })
        }
    }

    public constructor(device: GPUDevice, count: number) {
        this.device = device;

        const querySetDesc: GPUQuerySetDescriptor = {
            type: "timestamp",
            count: count
        };
        this.querySet = this.device.createQuerySet(querySetDesc);

        const queryResolveBufferDesc: GPUBufferDescriptor = {
            size: count * Float64Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
        };
        this.queryResolveBuffer = this.device.createBuffer(queryResolveBufferDesc);

        const queryResultBufferDesc: GPUBufferDescriptor = {
            size: count * Float64Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        };
        this.queryResultBuffer = this.device.createBuffer(queryResultBufferDesc);
    }
};

interface AbstractPipeline {

};

interface RenderPipelineParams {
    device: GPUDevice;
    ctx: GPUCanvasContext;
    canvas: HTMLCanvasElement;
};

interface RenderPipeline extends AbstractPipeline {
    resize(width: number, height: number): void;
};

interface BasicRenderPipelineParams extends RenderPipelineParams {
    depthTextureDesc: GPUTextureDescriptor;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;

    pipeline: GPURenderPipeline;
    timestampQuery: TimestampQuery;

    bindGroupLayout: GPUBindGroupLayout;
    transformBuffer: GPUBuffer;
};

interface BasicRenderPipelineBuildCommandBufferParams {
    engineState: EngineState;
    bindGroup: GPUBindGroup;
    buffers: BasicRenderPipelineBuffers;
};

interface BasicRenderPipelineBuffers {
    vbo: GPUBuffer;
    ebo: GPUBuffer;
    eboType: GPUIndexFormat;
    eboElementCount: number;
};

class BasicRenderPipeline implements RenderPipeline {

    public constructor(private params: BasicRenderPipelineParams) { }

    public resize(width: number, height: number): void {
        this.params.depthTexture.destroy();
        this.params.depthTextureDesc.size = [ width, height, 1 ];
        this.params.depthTexture = this.params.device.createTexture(this.params.depthTextureDesc);
        this.params.depthTextureView = this.params.depthTexture.createView();
    }

    public setPVM(pvm: Matrix4x4): void {
        this.params.device.queue.writeBuffer(this.params.transformBuffer,
                                             0,
                                             pvm.toFloat32Array() as GPUAllowSharedBufferSource);
    }

    public setTextureMultiplier(multiplier: number): void {
        const multiplierVec2 = new Vector2(multiplier, multiplier);
        this.params.device.queue.writeBuffer(this.params.transformBuffer,
                                             256,
                                             multiplierVec2.toFloat32Array() as GPUAllowSharedBufferSource);
    }

    public buildCommandBuffer(cmdParams: BasicRenderPipelineBuildCommandBufferParams): GPUCommandBuffer {
        const colorTexture = this.params.ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: colorTextureView,
            clearValue: { r: (cmdParams.engineState.clearColor[0] ?? 0.0) / 255.0,
                          g: (cmdParams.engineState.clearColor[1] ?? 0.0) / 255.0,
                          b: (cmdParams.engineState.clearColor[2] ?? 0.0) / 255.0,
                          a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.params.depthTextureView,
            depthClearValue: 0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
        };

        const renderpassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment,
            timestampWrites: {
                querySet: this.params.timestampQuery.getQuerySet(),
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1
            }
        };

        const commandEncoder = this.params.device.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, this.params.canvas.width, this.params.canvas.height, 0.0, 1.0);
        renderpass.setPipeline(this.params.pipeline);
        renderpass.setBindGroup(0, cmdParams.bindGroup);
        renderpass.setVertexBuffer(0, cmdParams.buffers.vbo);
        renderpass.setIndexBuffer(cmdParams.buffers.ebo, cmdParams.buffers.eboType);
        renderpass.drawIndexed(cmdParams.buffers.eboElementCount);
        renderpass.end();

        this.params.timestampQuery.resolve(commandEncoder);
        return commandEncoder.finish();
    }

    public obtainRenderpassMS(callback: (value: BigInt) => void): void {
        this.params.timestampQuery.map((value: BigInt) => callback(value));
    }

    public createBindGroup(texture: GPUTexture,
                           sampler: GPUSampler): GPUBindGroup {
        const desc: GPUBindGroupDescriptor = {
            layout: this.params.bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    offset: 0,
                    buffer: this.params.transformBuffer
                }
            }, {
                binding: 1,
                resource: texture.createView()
            }, {
                binding: 2,
                resource: sampler
            }, {
                binding: 3,
                resource: {
                    offset: 256,
                    buffer: this.params.transformBuffer
                }
            }]
        };
        return this.params.device.createBindGroup(desc);
    }

    private createBufferWithData(bufferDesc: GPUBufferDescriptor,
                                 data: BufferDataType): GPUBuffer {
        if (!bufferDesc.mappedAtCreation) {
            throw new Error("Aphrodite: GPU buffer must be mapped at creation");
        }
        const buffer = this.params.device.createBuffer(bufferDesc);
        let writeArray: BufferDataType | undefined;
        if (data instanceof Float32Array) {
            writeArray = new Float32Array(buffer.getMappedRange());
        }
        else if (data instanceof Uint32Array) {
            writeArray = new Uint32Array(buffer.getMappedRange());
        }
        if (!writeArray) {
            throw new Error("Aphrodite: data is of incorrect type");
        }
        writeArray.set(data);
        buffer.unmap();
        return buffer;
    }

    public createBuffersFromMesh(mesh: Mesh): BasicRenderPipelineBuffers {
        const vertexBufferDesc: GPUBufferDescriptor = {
            size: mesh.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        };
        const vertexBuffer = this.createBufferWithData(vertexBufferDesc,
                                                       mesh.vertices);

        const indexBufferDesc: GPUBufferDescriptor = {
            size: mesh.indices.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true
        };
        const indexBuffer = this.createBufferWithData(indexBufferDesc,
                                                      mesh.indices);
        return {
            vbo: vertexBuffer,
            ebo: indexBuffer,
            eboType: "uint32",
            eboElementCount: mesh.indices.length,
        };
    };
};

export class Renderer {

    private constructor(private device: GPUDevice,
                        private canvas: HTMLCanvasElement,
                        private ctx: GPUCanvasContext)
    { }

    public async createBasicRenderPipeline(): Promise<BasicRenderPipeline> {
        const source = await Util.downloadText("../shaders/basic.wgsl");
        const shaderDesc: GPUShaderModuleDescriptor = {
            code: source
        };
        const shaderModule = this.device.createShaderModule(shaderDesc);

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
        const bindGroupLayout = this.device.createBindGroupLayout(uniformGroup0LayoutDesc);

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [ this.canvas.width, this.canvas.height, 1 ],
            dimension: "2d",
            format: "depth32float",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        };

        let depthTexture = this.device.createTexture(depthTextureDesc);
        let depthTextureView = depthTexture.createView();

        const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
            bindGroupLayouts: [bindGroupLayout],
        };
        const pipelineLayout = this.device.createPipelineLayout(pipelineLayoutDesc);

        const colorState: GPUColorTargetState = {
            format: "bgra8unorm"
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [vertexBufferLayoutDesc]
            },
            fragment: {
                module: shaderModule,
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
        };
        const pipeline = this.device.createRenderPipeline(pipelineDesc);
        const timestampQuery = new TimestampQuery(this.device, 2);

        const transformBufferDesc: GPUBufferDescriptor = {
            size: 512,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: false,
        };
        const transformBuffer = this.device.createBuffer(transformBufferDesc);

        const device = this.device;
        const ctx = this.ctx;
        const canvas = this.canvas;
        return new BasicRenderPipeline({
            device,
            ctx,
            canvas,

            depthTextureDesc,
            depthTexture,
            depthTextureView,

            pipeline,
            timestampQuery,

            bindGroupLayout,
            transformBuffer,
        });
    }

    public getCanvasDimensions(): Vector2 {
        return new Vector2(this.canvas.width, this.canvas.height);
    }

    public resizeCanvas(callback?: (width: number, height: number) => void) {
        const clientWidth = this.canvas.clientWidth;
        const clientHeight = this.canvas.clientHeight;
        if (this.canvas.width !== clientWidth || this.canvas.height !== clientHeight) {
            this.canvas.width = clientWidth;
            this.canvas.height = clientHeight;
            if (callback) {
                callback(clientWidth, clientHeight);
            }
        }
    }

    public submitCommandBuffers(commandBuffers: Array<GPUCommandBuffer>): void {
        this.device.queue.submit(commandBuffers);
    }

    public createSampler(desc: GPUSamplerDescriptor): GPUSampler {
        return this.device.createSampler(desc);
    }

    public createDefaultSamplerDescriptor(anisotropy: number): GPUSamplerDescriptor {
        const desc: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: anisotropy,
        };
        return desc;
    }

    public async createMipmappedTexture(path: string,
                                        format: GPUTextureFormat,
                                        usage: TextureUsageType): Promise<GPUTexture> {
        const data = await Util.downloadImageWithMipmaps(path);
        if (!data[0]) {
            throw new Error("Aphrodite: texture base doesn't exist");
        }

        const baseWidth = data[0].width;
        const baseHeight = data[0].height;

        const descriptor: GPUTextureDescriptor = {
            size: [ baseWidth, baseHeight ],
            mipLevelCount: data.length,
            format: format,
            usage: usage
        };
        const texture = this.device.createTexture(descriptor);
        data.forEach((bitmap: ImageBitmap, index: number) => {
            let width = baseWidth >> index;
            let height = baseHeight >> index;

            if (!width) {
                width = 1;
            }
            if (!height) {
                height = 1;
            }
            this.device.queue.copyExternalImageToTexture({
                source: bitmap
            }, {
                texture: texture,
                mipLevel: index
            },
            [ width, height ]);
        });
        return texture;
    }

    public createCheckerboardTexture(lightColor: Vector4,
                                     darkColor: Vector4,
                                     usage: TextureUsageType): GPUTexture {
        const data = new Uint8ClampedArray([
            ...lightColor, ...darkColor,
            ...darkColor, ...lightColor,
        ]);
        const imgData: ImageData = new ImageData(data, 2);

        const descriptor: GPUTextureDescriptor = {
            size: [ 2, 2 ],
            mipLevelCount: 1,
            format: "rgba8unorm",
            usage,
        };
        const texture = this.device.createTexture(descriptor);
        this.device.queue.copyExternalImageToTexture({
            source: imgData
        }, {
            texture,
            mipLevel: 0,
        },
        [ imgData.width, imgData.height ]);
        return texture;
    }

    public static async Init(canvasID: string): Promise<Renderer> {
        if (!navigator.gpu) {
            throw new Error("Aphrodite: WebGPU is not available");
        }

        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: "high-performance"
        });
        if (!adapter) {
            throw new Error("Aphrodite: Failed to request an adapter");
        }

        const deviceDescriptor: GPUDeviceDescriptor = {
            requiredFeatures: [ "timestamp-query" ]
        };
        const device = await adapter.requestDevice(deviceDescriptor);
        if (!device) {
            throw new Error("Aphrodite: Failed to request a device");
        }

        const canvas = document.getElementById(canvasID) as HTMLCanvasElement | undefined;
        if (!canvas) {
            throw new Error(`Aphrodite: canvas with id '${canvasID}' not found`);
        }

        const ctx = canvas.getContext("webgpu");
        if (!ctx) {
            throw new Error("Aphrodite: Failed to retrieve a context");
        }

        const canvasConfig: GPUCanvasConfiguration = {
            device: device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: "opaque"
        };
        ctx.configure(canvasConfig);

        return new Renderer(device, canvas, ctx);
    }
};
