import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import * as fs from "fs/promises";
import YAML from "yaml";
import JSZip from "jszip";
import { Chart, ChartDataKPA, ChartDataKPA2, ChartDataRPE } from "kipphi";

let mainWindow = null;
app.setName("com.zincs.kpa-electron");

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(import.meta.dirname, "../preload/preload.js"),
        },
        autoHideMenuBar: true,
    });

    if (app.isPackaged) {
        mainWindow.loadFile(path.join(import.meta.dirname, "../../build/index.html"));
    } else {
        mainWindow.loadURL("http://localhost:1420");
    }
};

// ============== 目录路径 ==============
let APP_DATA_DIR;
let CHART_DIR;
let TRASH_DIR;
let RESPACK_DIR;
let DOWNLOAD_DIR;

function getAppDataDir() {
    if (!APP_DATA_DIR) {
        APP_DATA_DIR = path.join(app.getPath("userData"));
        CHART_DIR = path.join(APP_DATA_DIR, "charts");
        TRASH_DIR = path.join(APP_DATA_DIR, "trash");
        RESPACK_DIR = path.join(APP_DATA_DIR, "respack");
        DOWNLOAD_DIR = path.join(APP_DATA_DIR, "downloads");
    }
    return { APP_DATA_DIR, CHART_DIR, TRASH_DIR, RESPACK_DIR, DOWNLOAD_DIR };
}

async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// ============== 工具函数 ==============
async function pathExists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

async function readDirEntries(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(e => ({ name: e.name, isDirectory: e.isDirectory() }));
}





// ============== IPC 处理器 ==============

// 查询元目录
ipcMain.handle("fs:queryMeta", async () => {
    const { APP_DATA_DIR, CHART_DIR, TRASH_DIR, RESPACK_DIR, DOWNLOAD_DIR } = getAppDataDir();
    return { APP_DATA_DIR, CHART_DIR, TRASH_DIR, RESPACK_DIR, DOWNLOAD_DIR };
});

// 查询谱面列表
ipcMain.handle("fs:queryCharts", async () => {
    const { CHART_DIR } = getAppDataDir();
    const charts = await readDirEntries(CHART_DIR);
    const result = [];
    
    for (const chart of charts) {
        if (chart.isDirectory) {
            try {
                const metadata = JSON.parse(await fs.readFile(path.join(CHART_DIR, chart.name, "metadata.json"), "utf-8"));
                const history = await queryChartHistory(chart.name);
                const imageData = await fs.readFile(path.join(CHART_DIR, chart.name, metadata.illustration));
                result.push({
                    chartPath: metadata.chart,
                    identifier: chart.name,
                    title: metadata.title,
                    image: new Blob([imageData]),
                    type: metadata.type,
                    lastModified: history?.[history.length - 1]?.time ?? 0,
                });
            } catch (e) {
                console.error(`Failed to read chart ${chart.name}:`, e);
            }
        }
    }
    result.sort((a, b) => b.lastModified - a.lastModified);
    return result;
});

// 查询谱面元数据
ipcMain.handle("fs:queryChartMeta", async (_, chartId) => {
    const { CHART_DIR } = getAppDataDir();
    const filePath = path.join(CHART_DIR, chartId, "metadata.json");
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
});

// 查询谱面历史
async function queryChartHistory(chartId) {
    const { CHART_DIR } = getAppDataDir();
    const filePath = path.join(CHART_DIR, chartId, "history.json");
    if (!await pathExists(filePath)) return null;
    try {
        const history = JSON.parse(await fs.readFile(filePath, "utf-8"));
        return Array.isArray(history) ? history : null;
    } catch {
        return null;
    }
}

ipcMain.handle("fs:queryChartHistory", async (_, chartId) => {
    return queryChartHistory(chartId);
});

// 保存谱面元数据
ipcMain.handle("fs:saveChartMeta", async (_, chartId, metadata) => {
    const { CHART_DIR } = getAppDataDir();
    const filePath = path.join(CHART_DIR, chartId, "metadata.json");
    await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), "utf-8");
});

// 保存谱面（包含历史记录）
ipcMain.handle("fs:saveChart", async (_, chartId, chartData, summary, beutify = false) => {
    const { CHART_DIR } = getAppDataDir();
    const chartMeta = JSON.parse(await fs.readFile(path.join(CHART_DIR, chartId, "metadata.json"), "utf-8"));
    const chartStr = beutify ? JSON.stringify(chartData, null, 2) : JSON.stringify(chartData);

    const date = new Date();
    const dateStr = date.toISOString()
        .replace(/:/g, "-")
        .replace(/\./g, "_")
        .replace(/T/g, " ")
        .replace(/Z/g, "");
    const chartPath = `chart.${dateStr}.kpa2.json`;
    chartMeta.chart = chartPath;
    if (chartMeta.type !== "KPA2") chartMeta.type = "KPA2";

    // 保存历史记录
    const historyFile = path.join(CHART_DIR, chartId, "history.json");
    let history = await queryChartHistory(chartId) || [];
    history.push({
        summary,
        filename: chartPath,
        time: date.getTime(),
    });
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2), "utf-8");

    // 保存元数据和谱面
    await fs.writeFile(path.join(CHART_DIR, chartId, "metadata.json"), JSON.stringify(chartMeta, null, 2), "utf-8");
    await fs.writeFile(path.join(CHART_DIR, chartId, chartPath), chartStr, "utf-8");
});

// 获取谱面
ipcMain.handle("fs:getChart", async (_, chartId) => {
    const { CHART_DIR } = getAppDataDir();
    const metadata = JSON.parse(await fs.readFile(path.join(CHART_DIR, chartId, "metadata.json"), "utf-8"));
    const chartData = JSON.parse(await fs.readFile(path.join(CHART_DIR, chartId, metadata.chart), "utf-8"));
    const chart = metadata.type === "RPE"
        ? Chart.fromRPEJSON(chartData, metadata.durationSecs)
        : Chart.fromKPAJSON(chartData);
    return chart;
});

// 获取谱面项目
ipcMain.handle("fs:getChartProject", async (_, chartId, returning = "blob") => {
    const { CHART_DIR } = getAppDataDir();
    const metadata = JSON.parse(await fs.readFile(path.join(CHART_DIR, chartId, "metadata.json"), "utf-8"));
    const chartData = JSON.parse(await fs.readFile(path.join(CHART_DIR, chartId, metadata.chart), "utf-8"));
    const chart = metadata.type === "RPE"
        ? Chart.fromRPEJSON(chartData, metadata.durationSecs)
        : Chart.fromKPAJSON(chartData);

    const musicData = await fs.readFile(path.join(CHART_DIR, chartId, metadata.music));
    const imageData = await fs.readFile(path.join(CHART_DIR, chartId, metadata.illustration));

    return {
        chart,
        music: returning === "u8" ? musicData : new Blob([musicData]),
        illustration: returning === "u8" ? imageData : new Blob([imageData]),
    };
});

// 读取谱面文件
ipcMain.handle("fs:readChart", async (_, identifier, filename) => {
    const { CHART_DIR } = getAppDataDir();
    return JSON.parse(await fs.readFile(path.join(CHART_DIR, identifier, filename), "utf-8"));
});

// 读取谱面中的文件
ipcMain.handle("fs:readAFileInChart", async (_, identifier, filename, mimeType, returning = "blob") => {
    const { CHART_DIR } = getAppDataDir();
    const data = await fs.readFile(path.join(CHART_DIR, identifier, filename));
    return returning === "u8" ? data : new Blob([data], { type: mimeType });
});

// 保存文件到谱面
ipcMain.handle("fs:saveAFileToChart", async (_, identifier, filename, data) => {
    const { CHART_DIR } = getAppDataDir();
    await fs.writeFile(path.join(CHART_DIR, identifier, filename), new Uint8Array(data));
});

// 移入回收站
ipcMain.handle("fs:disposeChart", async (_, identifier) => {
    const { CHART_DIR, TRASH_DIR } = getAppDataDir();
    await ensureDir(TRASH_DIR);
    await fs.rename(path.join(CHART_DIR, identifier), path.join(TRASH_DIR, identifier));
});

// 获取纹理列表
ipcMain.handle("fs:getTextures", async (_, identifier) => {
    const { CHART_DIR } = getAppDataDir();
    const texturesDir = path.join(CHART_DIR, identifier, "textures");
    if (!await pathExists(texturesDir)) return [];
    
    const textures = await readDirEntries(texturesDir);
    const names = textures
        .filter(t => !t.isDirectory)
        .map(t => t.name)
        .filter(n => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(n));
    
    if (!names.includes("line.png")) names.push("line.png");
    return names;
});

// 上传纹理
ipcMain.handle("fs:uploadTexture", async (_, identifier, name, data) => {
    const { CHART_DIR } = getAppDataDir();
    const texturesDir = path.join(CHART_DIR, identifier, "textures");
    await ensureDir(texturesDir);
    await fs.writeFile(path.join(texturesDir, name), new Uint8Array(data));
});

// 获取纹理
ipcMain.handle("fs:fetchTexture", async (_, identifier, name, returning = "imageBmp") => {
    const { CHART_DIR } = getAppDataDir();
    
    // 先搜索 textures 目录
    const texturesDir = path.join(CHART_DIR, identifier, "textures");
    let texturePath = path.join(texturesDir, name);
    if (!await pathExists(texturePath)) {
        // 再搜索谱面根目录
        texturePath = path.join(CHART_DIR, identifier, name);
        if (!await pathExists(texturePath)) return null;
    }
    
    const data = await fs.readFile(texturePath);
    return returning === "u8" ? data : new Blob([data]);
});

// 查询资源包列表
ipcMain.handle("fs:queryRespackList", async () => {
    const { RESPACK_DIR } = getAppDataDir();
    const respacks = await readDirEntries(RESPACK_DIR);
    const result = [];
    
    for (const entry of respacks) {
        if (entry.isDirectory) {
            const metaPath = path.join(RESPACK_DIR, entry.name, "info.yml");
            if (await pathExists(metaPath)) {
                try {
                    const yml = YAML.parse(await fs.readFile(metaPath, "utf-8"));
                    if (yml.name) {
                        result.push({
                            pathname: path.join(RESPACK_DIR, entry.name),
                            name: yml.name,
                            shortPathname: entry.name,
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
    return result;
});

// 获取资源包文件
ipcMain.handle("fs:getFileInRespack", async (_, respackName, filename) => {
    const { RESPACK_DIR } = getAppDataDir();
    if (respackName === "Default") return null; // 由前端处理
    const filePath = path.join(RESPACK_DIR, respackName, filename);
    if (!await pathExists(filePath)) return null;
    return new Blob([await fs.readFile(filePath)]);
});

// 上传资源包
ipcMain.handle("fs:uploadRespack", async (_, respackName, data) => {
    const { RESPACK_DIR } = getAppDataDir();
    const respackPath = path.join(RESPACK_DIR, respackName);
    if (await pathExists(respackPath)) throw new Error("Occupied.");
    
    const zip = await JSZip.loadAsync(data);
    await fs.mkdir(respackPath, { recursive: true });
    
    for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
            const filePath = path.join(respackPath, name);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, await file.async("nodebuffer"));
        }
    }
});

// 下载文件
ipcMain.handle("fs:downloadFile", async (_, filename, data, opens = false) => {
    const { DOWNLOAD_DIR } = getAppDataDir();
    await ensureDir(DOWNLOAD_DIR);
    const filePath = path.join(DOWNLOAD_DIR, filename);
    await fs.writeFile(filePath, data);
    if (opens) shell.showItemInFolder(filePath);
});

// 打开路径
ipcMain.handle("shell:openPath", async (_, filePath) => {
    shell.showItemInFolder(filePath);
});

// ============== 启动 ==============
getAppDataDir();
Promise.all([
    ensureDir(APP_DATA_DIR),
    ensureDir(CHART_DIR),
    ensureDir(TRASH_DIR),
    ensureDir(RESPACK_DIR),
    ensureDir(DOWNLOAD_DIR),
    app.whenReady()
]).then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
