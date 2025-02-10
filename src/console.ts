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

import { $, Renderer } from "../src/renderer.js";

export interface ConsoleParams {
    updateDelay: number;
    realTimeInfoId: string;
}

export function GetDefaultConsoleParams(): ConsoleParams {
    return {
        updateDelay: 1000,
        realTimeInfoId: "aphrodite-realtime-info",
    };
}

export class Console {
    private renderer: Renderer;

    private updateDelay: number;
    private realTimeInfo: HTMLParagraphElement;

    private lastTime: number;

    private totalFPS: number;
    private totalMS: number;
    private totalTicks: number;

    public constructor(renderer: Renderer, params: ConsoleParams) {
        this.renderer = renderer;

        this.updateDelay = params.updateDelay;
        this.realTimeInfo = $(params.realTimeInfoId) as HTMLParagraphElement;

        this.lastTime = -this.updateDelay;

        this.totalFPS = 0.0;
        this.totalMS = 0.0;
        this.totalTicks = 0;
    }

    private updateRealtimeInfo(): void {
        const canvasWidth = this.renderer.getCanvasWidth();
        const canvasHeight = this.renderer.getCanvasHeight();

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

    public update(): void {
        ++this.totalTicks;

        this.totalFPS += this.renderer.getFPS();
        this.totalMS += this.renderer.getDeltaTime();

        if (window.performance.now() - this.lastTime >= this.updateDelay) {
            this.updateRealtimeInfo();

            this.lastTime = window.performance.now();

            this.totalTicks = 0;

            this.totalFPS = 0.0;
            this.totalMS = 0.0;
        }
    }
}
