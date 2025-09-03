import { Vector3 } from "./Vector3.js";

export const EPSILON = 1e-6;

export function areFloatsEqual(x: number, y: number, eps = EPSILON): boolean {
    if (x === y) {
        return true;
    }
    else if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return false;
    }
    return Math.abs(x - y) <= eps * Math.max(1.0, Math.max(Math.abs(x), Math.abs(y)));
}

export function calcMipLevelCount(width: number, height: number): number {
    return Math.ceil(Math.log2(Math.max(width, height)));
}

export function genDeltaTimeComputer() {
    let lastTime = 0.0;
    return () => {
        const currentTime = performance.now();
        const deltaTime = lastTime ? currentTime - lastTime : 0.0;
        lastTime = currentTime;
        return deltaTime;
    };
};

export async function downloadText(url: string) : Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    const text = await response.text();
    return text;
};

export async function downloadImage(url: string) : Promise<ImageBitmap> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const blob = await response.blob();
    const imgBitmap = await createImageBitmap(blob);
    return imgBitmap;
};

export async function downloadImageWithMipmaps(src: string,
                                               ext: string = "png",
                                               mipmapExt: string = "_mip") {
    const rootBitmap = await downloadImage(`${src}.${ext}`);
    const mipmapCnt = calcMipLevelCount(rootBitmap.width, rootBitmap.height);

    const sources = [ `${src}.${ext}` ];
    for (let i = 1; i <= mipmapCnt; ++i) {
        sources.push(`${src}${mipmapExt}${i}.${ext}`)
    }
    const promises = sources.map(url => downloadImage(url));
    return Promise.all(promises);
}

export type resizeCanvasCallbackType = (width: number, height: number) => void;

export function resizeCanvas(canvas: HTMLCanvasElement,
                             callback?: resizeCanvasCallbackType) {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        callback && callback(canvas.width, canvas.height);
    }
};

export function ASSERT(condition: boolean, msg: string) {
    if (!condition) {
        throw new Error(`ASSERT FAILED: ${msg}`);
    }
}

export interface AddVec3FolderParams {
    parentFolder: dat.GUI,
    folderName: string,
    vec3: Vector3,
    min: number,
    max: number,
    step: number
};

export function addVec3ToGUIFolder(params: AddVec3FolderParams): dat.GUI {
    const newFolder = params.parentFolder.addFolder(params.folderName);
    newFolder.add(params.vec3, "x", params.min, params.max, params.step);
    newFolder.add(params.vec3, "y", params.min, params.max, params.step);
    newFolder.add(params.vec3, "z", params.min, params.max, params.step);
    return newFolder;
};
