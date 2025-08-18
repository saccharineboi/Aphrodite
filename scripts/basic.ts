
const genDeltaTimeComputer = () => {
    let lastTime = 0.0;
    return () => {
        const currentTime = performance.now();
        const deltaTime = lastTime ? currentTime - lastTime : 0.0;
        lastTime = currentTime;
        return deltaTime;
    };
};

const downloadText = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const text = await response.text();
    return text;
};

async function main() {
    if (!navigator.gpu) {
        throw new Error("WebGPU is not available");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("Failed to request an adapter");
    }

    const device = await adapter.requestDevice();
    if (!device) {
        throw new Error("Failed to request a device");
    }

    const canvas = document.querySelector("#aphrodite-canvas") as HTMLCanvasElement;
    if (!canvas) {
        throw new Error("Canvas couldn't be found");
    }

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

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

    const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = { bindGroupLayouts: [] };
    const pipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);

    const colorState: GPUColorTargetState = {
        format: "bgra8unorm"
    };

    const pipelineDesc: GPURenderPipelineDescriptor = {
        layout: pipelineLayout,
        vertex: {
            module: basicShaderModule,
            entryPoint: "vs_main",
            buffers: []
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
        }
    };

    const pipeline = await device.createRenderPipelineAsync(pipelineDesc);

    const dt = genDeltaTimeComputer();
    let tick = 0.0;

    const gui = new dat.GUI({ autoPlace: false });
    document.querySelector("#gui")?.append(gui.domElement);

    const colorsFolder = gui.addFolder("Colors");
    const backgroundColorState = {
        backgroundColor: [10, 10, 20]
    };
    colorsFolder.addColor(backgroundColorState, "backgroundColor")
    colorsFolder.open();

    const render = () => {
        tick += dt() * 0.001;

        const colorTexture = ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const colorAttachment: GPURenderPassColorAttachment = {
            view: colorTextureView,
            clearValue: { r: backgroundColorState.backgroundColor[0] / 255.0,
                          g: backgroundColorState.backgroundColor[1] / 255.0,
                          b: backgroundColorState.backgroundColor[2] / 255.0,
                          a: 1.0 },
            loadOp: "clear",
            storeOp: "store"
        };

        const renderpassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment]
        };

        const commandEncoder = device.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, canvas.width, canvas.height, 0.0, 1.0);
        renderpass.setPipeline(pipeline);
        renderpass.draw(3, 1);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

main();
