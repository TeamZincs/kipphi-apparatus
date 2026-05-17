/**
 * Electron IPC 客户端
 * 通过 preload.js 暴露的 API 调用后端进程
 */

import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { getMimeTypeFromName } from "#/util";

// 运行时检测 Electron 环境
const isElectron = typeof window !== "undefined" && "electronAPI" in window;

// 类型定义
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

export interface RespackEntry {
    pathname: string;
    shortPathname: string;
    name: string;
}

export interface ChartStruct<RT extends NonImageReturnType = ReturnType.blob> {
    chart: Chart;
    music: RT extends ReturnType.u8 ? Uint8Array : Blob;
    illustration: RT extends ReturnType.u8 ? Uint8Array : Blob;
}

// ============== IPC 客户端 ==============

async function ipcCall<T>(channel: string, ...args: any[]): Promise<T> {
    if (!isElectron) {
        throw new Error("Electron API not available");
    }
    return window.electronAPI.fs[channel](...args);
}

// ============== 导出函数 ==============

export async function queryMeta() {
    return ipcCall("queryMeta");
}

export async function getPathOfChart(chartIdentifier: string) {
    const { CHART_DIR } = await queryMeta();
    return `${CHART_DIR}/${chartIdentifier}`;
}

export async function getTexturePathOf(chartIdentifier: string) {
    return `${await getPathOfChart(chartIdentifier)}/textures`;
}

export async function queryCharts() {
    return await ipcCall("queryCharts") as {
        chartPath: string,
        identifier: string,
        title: string,
        illustration: string,
        type: "KPA1" | "KPA2" | "RPE",
        lastModified: number
    }[];
}

export async function queryChartMeta(chartId: string) {
    return ipcCall("queryChartMeta", chartId);
}

export async function queryChartHistory(chartId: string) {
    return ipcCall("queryChartHistory", chartId);
}

export async function saveChartMeta(chartId: string, metadata: ChartMetadata) {
    return ipcCall("saveChartMeta", chartId, metadata);
}

export async function saveChart(chartId: string, chart: Chart, summary: string, beutify = false) {
    return ipcCall("saveChart", chartId, chart.dumpKPA(), summary, beutify);
}

export async function getChartProject(
    chartId: string,
): Promise<{ chart: Chart; music: Blob; illustration: Blob }> {
    const data = await ipcCall<{
        chartData: ChartDataRPE | ChartDataKPA | ChartDataKPA2;
        chartType: "KPA1" | "KPA2" | "RPE";
        durationSecs: number;
        music: Uint8Array;
        illustration: Uint8Array;
    }>("getChartProjectData", chartId);

    const chart = data.chartType === "RPE"
        ? Chart.fromRPEJSON(data.chartData as ChartDataRPE, data.durationSecs)
        : Chart.fromKPAJSON(data.chartData as ChartDataKPA | ChartDataKPA2);

    return {
        chart,
        music: new Blob([new Uint8Array(data.music)]),
        illustration: new Blob([new Uint8Array(data.illustration)]),
    };
}

export async function getChart(chartId: string): Promise<Chart> {
    const data = await ipcCall<{
        chartData: ChartDataRPE | ChartDataKPA | ChartDataKPA2;
        chartType: "KPA1" | "KPA2" | "RPE";
        durationSecs: number;
    }>("getChartData", chartId);

    return data.chartType === "RPE"
        ? Chart.fromRPEJSON(data.chartData as ChartDataRPE, data.durationSecs)
        : Chart.fromKPAJSON(data.chartData as ChartDataKPA | ChartDataKPA2);
}

export async function readAFileInChart(
    identifier: string,
    filename: string,
): Promise<Blob> {
    const u8 = await ipcCall<Uint8Array>("readAFileInChart", identifier, filename);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = ext === "jpg" ? "image/jpeg" : getMimeTypeFromName(filename);
    return new Blob([new Uint8Array(u8)], { type: mimeType });
}

export async function readChart(identifier: string, filename: string) {
    return ipcCall("readChart", identifier, filename);
}

export async function saveAFileToChart(identifier: string, filename: string, blob: Blob) {
    return ipcCall("saveAFileToChart", identifier, filename, await blob.arrayBuffer());
}

export async function loadChartImage(chartId: string, filename: string): Promise<Blob | null> {
    const u8 = await ipcCall<Uint8Array | null>("loadChartImage", chartId, filename);
    if (!u8) return null;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = ext === "jpg" ? "image/jpeg" : getMimeTypeFromName(filename);
    return new Blob([new Uint8Array(u8)], { type: mimeType });
}

export function parseInfoTxt(infoTxt: string) {
    const lines = infoTxt.split("\n");
    const info: Record<string, string> = {};
    for (const line of lines) {
        if (line.startsWith("#")) continue;
        if (line.trim() === "") continue;
        const [key, value] = line.split(":");
        if (!key || !value) {
            console.log(`Invalid line: '${line}'d`);
            continue;
        }
        info[key.trim()] = value.trim();
    }
    return info;
}

export function parseRawInfoTxt(raw: Uint8Array | ArrayBuffer) {
    let infoTxt: string;
    try {
        infoTxt = new TextDecoder("utf-8", { fatal: true }).decode(raw);
    } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        infoTxt = new TextDecoder("gbk", { fatal: true }).decode(raw);
    }
    return parseInfoTxt(infoTxt);
}

export async function disposeChart(identifier: string) {
    return ipcCall("disposeChart", identifier);
}

export async function getTextures(identifier: string) {
    return ipcCall("getTextures", identifier);
}

export async function uploadTexture(identifier: string, texture: File) {
    return ipcCall("uploadTexture", identifier, texture.name, await texture.arrayBuffer());
}

export async function fetchTexture(
    identifier: string,
    name: string,
): Promise<Blob | null> {
    const u8 = await ipcCall<Uint8Array | null>("fetchTexture", identifier, name);
    if (!u8) {
        return null
    }
    const mimeType = name.endsWith(".jpg") ? "image/jpeg" : getMimeTypeFromName(name);
    return new Blob([new Uint8Array(u8)], { type: mimeType });
}

export async function queryRespackList() {
    return ipcCall("queryRespackList");
}

export async function getFileInRespack(respackName: string, filename: string): Promise<Blob | null> {
    const u8 = await ipcCall<Uint8Array | null>("getFileInRespack", respackName, filename);
    if (!u8) return null;
    const mimeType = filename.endsWith(".jpg") ? "image/jpeg" : getMimeTypeFromName(filename);
    return new Blob([new Uint8Array(u8)], { type: mimeType });
}

export async function uploadRespack(respackName: string, zipFile: Blob) {
    return ipcCall("uploadRespack", respackName, await zipFile.arrayBuffer());
}

export async function downloadFile(filename: string, file: Uint8Array, opens = false) {
    return ipcCall("downloadFile", filename, file, opens);
}

// ============== 谱面创建/导入函数 ==============

/**
 * 检查谱面目录是否存在
 */
export async function checkChartDirExists(chartId: string): Promise<boolean> {
    return ipcCall("checkChartDirExists", chartId);
}

/**
 * 创建谱面目录
 */
export async function createChartDir(chartId: string): Promise<void> {
    return ipcCall("createChartDir", chartId);
}

/**
 * 保存文本文件到谱面目录
 */
export async function saveTextFile(chartId: string, filename: string, content: string): Promise<void> {
    return ipcCall("saveTextFile", chartId, filename, content);
}

/**
 * 保存二进制文件到谱面目录
 */
export async function saveBinaryFile(chartId: string, filename: string, data: Uint8Array | ArrayBuffer): Promise<void> {
    const buffer = data instanceof ArrayBuffer ? data : data.buffer;
    return ipcCall("saveBinaryFile", chartId, filename, new Uint8Array(buffer));
}

/**
 * 创建嵌套目录
 */
export async function createNestedDir(chartId: string, subPath: string): Promise<void> {
    return ipcCall("createNestedDir", chartId, subPath);
}

// ============== 谱面导入函数 ==============

export interface ImportChartParams {
    /** 谱面ID */
    id: string;
    /** 谱面内容 (JSON字符串) */
    chartContent: string;
    /** 谱面类型 */
    chartType: "RPE" | "KPA1" | "KPA2";
    /** 标题 */
    title: string;
    /** 音乐数据 */
    musicData: ArrayBuffer;
    /** 音乐扩展名 */
    musicExtension: string;
    /** 插图数据 */
    illustrationData: ArrayBuffer;
    /** 插图扩展名 */
    illustrationExtension: string;
    /** 音乐时长(秒) */
    durationSecs: number;
    /** 额外文件(可选) */
    extraFiles?: { name: string; data: ArrayBuffer }[];
}

/**
 * 导入谱面 - 一次性完成所有文件操作
 */
export async function importChart(params: ImportChartParams): Promise<string> {
    return saveChartProject({
        id: params.id,
        chartContent: params.chartContent,
        chartType: params.chartType,
        title: params.title,
        musicData: params.musicData,
        musicExtension: params.musicExtension,
        illustrationData: params.illustrationData,
        illustrationExtension: params.illustrationExtension,
        durationSecs: params.durationSecs,
        extraFiles: params.extraFiles,
    });
}

// ============== 保存谱面项目函数 ==============

export interface SaveChartProjectParams {
    id: string;
    chartContent: string;
    chartType: "RPE" | "KPA1" | "KPA2";
    title: string;
    musicData: ArrayBuffer;
    musicExtension: string;
    illustrationData: ArrayBuffer;
    illustrationExtension: string;
    durationSecs: number;
    extraFiles?: { name: string; data: ArrayBuffer }[];
}

/**
 * 保存谱面项目 - 一次性完成所有文件操作
 */
export async function saveChartProject(params: SaveChartProjectParams): Promise<string> {
    const extraFiles = params.extraFiles?.map(f => ({
        name: f.name,
        data: new Uint8Array(f.data instanceof ArrayBuffer ? f.data : f.data.buffer)
    }));
    return ipcCall("saveChartProject", { ...params, extraFiles });
}
