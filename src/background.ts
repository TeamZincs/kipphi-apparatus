/**
 * 条件导出：根据构建目标选择后台实现
 * 
 * 通过 VITE_BACKEND 环境变量选择实现：
 * - 未设置或 "tauri"：使用 Tauri 实现 (@tauri-apps/api)
 * - "electron"：使用 Electron IPC 调用后端
 */

// 运行环境检测
const isElectronBuild = import.meta.env.VITE_BACKEND === "electron";

console.log(`isElectronBuild: ${isElectronBuild}`)

// ============== 类型导出 ==============
export type {
    ChartMetadata,
    ChartHistoryEntry,
    NonImageReturnType,
    RespackEntry,
    ImportChartParams,
    SaveChartProjectParams,
} from "./background-tauri";

export { _ReturnType as ReturnType } from "./background-tauri";
export type { _ReturnType as BGReturnType } from "./background-tauri";

// ============== 实现加载 ==============
const impl = isElectronBuild
    ? await import("./background-electron")
    : await import("./background-tauri");

// ============== 重新导出所有函数 ==============
export const queryMeta = impl.queryMeta;
export const getPathOfChart = impl.getPathOfChart;
export const getTexturePathOf = impl.getTexturePathOf;
export const queryCharts = impl.queryCharts;
export const queryChartMeta = impl.queryChartMeta;
export const queryChartHistory = impl.queryChartHistory;
export const saveChartMeta = impl.saveChartMeta;
export const saveChart = impl.saveChart;
export const getChartProject = impl.getChartProject;
export const getChart = impl.getChart;
export const readAFileInChart = impl.readAFileInChart;
export const readChart = impl.readChart;
export const saveAFileToChart = impl.saveAFileToChart;
export const parseInfoTxt = impl.parseInfoTxt;
export const parseRawInfoTxt = impl.parseRawInfoTxt;
export const disposeChart = impl.disposeChart;
export const getTextures = impl.getTextures;
export const uploadTexture = impl.uploadTexture;
export const fetchTexture = impl.fetchTexture;
export const queryRespackList = impl.queryRespackList;
export const getFileInRespack = impl.getFileInRespack;
export const uploadRespack = impl.uploadRespack;
export const downloadFile = impl.downloadFile;
export const importChart = impl.importChart;
export const saveChartProject = impl.saveChartProject;
export const checkChartDirExists = impl.checkChartDirExists;
export const loadChartImage = impl.loadChartImage;
export const openPath = impl.openPath;

