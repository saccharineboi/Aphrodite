import { Util } from "../src/Util.js";
import { Renderer } from "../src/Renderer.js";
import { Vector3 } from "../src/Vector3.js";
import { Matrix4x4 } from "../src/Matrix4x4.js";
import { DevUI,
         EngineState,
         CameraState } from "../src/DevUI.js";
import { Mesh } from "../src/Mesh.js";

const MSAA_SAMPLES = 4;
const MAX_ANISOTROPY = 4;

async function main() {
    const renderer = await Renderer.Init("aphrodite-output");

    const wallTexture = await renderer.createMipmappedTexture("../textures/wall",
                                                              "rgba8unorm",
                                                              GPUTextureUsage.COPY_DST |
                                                              GPUTextureUsage.TEXTURE_BINDING |
                                                              GPUTextureUsage.RENDER_ATTACHMENT);

    const wallTextureSamplerDesc = renderer.createDefaultSamplerDescriptor(MAX_ANISOTROPY);
    const wallTextureSampler = renderer.createSampler(wallTextureSamplerDesc);

    // const inputHandler = renderer.createInputHandler();

    const engineState = new EngineState();
    engineState.setClearColor(new Vector3(0.1, 0.1, 0.2))

    const cameraState = new CameraState();
    const devUI = new DevUI(engineState, cameraState, { autoPlace: false });

    const basicRenderPipeline = await renderer.createBasicRenderPipeline(MSAA_SAMPLES);
    const wallTextureBindGroup = basicRenderPipeline.createBindGroup(wallTexture, wallTextureSampler);
    const quad = Mesh.GenQuad();
    const quadBuffers = basicRenderPipeline.createBuffersFromMesh(quad);

    const dt = Util.genDeltaTimeComputer();
    let totalTime = 0.0;
    const render = async () => {
        renderer.resizeCanvas((newWidth, newHeight) => {
            basicRenderPipeline.resize(newWidth, newHeight);
        });

        const deltaTime = dt();
        devUI.update(deltaTime);

        totalTime += deltaTime;

        const canvasDims = renderer.getCanvasDimensions();
        const projectionMatrix = Matrix4x4.GenPerspective(cameraState.fovy,
                                                          canvasDims.width / canvasDims.height,
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

        basicRenderPipeline.setPVM(pvmMatrix);
        basicRenderPipeline.setTextureMultiplier(1);

        const cmdBuffers: Array<GPUCommandBuffer> = [];
        cmdBuffers.push(basicRenderPipeline.buildCommandBuffer({
            engineState,
            bindGroup: wallTextureBindGroup,
            buffers: quadBuffers,
        }));
        renderer.submitCommandBuffers(cmdBuffers);

        basicRenderPipeline.obtainRenderpassMS((value) => {
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
