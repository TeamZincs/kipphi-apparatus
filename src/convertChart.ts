import { RPEChartCompiler, type Chart } from "kipphi";
import { fetchTexture, getChart, getChartProject, ReturnType } from "./background";
import { zip } from "./compress";
import type { FileToCompress } from "./workers/zip.worker";

export function toRPE(chart: Chart) {
    const compiler = new RPEChartCompiler(chart);
    return JSON.stringify(compiler.compileChart())
}

export async function convertRPEJSON(chartId: string): Promise<string> {
    const chart = await getChart(chartId);
    return toRPE(chart);
}

const encodeText = (text: string) => (new TextEncoder().encode(text)).buffer;

export async function convertPEZ(chartId: string): Promise<ArrayBuffer> {
    const { chart, illustration, music } = await getChartProject(chartId, ReturnType.arrayBuffer);
    const textures = chart.scanAllTextures();
    const textureFiles: FileToCompress[] = [];
    for (const texture of textures) {
        if (texture === "line.png") {
            continue;
        }
        if (texture === "illustration.png") {
            throw new Error("Texture 'illustration.png' will overwrite the chart's illustration.");
        }
        const data = await fetchTexture(chartId, texture, ReturnType.arrayBuffer);
        if (!data) {
            throw new Error(`Texture '${texture}' not found.`);
        }
        textureFiles.push({
            name: texture,
            data: data,
        });
    }
    const zipResult = await zip([
        {name: "chart.json", data: encodeText(toRPE(chart))},
        {name: "illustration.png", data: illustration},
        {name: "music.mp3", data: music},
        ...textureFiles,
    ]);
    if (!zipResult.success) {
        throw new Error("Failed to zip");
    }
    return zipResult.buffer;
}
