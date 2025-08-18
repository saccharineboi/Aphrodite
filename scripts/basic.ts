const genDeltaTimeComputer = () => {
    let lastTime = 0.0;
    return () => {
        const currentTime = performance.now();
        const deltaTime = lastTime ? currentTime - lastTime : 0.0;
        lastTime = currentTime;
        return deltaTime;
    };
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

    const dt = genDeltaTimeComputer();
    let tick = 0.0;

    const render = () => {
        tick += dt() * 0.001;

        const colorTexture = ctx.getCurrentTexture();
        const colorTextureView = colorTexture.createView();

        const red = (Math.sin(tick) + 1.0) * 0.5;
        const green = (Math.cos(tick) + 1.0) * 0.5;

        const colorAttachment: GPURenderPassColorAttachment = {
            view: colorTextureView,
            clearValue: { r: red, g: green, b: 0.3, a: 1.0 },
            loadOp: "clear",
            storeOp: "store"
        };

        const renderpassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment]
        };

        const commandEncoder = device.createCommandEncoder();
        const renderpass = commandEncoder.beginRenderPass(renderpassDesc);
        renderpass.setViewport(0, 0, canvas.width, canvas.height, 0.0, 1.0);
        renderpass.end();

        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

main();
