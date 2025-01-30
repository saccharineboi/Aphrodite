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
            -0.5, -0.5, 0.0,        1.0, 0.0, 0.0,      0.0, 0.0,
             0.5, -0.5, 0.0,        0.0, 1.0, 0.0,      1.0, 0.0,
             0.0,  0.5, 0.0,        0.0, 0.0, 1.0,      0.5, 1.0
        ]);
        const indices = new Uint32Array([ 0, 1, 2 ]);
        const offsets = new Float32Array([ 0.0, 0.0, 0.0, 0.0 ]);

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

        const texcoordAttribDesc: GPUVertexAttribute = {
            shaderLocation: 2,
            offset: 6 * Float32Array.BYTES_PER_ELEMENT,
            format: "float32x2"
        };

        const bufferLayoutDesc: GPUVertexBufferLayout = {
            attributes: [ positionAttribDesc, colorAttribDesc, texcoordAttribDesc ],
            arrayStride: 8 * Float32Array.BYTES_PER_ELEMENT,
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

        const group0Layout = aphrodite.createBindGroupLayout([{
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
        }]);

        const brickTexture = await aphrodite.createTextureFromURL("../textures/brick.jpg",
                                                                  "rgba8unorm",
                                                                  GPUTextureUsage.TEXTURE_BINDING |
                                                                  GPUTextureUsage.COPY_DST |
                                                                  GPUTextureUsage.RENDER_ATTACHMENT);
        const brickTextureSampler = aphrodite.createCommonSampler2D();

        const group0 = aphrodite.createBindGroup(group0Layout, [ ubo ], [ brickTexture ], [ brickTextureSampler ]);

        const triangleShader = await aphrodite.createShaderModuleFromURL("../shaders/triangle.wgsl");
        const pipelineLayout = aphrodite.createPipelineLayout([ group0Layout ]);
        const renderPipeline = aphrodite.createRenderPipeline(triangleShader, [ bufferLayoutDesc ], pipelineLayout, "triangle-list");

        const render = () => {
            aphrodite.submit(renderPipeline, [ group0 ], vbo, ebo, 3, 1);
            _console.update();
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
    catch (e) {
        const exceptionDiv = document.getElementById("aphrodite-exception") as HTMLDivElement;
        if (e instanceof AphroditeException) {
            exceptionDiv.innerHTML = e.toString();
        }
        else {
            exceptionDiv.innerHTML = `Unknown exception: ${JSON.stringify(e)}`;
        }
        exceptionDiv.style.display = "flex";
    }
})();
