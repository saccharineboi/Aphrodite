import { AphroditeException } from "../src/renderer.js";

export async function downloadText(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    }
    catch (e) {
        throw new AphroditeException("", "DownloadText", `Couldn't fetch ${url}`);
    }
}
