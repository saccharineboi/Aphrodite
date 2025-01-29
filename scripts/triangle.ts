import { AphroditeException,
         Aphrodite } from "../src/renderer.js"
import { GetDefaultConsoleParams,
         Console } from "../src/console.js";

(async () => {
    try {
        const canvasId = "aphrodite-output";
        const aphrodite = await Aphrodite.Create(canvasId);
        const _console = new Console(aphrodite, GetDefaultConsoleParams());

        const vertices = new Float32Array([
            -0.5, -0.5, 0.0,        1.0, 0.0, 0.0,
             0.5, -0.5, 0.0,        0.0, 1.0, 0.0,
             0.0,  0.5, 0.0,        0.0, 0.0, 1.0
        ]);

        const indices = new Uint32Array([ 0, 1, 2 ]);

        const offsets = new Float32Array([ 0.4, 0.4, 0.0, 0.0 ]);

        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0,
            offset: 0,
            format: "float32x3"
        };

        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1,
            offset: 3 * Float32Array.BYTES_PER_ELEMENT,
            format: "float32x3"
        };

        const bufferLayoutDesc: GPUVertexBufferLayout = {
            attributes: [ positionAttribDesc, colorAttribDesc ],
            arrayStride: 6 * Float32Array.BYTES_PER_ELEMENT,
            stepMode: "vertex"
        };

        const vboDesc: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        };

        const eboDesc: GPUBufferDescriptor = {
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true
        };

        const uboDesc: GPUBufferDescriptor = {
            size: offsets.byteLength,
            usage: GPUBufferUsage.UNIFORM,
            mappedAtCreation: true
        };

        const vbo = aphrodite.createBuffer(vboDesc, vertices);
        const ebo = aphrodite.createBuffer(eboDesc, indices);
        const ubo = aphrodite.createBuffer(uboDesc, offsets);

        const uniformBindGroupLayout = aphrodite.createBindGroupLayout([{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {}
        }]);

        const uniformBindGroup = aphrodite.createBindGroup(uniformBindGroupLayout, [ ubo ]);

        const triangleShader = await aphrodite.createShaderModule("../shaders/triangle.wgsl");
        const pipelineLayout = aphrodite.createPipelineLayout([ uniformBindGroupLayout ]);
        const renderPipeline = aphrodite.createRenderPipeline(triangleShader, [ bufferLayoutDesc ], pipelineLayout, "triangle-list");

        const render = () => {
            aphrodite.submit(renderPipeline, [ uniformBindGroup ], vbo, ebo, 3, 1);
            _console.update();
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
    catch (e) {
        if (e instanceof AphroditeException) {
            console.log(e.toString());
        }
        else {
            throw e;
        }
    }
})();
