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

import { $,
         Aphrodite } from "../src/renderer.js";

export interface ConsoleParams {
    updateDelay: number;
    realTimeInfoId: string;
    adapterArchitectureId: string;
    adapterDescriptionId: string;
    adapterDeviceId: string;
    adapterVendorId: string;
}

export function GetDefaultConsoleParams(): ConsoleParams {
    return {
        updateDelay: 1000,
        realTimeInfoId: "aphrodite-realtime-info",
        adapterArchitectureId: "aphrodite-adapter-architecture",
        adapterDescriptionId: "aphrodite-adapter-description",
        adapterDeviceId: "aphrodite-adapter-device",
        adapterVendorId: "aphrodite-adapter-vendor"
    };
}

export class Console {
    private aphrodite: Aphrodite;

    private updateDelay: number;
    private realTimeInfo: HTMLParagraphElement;
    private adapterArchitecture: HTMLParagraphElement;
    private adapterDescription: HTMLParagraphElement;
    private adapterDevice: HTMLParagraphElement;
    private adapterVendor: HTMLParagraphElement;

    private lastTime: number;

    private totalFPS: number;
    private totalMS: number;
    private totalTicks: number;

    public constructor(aphrodite: Aphrodite, params: ConsoleParams) {
        this.aphrodite = aphrodite;

        this.updateDelay = params.updateDelay;
        this.realTimeInfo = $(params.realTimeInfoId) as HTMLParagraphElement;
        this.adapterArchitecture = $(params.adapterArchitectureId) as HTMLParagraphElement;
        this.adapterDescription = $(params.adapterDescriptionId) as HTMLParagraphElement;
        this.adapterDevice = $(params.adapterDeviceId) as HTMLParagraphElement;
        this.adapterVendor = $(params.adapterVendorId) as HTMLParagraphElement;

        this.lastTime = -this.updateDelay;

        this.totalFPS = 0.0;
        this.totalMS = 0.0;
        this.totalTicks = 0;
    }

    private updateRealtimeInfo(): void {
        const canvasWidth = this.aphrodite.getCanvasWidth();
        const canvasHeight = this.aphrodite.getCanvasHeight();

        const fps = this.totalFPS / this.totalTicks;
        const ms = this.totalMS / this.totalTicks;

        const color = (() => {
            if (fps >= 60) {
                return "lightgreen";
            }
            else if (fps >= 30) {
                return "yellow";
            }
            else {
                return "red";
            }
        })();

        this.realTimeInfo.innerHTML = `Dims: ${canvasWidth}x${canvasHeight}, FPS: ${fps.toFixed(2)}, MS: ${ms.toFixed(2)}`;
        this.realTimeInfo.style.color = color;
    }

    private updateAdapterArchitecture(): void {
        const architecture = this.aphrodite.getAdapterArchitecture();
        this.adapterArchitecture.innerHTML = `Adapter architecture: ${architecture}`;
        if (!architecture.length) {
            this.adapterArchitecture.style.display = "none";
        }
    }

    private updateAdapterDescription(): void {
        const description = this.aphrodite.getAdapterDescription();
        this.adapterDescription.innerHTML = `Adapter description: ${description}`;
        if (!description.length) {
            this.adapterDescription.style.display = "none";
        }
    }

    private updateAdapterDevice(): void {
        const device = this.aphrodite.getAdapterDevice();
        this.adapterDevice.innerHTML = `Adapter device: ${device}`;
        if (!device.length) {
            this.adapterDevice.style.display = "none";
        }
    }

    private updateAdapterVendor(): void {
        const vendor = this.aphrodite.getAdapterVendor();
        this.adapterVendor.innerHTML = `Adapter vendor: ${vendor}`;
        if (!vendor.length) {
            this.adapterVendor.style.display = "none";
        }
    }

    public update(): void {
        ++this.totalTicks;

        this.totalFPS += this.aphrodite.getFPS();
        this.totalMS += this.aphrodite.getDeltaTime();

        if (window.performance.now() - this.lastTime >= this.updateDelay) {
            this.updateRealtimeInfo();

            this.updateAdapterArchitecture();
            this.updateAdapterDescription();
            this.updateAdapterDevice();
            this.updateAdapterVendor();

            this.lastTime = window.performance.now();

            this.totalTicks = 0;

            this.totalFPS = 0.0;
            this.totalMS = 0.0;
        }
    }
}
