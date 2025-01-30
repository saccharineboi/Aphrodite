// Copyright (C) 2025 Omar Huseynov
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export class AphroditeException {
    private timestamp: Date;

    public constructor(private className: string,
                       private functionName: string,
                       private message: string) {
        this.timestamp = new Date();
    }

    public getClassName(): string       { return this.className; }
    public getFunctionName(): string    { return this.functionName; }
    public getMessage(): string         { return this.message; }

    public toString(): string
    {
        const hours = this.timestamp.getHours();
        const minutes = this.timestamp.getMinutes();
        const seconds = this.timestamp.getSeconds();
        const milliseconds = this.timestamp.getMilliseconds()

        return `[${hours}:${minutes}:${seconds}.${milliseconds}] Aphrodite Exception at ${this.className}:${this.functionName}: ${this.message}`
    }
};

export function $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
        throw new AphroditeException("", "$", `element with id=${id} doesn't exist`);
    }
    return el;
}

export class Aphrodite {
    private device: GPUDevice;
    private canvas: HTMLCanvasElement;
    private ctx: GPUCanvasContext;

    private lastTime: number;
    private dt: number;

    public static async Create(canvasId: string): Promise<Aphrodite> {
        if (!navigator.gpu) {
            throw new AphroditeException("Aphrodite", "Init", "WebGPU isn't supported");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new AphroditeException("Aphrodite", "Init", "Adapter is NULL");
        }

        const device = await adapter.requestDevice();
        if (!device) {
            throw new AphroditeException("Aphrodite", "Init", "Device is NULL");
        }

        return new Aphrodite(canvasId, device);
    }

    public constructor(canvasId: string, device: GPUDevice) {
        this.device = device;
        this.canvas = $(canvasId) as HTMLCanvasElement;
        this.ctx = this.configureContext();
        this.resizeCanvas();

        this.lastTime = 0.0;
        this.dt = 0.0;
    }

    public async createShaderModuleFromURL(url: string): Promise<GPUShaderModule> {
        const response = await fetch(url);
        const code = await response.text();
        const shaderDesc: GPUShaderModuleDescriptor = { code: code };
        return this.device.createShaderModule(shaderDesc);
    }

    public async createTextureFromURL(url: string, format: GPUTextureFormat, usage: GPUTextureUsageFlags): Promise<GPUTexture> {
        const response = await fetch(url);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        const texDesc: GPUTextureDescriptor = {
            size: {
                width: bitmap.width,
                height: bitmap.height
            },
            format: format,
            usage: usage
        };
        const texture = this.device.createTexture(texDesc);
        this.device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, texDesc.size);
        return texture
    }

    public createCommonSampler2D(): GPUSampler {
        return this.device.createSampler({
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear"
        });
    }

    public createPipelineLayout(bindGroupLayouts: GPUBindGroupLayout[]): GPUPipelineLayout {
        const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = { bindGroupLayouts: bindGroupLayouts };
        return this.device.createPipelineLayout(pipelineLayoutDesc);
    }

    public createBindGroupLayout(entries: GPUBindGroupLayoutEntry[]): GPUBindGroupLayout {
        return this.device.createBindGroupLayout({
            entries: entries
        });
    }

    public createBindGroup(layout: GPUBindGroupLayout, buffers: GPUBuffer[], textures: GPUTexture[], samplers: GPUSampler[]) : GPUBindGroup {
        const entriesArray: GPUBindGroupEntry[] = [];
        let k = 0;
        for (let i = 0; i < buffers.length; ++i) {
            const newEntry: GPUBindGroupEntry = {
                binding: k,
                resource: {
                    buffer: buffers[i]
                }
            };
            entriesArray.push(newEntry);
            ++k;
        }
        for (let i = 0; i < textures.length; ++i) {
            const newEntry: GPUBindGroupEntry = {
                binding: k,
                resource: textures[i].createView()
            };
            entriesArray.push(newEntry);
            ++k;
        }
        for (let i = 0; i < samplers.length; ++i) {
            const newEntry: GPUBindGroupEntry = {
                binding: k,
                resource: samplers[i]
            };
            entriesArray.push(newEntry);
            ++k;
        }
        return this.device.createBindGroup({
            layout: layout,
            entries: entriesArray
        });
    }

    public createRenderPipeline(shaders: GPUShaderModule,
                                bufferLayouts: GPUVertexBufferLayout[],
                                layout: GPUPipelineLayout,
                                topology: GPUPrimitiveTopology): GPURenderPipeline {
        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout: layout,
            vertex: {
                module: shaders,
                entryPoint: "vs_main",
                buffers: bufferLayouts
            },
            fragment: {
                module: shaders,
                entryPoint: "fs_main",
                targets: [{ format: "bgra8unorm" }]
            },
            primitive: {
                topology: topology,
                frontFace: "ccw",
                cullMode: "back"
            }
        };
        return this.device.createRenderPipeline(pipelineDesc);
    }

    public createBuffer<T extends Float32Array | Uint32Array>(bufferDesc: GPUBufferDescriptor, data: T): GPUBuffer {
        const newBuffer = this.device.createBuffer(bufferDesc);
        if (data instanceof Float32Array) {
            const tmpArray = new Float32Array(newBuffer.getMappedRange());
            tmpArray.set(data);
        }
        else if (data instanceof Uint32Array) {
            const tmpArray = new Uint32Array(newBuffer.getMappedRange());
            tmpArray.set(data);
        }
        newBuffer.unmap();
        return newBuffer;
    }

    public resizeCanvas(): void {
        if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        }
    }

    public submit(renderPipeline: GPURenderPipeline,
                  bindGroups: GPUBindGroup[],
                  vbo: GPUBuffer,
                  ebo: GPUBuffer,
                  vertexCount: number,
                  instanceCount: number): void {
        this.computeDeltaTime();
        this.resizeCanvas();

        const colorAttachment = this.createColorAttachment();
        const renderpassDesc : GPURenderPassDescriptor = {
            colorAttachments: [ colorAttachment ]
        }

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderpassDesc);
        passEncoder.setViewport(0, 0, this.canvas.width, this.canvas.height, 0.0, 1.0);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setVertexBuffer(0, vbo);
        passEncoder.setIndexBuffer(ebo, "uint32");
        for (let i = 0; i < bindGroups.length; ++i) {
            passEncoder.setBindGroup(i, bindGroups[i]);
        }
        passEncoder.draw(vertexCount, instanceCount, 0, 0);
        passEncoder.end();

        this.device.queue.submit([ commandEncoder.finish() ]);
    }

    public getCanvasWidth(): number {
        return this.canvas.width;
    }

    public getCanvasHeight(): number {
        return this.canvas.height;
    }

    public getAdapterArchitecture(): string {
        return this.device.adapterInfo?.architecture ?? "";
    }

    public getAdapterDescription(): string {
        return this.device.adapterInfo?.description ?? "";
    }

    public getAdapterDevice(): string {
        return this.device.adapterInfo?.device ?? "";
    }

    public getAdapterVendor(): string {
        return this.device.adapterInfo?.vendor ?? "";
    }

    public getDeltaTime(): number {
        return this.dt;
    }

    public getFPS(): number {
        return 1000.0 / this.dt;
    }

    private computeDeltaTime(): void {
        const now = window.performance.now();
        const dt = this.lastTime ? now - this.lastTime : 0.0;
        this.dt = dt;
        this.lastTime = now;
    }

    private configureContext(): GPUCanvasContext {
        const ctx = this.canvas.getContext("webgpu");
        if (!ctx) {
            throw new AphroditeException("Aphrodite", "ctor", `Canvas doesn't have WebGPU context`);
        }
        ctx.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: "opaque"
        });
        return ctx;
    }

    private createColorAttachment(): GPURenderPassColorAttachment {
        const colorTexture = this.ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: colorTextureView,
            clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
            loadOp: "clear",
            storeOp: "store"
        };
        return colorAttachment;
    }
}
