/// <reference types="dat.gui" />
declare const dat: typeof import("dat.gui");

import { Vector3 } from "./Vector3.js";
import { Util } from "./Util.js";

class PerformanceStats {
    public ms: number;
    public fps: number;
    public totalTimePassed: number;
    public delay: number;
    public frameCount: number;

    public totalRenderpass: number;
    public renderpass: number;

    public constructor() {
        this.ms = 0;
        this.fps = 0;
        this.totalTimePassed = 0;
        this.delay = 1000; // 1 second
        this.frameCount = 0;

        this.totalRenderpass = 0;
        this.renderpass = 0;
    }

    public update(dt: number) {
        this.frameCount += 1;
        this.totalTimePassed += dt;
        if (this.totalTimePassed >= this.delay) {
            this.ms = this.totalTimePassed / this.frameCount;
            this.fps = 1000.0 / this.ms;
            this.renderpass = this.totalRenderpass / this.frameCount;

            this.totalTimePassed = 0;
            this.totalRenderpass = 0;
            this.frameCount = 0;
        }
    }
};

export class EngineState {
    public clearColor: Array<number>;

    public constructor() {
        this.clearColor = new Array(0, 0, 0);
    }

    public setClearColor(color: Vector3) {
        this.clearColor[0] = (color.r * 255.0);
        this.clearColor[1] = (color.g * 255.0);
        this.clearColor[2] = (color.b * 255.0);
    }
};

export class CameraState {
    public position: Vector3;
    public rotation: Vector3;
    public fovy: number;

    public constructor() {
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.fovy = Math.PI / 2.0;
    }
};

export class DevUI {
    private gui: dat.GUI;
    private guiElem: HTMLElement;

    private engineFolder: dat.GUI;
    private engineState: EngineState;

    private fpsElem: HTMLElement | null;

    private perfFolder: dat.GUI;
    private perfStats: PerformanceStats;

    private cameraFolder: dat.GUI;
    private cameraState: CameraState;

    public constructor(engineState: EngineState,
                       cameraState: CameraState,
                       params?: dat.GUIParams) {
        this.engineState = engineState;
        this.cameraState = cameraState;

        // Initialize dat.GUI
        this.gui = new dat.GUI(params);
        this.guiElem = document.getElementById("aphrodite-dev-ui") ?? document.body;
        this.guiElem.append(this.gui.domElement);

        // Engine  parameters
        this.engineFolder = this.gui.addFolder("Engine");
        this.engineFolder.addColor(this.engineState, "clearColor");
        this.engineFolder.open();

        // Average FPS
        this.fpsElem = document.getElementById("aphrodite-dev-ui-fps");

        // Engine performance
        this.perfFolder = this.gui.addFolder("Performance");
        this.perfStats = new PerformanceStats();
        this.perfFolder.add(this.perfStats, "ms").step(1e-6).listen();
        this.perfFolder.add(this.perfStats, "fps").step(1e-6).listen();
        this.perfFolder.add(this.perfStats, "renderpass").step(1e-6).listen();
        this.perfFolder.add(this.perfStats, "delay");
        this.perfFolder.open();

        // Main camera parameters
        this.cameraFolder = this.gui.addFolder("Main Camera");
        Util.addVec3ToGUIFolder({
            parentFolder: this.cameraFolder,
            folderName: "Position",
            vec3: this.cameraState.position,
            min: -10.0,
            max: 10.0,
            step: 0.01
        });
        Util.addVec3ToGUIFolder({
            parentFolder: this.cameraFolder,
            folderName: "Rotation",
            vec3: this.cameraState.rotation,
            min: -Math.PI,
            max: Math.PI,
            step: 0.01
        });
        this.cameraFolder.add(this.cameraState, "fovy", Math.PI / 10, Math.PI, 0.01);
        this.cameraFolder.open();
    }

    public update(dt: number) {
        this.perfStats.update(dt);
        if (this.fpsElem) {
            this.fpsElem.innerHTML = this.perfStats.fps.toFixed(0);
        }
    }

    public addRenderpassMS(ms: number) {
        this.perfStats.totalRenderpass += ms;
    }
};
