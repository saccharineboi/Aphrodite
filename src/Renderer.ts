import { downloadText,
         downloadImageWithMipmaps } from "./Util.js";
import { Input } from "./Input.js";
import { Vector2 } from "./Vector2.js";
import { Vector3 } from "./Vector3.js";
import { Vector4 } from "./Vector4.js";
import { Matrix4x4 } from "./Matrix4x4.js";

export type BufferDataType = Float32Array | Uint32Array;
export type TextureUsageType = GPUTextureUsage["TEXTURE_BINDING"] |
                               GPUTextureUsage["TEXTURE_BINDING"] |
                               GPUTextureUsage["COPY_SRC"] |
                               GPUTextureUsage["COPY_DST"] |
                               GPUTextureUsage["RENDER_ATTACHMENT"];

export class RendererQuery {
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
                callback(result[1] - result[0]);
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

export class Renderer {

    private constructor(private adapter: GPUAdapter,
                        private device: GPUDevice,
                        private canvas: HTMLCanvasElement,
                        private ctx: GPUCanvasContext)
    { }

    public createRendererQuery(count: number): RendererQuery {
        return new RendererQuery(this.device, count);
    }

    public createInputHandler(): Input {
        return new Input(this.canvas);
    }

    public getCanvasWidth(): number {
        return this.canvas.width;
    }

    public getCanvasHeight(): number {
        return this.canvas.height;
    }

    public resizeCanvas(width: number, height: number, callback?: () => void) {
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            if (callback) {
                callback();
            }
        }
    }

    public createCommandEncoder(): GPUCommandEncoder {
        return this.device.createCommandEncoder();
    }

    public submitCommandBuffers(commandBuffers: Array<GPUCommandBuffer>): void {
        this.device.queue.submit(commandBuffers);
    }

    public async createShaderModule(path: string): Promise<GPUShaderModule> {
        const source = await downloadText(path);
        const shaderDesc: GPUShaderModuleDescriptor = {
            code: source
        };
        return this.device.createShaderModule(shaderDesc);
    }

    public createBuffer(bufferDesc: GPUBufferDescriptor): GPUBuffer {
        return this.device.createBuffer(bufferDesc);
    }

    public createBufferWithData(bufferDesc: GPUBufferDescriptor,
                                data: BufferDataType): GPUBuffer {
        if (!bufferDesc.mappedAtCreation) {
            throw new Error("Aphrodite: GPU buffer must be mapped at creation");
        }
        const buffer = this.createBuffer(bufferDesc);
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

    public createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
        return this.device.createTexture(descriptor);
    }

    public createSampler(descriptor: GPUSamplerDescriptor): GPUSampler {
        return this.device.createSampler(descriptor);
    }

    public createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout {
        return this.device.createBindGroupLayout(descriptor);
    }

    public createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup {
        return this.device.createBindGroup(descriptor);
    }

    public writeBuffer(src: GPUBuffer, srcOffset: number, data: GPUAllowSharedBufferSource): void {
        this.device.queue.writeBuffer(src, srcOffset, data);
    }

    public writeVector2ToBuffer(src: GPUBuffer, srcOffset: number, data: Vector2): void {
        this.device.queue.writeBuffer(src,
                                      srcOffset,
                                      data.toFloat32Array() as GPUAllowSharedBufferSource);
    }

    public writeVector3ToBuffer(src: GPUBuffer, srcOffset: number, data: Vector3): void {
        this.device.queue.writeBuffer(src,
                                      srcOffset,
                                      data.toFloat32Array() as GPUAllowSharedBufferSource);
    }
    public writeVector4ToBuffer(src: GPUBuffer, srcOffset: number, data: Vector4): void {
        this.device.queue.writeBuffer(src,
                                      srcOffset,
                                      data.toFloat32Array() as GPUAllowSharedBufferSource);
    }

    public writeMatrix4x4ToBuffer(src: GPUBuffer, srcOffset: number, data: Matrix4x4): void {
        this.device.queue.writeBuffer(src,
                                      srcOffset,
                                      data.toFloat32Array() as GPUAllowSharedBufferSource);
    }

    public async createMipmappedTexture(path: string,
                                        format: GPUTextureFormat,
                                        usage: TextureUsageType): Promise<GPUTexture> {
        const data = await downloadImageWithMipmaps(path);
        const descriptor: GPUTextureDescriptor = {
            size: [ data[0].width, data[0].height ],
            mipLevelCount: data.length,
            format: format,
            usage: usage
        };
        const texture = this.device.createTexture(descriptor);
        data.forEach((bitmap: ImageBitmap, index: number) => {
            let width = (descriptor.size as Array<number>)[0] >> index;
            let height = (descriptor.size as Array<number>)[1] >> index;

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

    public createPipelineLayout(desc: GPUPipelineLayoutDescriptor): GPUPipelineLayout {
        return this.device.createPipelineLayout(desc);
    }

    public async createRenderPipeline(desc: GPURenderPipelineDescriptor): Promise<GPURenderPipeline> {
        return await this.device.createRenderPipelineAsync(desc);
    }

    public getCanvasTexture(): GPUTexture {
        return this.ctx.getCurrentTexture();
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

        return new Renderer(adapter, device, canvas, ctx);
    }
};
