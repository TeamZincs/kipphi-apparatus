import { RPEChartCompiler, type Chart } from "kipphi";
import { fetchTexture, getChart, getChartProject, ReturnType } from "./background";
import { zip } from "./compress";
import type { FileToCompress } from "./workers/zip.worker";
import mime from "mime";

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
    const { chart, illustration, music } = await getChartProject(chartId, ReturnType.blob);
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
    const musicExt = mime.getExtension(music.type)
    const illustrationExt = mime.getExtension(illustration.type)
    const infoTxt =
`#
Name: ${chart.name}
Song: music.${musicExt}
Picture: illustration.${illustrationExt}
Chart: chart.rpe.json
Composer: ${chart.composer}
Charter: ${chart.charter}`
    const zipResult = await zip([
        {name: "chart.rpe.json", data: encodeText(toRPE(chart))},
        {name: "info.txt", data: encodeText(infoTxt)},
        {name: `illustration.${illustrationExt}`, data: await illustration.arrayBuffer()},
        {name: `music.${musicExt}`, data: await music.arrayBuffer()},
        ...textureFiles,
    ]);
    if (!zipResult.success) {
        throw new Error("Failed to zip");
    }
    return zipResult.buffer;
}
