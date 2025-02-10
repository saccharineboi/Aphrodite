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

export class RendererException {
    private timestamp: Date;

    public constructor(private className: string,
                       private functionName: string,
                       private message: string) {
        this.timestamp = new Date();
    }

    public getClassName(): string       { return this.className; }
    public getFunctionName(): string    { return this.functionName; }
    public getMessage(): string         { return this.message; }

    public toString(): string {
        const hours = this.timestamp.getHours();
        const minutes = this.timestamp.getMinutes();
        const seconds = this.timestamp.getSeconds();
        const milliseconds = this.timestamp.getMilliseconds()

        return `[${hours}:${minutes}:${seconds}.${milliseconds}] Renderer Exception at ${this.className}:${this.functionName}: ${this.message}`
    }
};

export function $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
        throw new RendererException("", "$", `element with id=${id} doesn't exist`);
    }
    return el;
}

export function Deg2Rad(deg: number): number {
    return deg * Math.PI / 180.0;
}

export function Rad2Deg(rad: number): number {
    return rad * 180.0 / Math.PI;
}

export function FloatEquals(a: number, b: number, epsilon: number = 1e-6): boolean {
    return Math.abs(a - b) <= epsilon;
}

export class Vector2 {

    public static Zero(): Vector2 {
        return new Vector2(0.0, 0.0);
    }

    public static X(): Vector2 {
        return new Vector2(1.0, 0.0);
    }

    public static Y(): Vector2 {
        return new Vector2(0.0, 1.0);
    }

    public static FromVector3(other: Vector3): Vector2 {
        return new Vector2(other.x, other.y);
    }

    public static FromVector4(other: Vector4): Vector2 {
        return new Vector2(other.x, other.y);
    }

    public constructor(public x: number, public y: number) {}

    public copy(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public clone(other: Vector2): this {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public add(other: Vector2): Vector2 {
        const x = this.x + other.x;
        const y = this.y + other.y;

        return new Vector2(x, y);
    }

    public sub(other: Vector2): Vector2 {
        const x = this.x - other.x;
        const y = this.y - other.y;

        return new Vector2(x, y);
    }

    public mul(other: Vector2): Vector2 {
        const x = this.x * other.x;
        const y = this.y * other.y;

        return new Vector2(x, y);
    }

    public div(other: Vector2): Vector2 {
        const x = this.x / other.x;
        const y = this.y / other.y;

        return new Vector2(x, y);
    }

    public addScalar(s: number): Vector2 {
        const x = this.x + s;
        const y = this.y + s;

        return new Vector2(x, y);
    }

    public subScalar(s: number): Vector2 {
        const x = this.x - s;
        const y = this.y - s;

        return new Vector2(x, y);
    }

    public mulScalar(s: number): Vector2 {
        const x = this.x * s;
        const y = this.y * s;

        return new Vector2(x, y);
    }

    public divScalar(s: number): Vector2 {
        const x = this.x / s;
        const y = this.y / s;

        return new Vector2(x, y);
    }

    public dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    public squaredDist(other: Vector2): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        return x * x + y * y;
    }

    public dist(other: Vector2): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        return Math.sqrt(x * x + y * y);
    }

    public squaredLen(): number {
        const x = this.x, y = this.y;
        return x * x + y * y;
    }

    public len(): number {
        const x = this.x, y = this.y;
        return Math.sqrt(x * x + y * y);
    }

    public norm(): Vector2 {
        const x = this.x, y = this.y;
        const _squaredLen = x * x + y * y;
        if (_squaredLen) {
            const _len = Math.sqrt(_squaredLen);
            return new Vector2(x / _len, y / _len);
        }
        return this.copy();
    }

    public equals(other: Vector2): boolean {
        return FloatEquals(this.x, other.x) &&
               FloatEquals(this.y, other.y);
    }

    public equalsExact(other: Vector2): boolean {
        return this.x === other.x &&
               this.y === other.y;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y]);
    }

    public toString(): string {
        return `(${this.x}, ${this.y})^T`;
    }
}

export class Vector3 {

    public static Zero(): Vector3 {
        return new Vector3(0.0, 0.0, 0.0);
    }

    public static X(): Vector3 {
        return new Vector3(1.0, 0.0, 0.0);
    }

    public static Y(): Vector3 {
        return new Vector3(0.0, 1.0, 0.0);
    }

    public static Z(): Vector3 {
        return new Vector3(0.0, 0.0, 1.0);
    }

    public static FromVector2(other: Vector2): Vector3 {
        return new Vector3(other.x, other.y, 0.0);
    }

    public static FromVector4(other: Vector4): Vector3 {
        return new Vector3(other.x, other.y, other.z);
    }

    public constructor(public x: number, public y: number, public z: number) {};

    public copy(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public clone(other: Vector3): this {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }

    public add(other: Vector3): Vector3 {
        const x = this.x + other.x;
        const y = this.y + other.y;
        const z = this.z + other.z;

        return new Vector3(x, y, z);
    }

    public sub(other: Vector3): Vector3 {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;

        return new Vector3(x, y, z);
    }

    public mul(other: Vector3): Vector3 {
        const x = this.x * other.x;
        const y = this.y * other.y;
        const z = this.z * other.z;

        return new Vector3(x, y, z);
    }

    public div(other: Vector3): Vector3 {
        const x = this.x / other.x;
        const y = this.y / other.y;
        const z = this.z / other.z;

        return new Vector3(x, y, z);
    }

    public addScalar(s: number): Vector3 {
        const x = this.x + s;
        const y = this.y + s;
        const z = this.z + s;

        return new Vector3(x, y, z);
    }

    public subScalar(s: number): Vector3 {
        const x = this.x - s;
        const y = this.y - s;
        const z = this.z - s;

        return new Vector3(x, y, z);
    }

    public mulScalar(s: number): Vector3 {
        const x = this.x * s;
        const y = this.y * s;
        const z = this.z * s;

        return new Vector3(x, y, z);
    }

    public divScalar(s: number): Vector3 {
        const x = this.x / s;
        const y = this.y / s;
        const z = this.z / s;

        return new Vector3(x, y, z);
    }

    public dot(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public squaredDist(other: Vector3): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;

        return x * x + y * y + z * z;
    }

    public dist(other: Vector3): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;

        return Math.sqrt(x * x + y * y + z * z);
    }

    public cross(other: Vector3): Vector3 {
        const x = this.x, y = this.y, z = this.z;
        const ox = other.x, oy = other.y, oz = other.z;
        return new Vector3(y * oz - oy * z,
                           z * ox - oz * x,
                           x * oy - ox * y);
    }

    public squaredLen(): number {
        const x = this.x, y = this.y, z = this.z;
        return x * x + y * y + z * z;
    }

    public len(): number {
        const x = this.x, y = this.y, z = this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    public norm(): Vector3 {
        const x = this.x, y = this.y, z = this.z;
        const _squaredLen = x * x + y * y + z * z;
        if (_squaredLen) {
            const _len = Math.sqrt(_squaredLen);
            return new Vector3(x / _len, y / _len, z / _len);
        }
        return this.copy();
    }

    public equals(other: Vector3): boolean {
        return FloatEquals(this.x, other.x) &&
               FloatEquals(this.y, other.y) &&
               FloatEquals(this.z, other.z);
    }

    public equalsExact(other: Vector3): boolean {
        return this.x === other.x &&
               this.y === other.y &&
               this.z === other.z;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x, this.y, this.z ]);
    }

    public toString(): string {
        return `(${this.x}, ${this.y}, ${this.z})^T`;
    }
}

export class Vector4 {

    public static Zero(): Vector4 {
        return new Vector4(0.0, 0.0, 0.0, 0.0);
    }

    public static X(): Vector4 {
        return new Vector4(1.0, 0.0, 0.0, 0.0);
    }

    public static Y(): Vector4 {
        return new Vector4(0.0, 1.0, 0.0, 0.0);
    }

    public static Z(): Vector4 {
        return new Vector4(0.0, 0.0, 1.0, 0.0);
    }

    public static W(): Vector4 {
        return new Vector4(0.0, 0.0, 0.0, 1.0);
    }

    public static FromVector2(other: Vector2): Vector4 {
        return new Vector4(other.x, other.y, 0.0, 1.0);
    }

    public static FromVector3(other: Vector3): Vector4 {
        return new Vector4(other.x, other.y, other.z, 1.0);
    }

    public constructor(public x: number, public y: number, public z: number, public w: number) {};

    public copy(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    public clone(other: Vector4): this {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.w = other.w;
        return this;
    }

    public add(other: Vector4): Vector4 {
        const x = this.x + other.x;
        const y = this.y + other.y;
        const z = this.z + other.z;
        const w = this.w + other.w;

        return new Vector4(x, y, z, w);
    }

    public sub(other: Vector4): Vector4 {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;
        const w = this.w - other.w;

        return new Vector4(x, y, z, w);
    }

    public mul(other: Vector4): Vector4 {
        const x = this.x * other.x;
        const y = this.y * other.y;
        const z = this.z * other.z;
        const w = this.w * other.w;

        return new Vector4(x, y, z, w);
    }

    public div(other: Vector4): Vector4 {
        const x = this.x / other.x;
        const y = this.y / other.y;
        const z = this.z / other.z;
        const w = this.w / other.w;

        return new Vector4(x, y, z, w);
    }

    public addScalar(s: number): Vector4 {
        const x = this.x + s;
        const y = this.y + s;
        const z = this.z + s;
        const w = this.w + s;

        return new Vector4(x, y, z, w);
    }

    public subScalar(s: number): Vector4 {
        const x = this.x - s;
        const y = this.y - s;
        const z = this.z - s;
        const w = this.w - s;

        return new Vector4(x, y, z, w);
    }

    public mulScalar(s: number): Vector4 {
        const x = this.x * s;
        const y = this.y * s;
        const z = this.z * s;
        const w = this.w * s;

        return new Vector4(x, y, z, w);
    }

    public divScalar(s: number): Vector4 {
        const x = this.x / s;
        const y = this.y / s;
        const z = this.z / s;
        const w = this.w / s;

        return new Vector4(x, y, z, w);
    }

    public dot(other: Vector4): number {
        return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
    }

    public squaredDist(other: Vector4): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;
        const w = this.w - other.w;

        return x * x + y * y + z * z + w * w;
    }

    public dist(other: Vector4): number {
        const x = this.x - other.x;
        const y = this.y - other.y;
        const z = this.z - other.z;
        const w = this.w - other.w;

        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    public cross(other: Vector4): Vector4 {
        const x = this.x, y = this.y, z = this.z;
        const ox = other.x, oy = other.y, oz = other.z;
        return new Vector4(y * oz - oy * z,
                           z * ox - oz * x,
                           x * oy - ox * y,
                           1.0);
    }

    public squaredLen(): number {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        return x * x + y * y + z * z + w * w;
    }

    public len(): number {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }

    public norm(): Vector4 {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        const _squaredLen = x * x + y * y + z * z + w * w;
        if (_squaredLen) {
            const _len = Math.sqrt(_squaredLen);
            return new Vector4(x / _len, y / _len, z / _len, w / _len);
        }
        return this.copy();
    }

    public equals(other: Vector4): boolean {
        return FloatEquals(this.x, other.x) &&
               FloatEquals(this.y, other.y) &&
               FloatEquals(this.z, other.z) &&
               FloatEquals(this.w, other.w);
    }

    public equalsExact(other: Vector4): boolean {
        return this.x === other.x &&
               this.y === other.y &&
               this.z === other.z &&
               this.w === other.w;
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([ this.x, this.y, this.z ]);
    }

    public toString(): string {
        return `(${this.x}, ${this.y}, ${this.z}, ${this.w})^T`;
    }
}

export class Renderer {
    private device: GPUDevice;
    private canvas: HTMLCanvasElement;
    private ctx: GPUCanvasContext;

    private lastTime: number;
    private dt: number;

    public static async Create(canvasId: string): Promise<Renderer> {
        if (!navigator.gpu) {
            throw new RendererException("Renderer", "Init", "WebGPU isn't supported");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new RendererException("Renderer", "Init", "Adapter is NULL");
        }

        const device = await adapter.requestDevice();
        if (!device) {
            throw new RendererException("Renderer", "Init", "Device is NULL");
        }

        return new Renderer(canvasId, device);
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
            throw new RendererException("Renderer", "ctor", `Canvas doesn't have WebGPU context`);
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
