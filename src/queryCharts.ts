import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, readDir, readTextFile, mkdir, readFile, writeFile, rename } from "@tauri-apps/plugin-fs";
import { getExtensionFromName, getMimeTypeFromName } from "#/util";
import type { ChartDataKPA, ChartDataKPA2, ChartDataRPE } from "kipphi";

export interface ChartMetadata {
    title: string;
    chart: string;
    music: string;
    illustration: string;
    type: "KPA1" | "KPA2" | "RPE";
    durationSecs: number;
}


let APP_DATA_DIR: string;
let CHART_DIR: string;
let TRASH_DIR: string;

/**
 * 查询应用数据目录、谱面目录和谱面回收站目录。
 * @returns 
 */
export async function queryMeta() {
    if (typeof APP_DATA_DIR === "string") {
         return { APP_DATA_DIR, CHART_DIR, TRASH_DIR };
    } else {
        APP_DATA_DIR = await appDataDir();
        CHART_DIR = await join(APP_DATA_DIR, "charts");
        TRASH_DIR = await join(APP_DATA_DIR, "trash");
    }
    return {
        APP_DATA_DIR, CHART_DIR, TRASH_DIR
    }
}


export async function queryCharts() {
    const {APP_DATA_DIR, CHART_DIR} = await queryMeta();

    if (!await exists(APP_DATA_DIR)) {
        await mkdir(APP_DATA_DIR);
    }
    if (!await exists(CHART_DIR)) {
        await mkdir(CHART_DIR);
    }
    const charts = await readDir(CHART_DIR);
    const chartInfos: {
        chartPath: string,
        identifier: string,
        title: string,
        image: Blob,
        type: "KPA1" | "KPA2" | "RPE"
    }[] = [];
    for (const chart of charts) {
        if (chart.isDirectory) {
            const name = chart.name;
            const metadata = await readTextFile(`${CHART_DIR}/${name}/metadata.json`);
            const metadataJson = JSON.parse(metadata) as ChartMetadata;
            chartInfos.push({
                chartPath: metadataJson.chart,
                identifier: name,
                title: metadataJson.title,
                image: new Blob(
                    [await readFile(`${CHART_DIR}/${name}/${metadataJson.illustration}`)],
                { type: `image/${getExtensionFromName(metadataJson.illustration)}`}),
                type: metadataJson.type
            });
        }
    }
    return chartInfos;
}

export async function readAFileInChart(identifier: string, filename: string, mimeType: string) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    return new Blob(
        [await readFile(await join(CHART_DIRECTORY, identifier, filename))],
        { type: mimeType}
    );
}

export async function readChart(identifier: string, filename: string) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    return JSON.parse(await readTextFile(await join(CHART_DIRECTORY, identifier, filename))) as ChartDataRPE | ChartDataKPA | ChartDataKPA2;
}

export async function saveAFileToChart(identifier: string, filename: string, blob: Blob) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const filePath = await join(CHART_DIRECTORY, identifier, filename);
    await writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

export function parseInfoTxt(infoTxt: string) {
    const lines = infoTxt.split("\n");
    const info: Record<string, string>= {};
    for (const line of lines) {
        // 第一行是#
        if (line.startsWith("#")) {
            continue;
        }
        if (line.trim() === "") {
            continue;
        }
        const [key, value] = line.split(":");
        if (!key || !value) {
            console.log(`Invalid line: '${line}'d`);
            continue;
        }
        info[key.trim()] = value.trim();
    }
    return info;
}

/**
 * 解析未解码的原始字节序列。
 * 
 * 先尝试UTF-8解码，如果失败，则尝试GBK解码。
 * 
 * 如果GBK解码失败，则抛出错误。
 * @param raw 
 * @returns 
 */
export function parseRawInfoTxt(raw: Uint8Array | ArrayBuffer) {
    let infoTxt: string;
    try {
        infoTxt = new TextDecoder("utf-8", {fatal: true}).decode(raw);
    } catch (error) {
        // https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder/fatal
        if (!(error instanceof TypeError)) {
            throw error;
        }
        infoTxt = new TextDecoder("gbk", {fatal: true}).decode(raw);
    }
    return parseInfoTxt(infoTxt);
}


/**
 * 将一张谱面移入回收站。
 * @param identifier 
 */
export async function disposeChart(identifier: string) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const TRASH_DIRECTORY = TRASH_DIR || (await queryMeta()).TRASH_DIR;
    if (!await exists(TRASH_DIRECTORY)) {
        await mkdir(TRASH_DIRECTORY);
    }
    const chartPath = await join(CHART_DIRECTORY, identifier);
    await rename(chartPath, await join(TRASH_DIRECTORY, identifier));
}

export async function getTextures(identifier: string) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const texturesDir = await join(CHART_DIRECTORY, identifier, "textures");
    if (!await exists(texturesDir)) {
        return [];
    }
    const textures = await readDir(texturesDir);

    return textures.filter((texture) => texture.isFile && texture.name.match(/\.(png|jpg|jpeg|gif)$/i));
}

export async function uploadTexture(identifier: string, texture: File) {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const texturesDir = await join(CHART_DIRECTORY, identifier, "textures");
    if (!await exists(texturesDir)) {
        await mkdir(texturesDir);
    }
    const texturePath = await join(texturesDir, texture.name);
    await writeFile(texturePath, new Uint8Array(await texture.arrayBuffer()));
}

export async function fetchTexture(identifier: string, name: string): Promise<ImageBitmap> {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const texturesDir = await join(CHART_DIRECTORY, identifier, "textures");
    if (!await exists(texturesDir)) {
        return null;
    }
    
    const texturePath = await join(texturesDir, name);
    if (!await exists(texturePath)) {
        return null;
    }
    const blob = new Blob([await readFile(texturePath)], { type: getMimeTypeFromName("image", name) })
    return await createImageBitmap(blob);
}

