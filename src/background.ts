import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, readDir, readTextFile, mkdir, readFile, writeFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";

import YAML from "yaml";

import { getExtensionFromName, getMimeTypeFromName } from "#/util";
import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { unzip } from "./uncompress";

export interface ChartMetadata {
    title: string;
    chart: string;
    music: string;
    illustration: string;
    type: "KPA1" | "KPA2" | "RPE";
    durationSecs: number;
}

export interface ChartHistoryEntry {
    time: number;
    summary: string;
    filename: string;
}

export enum ReturnType {
    u8,
    blob,
    arrayBuffer,
    imageBmp
}

export type NonImageReturnType = ReturnType.u8 | ReturnType.blob | ReturnType.arrayBuffer;

type TypeMap<RT extends ReturnType> = RT extends ReturnType.u8 ? Uint8Array<ArrayBuffer> :
RT extends ReturnType.blob ? Blob :
RT extends ReturnType.arrayBuffer ? ArrayBuffer :
RT extends ReturnType.imageBmp ? ImageBitmap :
null;

const returningFromU8 = async <RT extends ReturnType>(u8Arr: Uint8Array<ArrayBuffer>, type: RT, mime: string): Promise<TypeMap<RT> > =>
    type === ReturnType.u8 ? u8Arr as TypeMap<RT> :
    type === ReturnType.blob ? new Blob([u8Arr], { type: mime }) as TypeMap<RT> :
    type === ReturnType.arrayBuffer ? u8Arr.buffer as TypeMap<RT> :
    type === ReturnType.imageBmp ? await createImageBitmap(new Blob([u8Arr], { type: mime })) as TypeMap<RT> :
    null;

type ChartHistory = ChartHistoryEntry[];


let APP_DATA_DIR: string;
let CHART_DIR: string;
let TRASH_DIR: string;
let RESPACK_DIR: string;
let DOWNLOAD_DIR: string;

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
        RESPACK_DIR = await join(APP_DATA_DIR, "respack");
        DOWNLOAD_DIR = await join(APP_DATA_DIR, "downloads");
    }
    return {
        APP_DATA_DIR, CHART_DIR, TRASH_DIR, RESPACK_DIR, DOWNLOAD_DIR
    }
}

export async function getPathOfChart(chartIdentifier: string) {
    const { CHART_DIR } = await queryMeta();
    return await join(CHART_DIR, chartIdentifier);
}

export async function getTexturePathOf(chartIdentifier: string) {
    return await join(await getPathOfChart(chartIdentifier), "textures");
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

export async function queryChartMeta(chartId: string) {
    const CHART_DIR = (await queryMeta()).CHART_DIR
    const filePath = await join(CHART_DIR, chartId, "metadata.json");
    const metadata = JSON.parse(await readTextFile(filePath)) as ChartMetadata;
    return metadata;
}

export async function queryChartHistory(chartId: string): Promise<ChartHistory> {
    const CHART_DIR = (await queryMeta()).CHART_DIR;
    const filePath = await join(CHART_DIR, chartId, "history.json");
    if (!await exists(filePath)) {
        return null;
    }
    const fileContent = await readTextFile(filePath);
    try {
        const history = JSON.parse(fileContent) as ChartHistory;
        if (!Array.isArray(history)) {
            return null;
        }
        return history;
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.error("History file is not a valid JSON:", fileContent)
            return null;
        }
        throw e;
    }
}

export async function saveChartMeta(chartId: string, metadata: ChartMetadata) {
    const CHART_DIR = (await queryMeta()).CHART_DIR;
    const filePath = await join(CHART_DIR, chartId, "metadata.json");
    await writeTextFile(filePath, JSON.stringify(metadata, null, 2));
}

async function saveChartHistoryEntry(chartId: string, entry: ChartHistoryEntry) {
    const CHART_DIR = (await queryMeta()).CHART_DIR;
    const filePath = await join(CHART_DIR, chartId, "history.json");
    let history = await queryChartHistory(chartId);
    if (history) {
        history.push(entry);
    } else {
        history = [entry];
    }

    await writeTextFile(filePath, JSON.stringify(history, null, 2));
}

export async function saveChart(chartId: string, chart: Chart, summary: string) {
    const chartMeta = await queryChartMeta(chartId);
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const chartStr = JSON.stringify(chart.dumpKPA());

    const date = new Date();
    const dateStr = date.toISOString()
        .replace(/\:/g, "-")
        .replace(/\./g, "_")
        .replace(/T/g, " ")
        .replace(/Z/g, "");
    const chartPath = `chart.${dateStr}.kpa2.json`;
    chartMeta.chart = chartPath;

    if (chartMeta.type !== "KPA2") {
        chartMeta.type = "KPA2";
    }

    await saveChartHistoryEntry(chartId, {
        summary,
        filename: chartPath,
        time: date.getTime()
    });
    
    await saveChartMeta(chartId, chartMeta);
    const filePath = await join(CHART_DIRECTORY, chartId, chartPath);
    console.log("Chart saved to", filePath);
    await writeTextFile(filePath, chartStr);
}

interface ChartStruct<RT extends NonImageReturnType = ReturnType.blob> {
    chart: Chart;
    music: TypeMap<RT>;
    illustration: TypeMap<RT>;
}

/**
 * 获取谱面项目（谱面对象，音乐和背景资源）。
 * @param chartId 
 * @param returning 使用此参数指定返回的音乐背景资源类型
 * @returns 
 */
export async function getChartProject<RT extends NonImageReturnType = ReturnType.blob>(chartId: string, returning?: RT): Promise<ChartStruct<RT>> {
    const metadata = await queryChartMeta(chartId);
    const chartPath = await join(CHART_DIR, chartId, metadata.chart);
    const chartType = metadata.type;
    const musicPath = metadata.music;
    const illustrationPath = metadata.illustration;
    const chartData = JSON.parse(await readTextFile(chartPath)) as ChartDataRPE | ChartDataKPA | ChartDataKPA2;
    const chart = chartType === "RPE"
        ? Chart.fromRPEJSON(chartData as ChartDataRPE, metadata.durationSecs)
        : Chart.fromKPAJSON(chartData as ChartDataKPA | ChartDataKPA2);
    const music = await readAFileInChart(
        chartId,
        musicPath,
        getMimeTypeFromName("audio", musicPath),
        returning
    );
    const illustration = await readAFileInChart(
        chartId,
        illustrationPath,
        getMimeTypeFromName("image", illustrationPath),
        returning
    );
    return {
        chart,
        music,
        illustration,
    }
}

export async function getChart(chartId: string): Promise<Chart> {
    const metadata = await queryChartMeta(chartId);
    const chartPath = await join(CHART_DIR, chartId, metadata.chart);
    const chartType = metadata.type;
    
    const chartData = JSON.parse(await readTextFile(chartPath)) as ChartDataRPE | ChartDataKPA | ChartDataKPA2;
    const chart = chartType === "RPE"
        ? Chart.fromRPEJSON(chartData as ChartDataRPE, metadata.durationSecs)
        : Chart.fromKPAJSON(chartData as ChartDataKPA | ChartDataKPA2);
    return chart;
}

export async function readAFileInChart<RT extends ReturnType = ReturnType.blob>(identifier: string, filename: string, mimeType: string, returning?: RT) {
    returning = returning || ReturnType.blob as RT;
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    return returningFromU8(
        await readFile(await join(CHART_DIRECTORY, identifier, filename)),
        returning,
        mimeType
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

export async function getTextures(identifier: string): Promise<string[]> {
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const texturesDir = await join(CHART_DIRECTORY, identifier, "textures");
    if (!await exists(texturesDir)) {
        return [];
    }
    const textures = await readDir(texturesDir);

    const names = textures
        .filter(texture => texture.isFile)
        .map(file => file.name)
        .filter(name => name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i));
    if (!names.includes("line.png")) {
        names.push("line.png");
    }
    return names;
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

export async function fetchTexture<RT extends ReturnType = ReturnType.imageBmp>(identifier: string, name: string, returning?: RT): Promise<TypeMap<RT> > {
    returning = returning || ReturnType.imageBmp as RT;
    const CHART_DIRECTORY = CHART_DIR || (await queryMeta()).CHART_DIR;
    const texturesDir = await join(CHART_DIRECTORY, identifier, "textures");
    if (await exists(texturesDir)) {
        
        const texturePath = await join(texturesDir, name);
        if (await exists(texturePath)) {
            return await returningFromU8(await readFile(texturePath), returning, getMimeTypeFromName("image", name));
        }
    }
    // 如果不能搜索到，则在此谱面根目录搜索
    const thisChartDir = await join(CHART_DIRECTORY, identifier);
    const texturePath = await join(thisChartDir, name);
    if (await exists(texturePath)) {
        const u8Arr = await readFile(texturePath);
        try { // 移动到textures中
            const texturesDir = await join(thisChartDir, "textures");
            if (!await exists(texturesDir)) {
                await mkdir(texturesDir);
            }
            const texturePath = await join(texturesDir, name);
            await writeFile(texturePath, u8Arr);
        } catch {}
        return await returningFromU8(u8Arr, returning, getMimeTypeFromName("image", name));
    }
}

export interface RespackEntry {
    pathname: string;
    shortPathname: string;
    name: string;
}

export async function queryRespackList() {
    const RESPACK_DIRECTORY = RESPACK_DIR || (await queryMeta()).RESPACK_DIR;
    if (!await exists(RESPACK_DIRECTORY)) {
        await mkdir(RESPACK_DIRECTORY);
    }
    const respacks = await readDir(RESPACK_DIRECTORY);
    const filtered: RespackEntry[] = [];
    for (const entry of respacks) {
        if (!entry.isDirectory) {
            continue;
        }
        const metaPath = await join(RESPACK_DIRECTORY, entry.name, "info.yml")
        if (await exists(metaPath)) {
            const ymlContent = await readTextFile(metaPath);
            try {
                const respackMetadata = YAML.parse(ymlContent);
                if (respackMetadata.name) {
                    filtered.push({
                        pathname: await join(RESPACK_DIRECTORY, entry.name),
                        name: respackMetadata.name,
                        shortPathname: entry.name
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    return filtered;
}

export async function getFileInRespack(respackName: string, filename: string) {
    if (respackName === "Default") {
        return await (await fetch("/default/" + filename)).blob();
    }
    const RESPACK_DIRECTORY = RESPACK_DIR || (await queryMeta()).RESPACK_DIR;
    const respackPath = await join(RESPACK_DIRECTORY, respackName);
    if (!await exists(respackPath)) {
        throw new Error("资源包不存在")
    }
    const resPath =  await join(respackPath, filename);
    if (!await exists(resPath)) {
        return null;
    }
    return new Blob([await readFile(resPath)])
}

export async function uploadRespack(respackName: string, zipFile: Blob) {
    const RESPACK_DIRECTORY = RESPACK_DIR || (await queryMeta()).RESPACK_DIR;
    const respackPath = await join(RESPACK_DIRECTORY, respackName);
    const unzipped = await unzip(zipFile);
    if (!unzipped.success) {
        throw new Error("Decompression failed.")
    }
    if (await exists(respackPath)) {
        throw new Error("Occupied.");
    }
    await mkdir(respackPath);
    for (const entry of unzipped.files) {
        const name = entry.name;
        await writeFile(await join(respackPath, name), new Uint8Array(entry.buffer));
    }
}

export async function downloadFile(filename: string, file: Uint8Array, opens: boolean = false) {
    const downloadDirectory = DOWNLOAD_DIR || (await queryMeta()).DOWNLOAD_DIR;
    if (!await exists(downloadDirectory)) {
        await mkdir(downloadDirectory);
    }
    await writeFile(await join(downloadDirectory, filename), file);
    if (opens) openPath(downloadDirectory);
}
