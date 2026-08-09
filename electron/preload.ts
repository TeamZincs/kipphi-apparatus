import { contextBridge, ipcRenderer } from "electron";

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
    // 文件系统操作
    fs: {
        queryMeta: () => ipcRenderer.invoke("fs:queryMeta"),
        queryCharts: () => ipcRenderer.invoke("fs:queryCharts"),
        queryChartMeta: (chartId) => ipcRenderer.invoke("fs:queryChartMeta", chartId),
        queryChartHistory: (chartId) => ipcRenderer.invoke("fs:queryChartHistory", chartId),
        saveChartMeta: (chartId, metadata) => ipcRenderer.invoke("fs:saveChartMeta", chartId, metadata),
        saveChart: (chartId, chart, summary, beutify) => ipcRenderer.invoke("fs:saveChart", chartId, chart, summary, beutify),
        getChartData: (chartId) => ipcRenderer.invoke("fs:getChartData", chartId),
        getChartProjectData: (chartId) => ipcRenderer.invoke("fs:getChartProjectData", chartId),
        readChart: (identifier, filename) => ipcRenderer.invoke("fs:readChart", identifier, filename),
        readAFileInChart: (identifier, filename) => 
            ipcRenderer.invoke("fs:readAFileInChart", identifier, filename),
        saveAFileToChart: (identifier, filename, data) => 
            ipcRenderer.invoke("fs:saveAFileToChart", identifier, filename, data),
        loadChartImage: (chartId, filename) =>
            ipcRenderer.invoke("fs:loadChartImage", chartId, filename),
        
        // 谱面回收
        disposeChart: (identifier) => ipcRenderer.invoke("fs:disposeChart", identifier),
        
        // 纹理
        getTextures: (identifier) => ipcRenderer.invoke("fs:getTextures", identifier),
        uploadTexture: (identifier, name, data) => ipcRenderer.invoke("fs:uploadTexture", identifier, name, data),
        fetchTexture: (identifier, name) => ipcRenderer.invoke("fs:fetchTexture", identifier, name),
        
        // 资源包
        queryRespackList: () => ipcRenderer.invoke("fs:queryRespackList"),
        getFileInRespack: (respackName, filename) => ipcRenderer.invoke("fs:getFileInRespack", respackName, filename),
        uploadRespack: (respackName, data) => ipcRenderer.invoke("fs:uploadRespack", respackName, data),
        
        // 下载
        downloadFile: (filename, data, opens) => ipcRenderer.invoke("fs:downloadFile", filename, data, opens),
        
        // 谱面创建/导入
        checkChartDirExists: (chartId) => ipcRenderer.invoke("fs:checkChartDirExists", chartId),
        createChartDir: (chartId) => ipcRenderer.invoke("fs:createChartDir", chartId),
        saveTextFile: (chartId, filename, content) => ipcRenderer.invoke("fs:saveTextFile", chartId, filename, content),
        saveBinaryFile: (chartId, filename, data) => ipcRenderer.invoke("fs:saveBinaryFile", chartId, filename, data),
        createNestedDir: (chartId, subPath) => ipcRenderer.invoke("fs:createNestedDir", chartId, subPath),
        importChart: (params) => ipcRenderer.invoke("fs:importChart", params),
        saveChartProject: (params) => ipcRenderer.invoke("fs:saveChartProject", params),

        // 打开系统路径
        openPath: (path) => ipcRenderer.invoke("shell:openPath", path),
    },

    // 增量更新
    updater: {
        check: () => ipcRenderer.invoke("updater:check"),
        download: () => ipcRenderer.invoke("updater:download"),
        install: () => ipcRenderer.invoke("updater:install"),
        status: () => ipcRenderer.invoke("updater:status"),
        onChecking: (callback) => ipcRenderer.on("updater:checking", callback),
        onAvailable: (callback) => ipcRenderer.on("updater:available", (_, info) => callback(info)),
        onNotAvailable: (callback) => ipcRenderer.on("updater:not-available", (_, info) => callback(info)),
        onProgress: (callback) => ipcRenderer.on("updater:progress", (_, progress) => callback(progress)),
        onDownloaded: (callback) => ipcRenderer.on("updater:downloaded", (_, info) => callback(info)),
        onError: (callback) => ipcRenderer.on("updater:error", (_, error) => callback(error)),
        removeAllListeners: () => {
            ipcRenderer.removeAllListeners("updater:checking");
            ipcRenderer.removeAllListeners("updater:available");
            ipcRenderer.removeAllListeners("updater:not-available");
            ipcRenderer.removeAllListeners("updater:progress");
            ipcRenderer.removeAllListeners("updater:downloaded");
            ipcRenderer.removeAllListeners("updater:error");
        },
    },
});

// 类型声明
declare global {
    interface Window {
        electronAPI: {
            fs: {
                queryMeta: () => Promise<any>;
                queryCharts: () => Promise<any[]>;
                queryChartMeta: (chartId: string) => Promise<any>;
                queryChartHistory: (chartId: string) => Promise<any[]>;
                saveChartMeta: (chartId: string, metadata: any) => Promise<void>;
                saveChart: (chartId: string, chart: any, summary: string, beutify?: boolean) => Promise<void>;
                getChartData: (chartId: string) => Promise<any>;
                getChartProjectData: (chartId: string) => Promise<any>;
                readChart: (identifier: string, filename: string) => Promise<any>;
                readAFileInChart: (identifier: string, filename: string) => Promise<Uint8Array>;
                saveAFileToChart: (identifier: string, filename: string, data: ArrayBuffer) => Promise<void>;
                loadChartImage: (chartId: string, filename: string) => Promise<Uint8Array>;
                disposeChart: (identifier: string) => Promise<void>;
                getTextures: (identifier: string) => Promise<string[]>;
                uploadTexture: (identifier: string, name: string, data: ArrayBuffer) => Promise<void>;
                fetchTexture: (identifier: string, name: string) => Promise<Uint8Array | null>;
                queryRespackList: () => Promise<any[]>;
                getFileInRespack: (respackName: string, filename: string) => Promise<Uint8Array | null>;
                uploadRespack: (respackName: string, data: ArrayBuffer) => Promise<void>;
                downloadFile: (filename: string, data: Uint8Array, opens?: boolean) => Promise<void>;
                // 谱面创建/导入
                checkChartDirExists: (chartId: string) => Promise<boolean>;
                createChartDir: (chartId: string) => Promise<void>;
                saveTextFile: (chartId: string, filename: string, content: string) => Promise<void>;
                saveBinaryFile: (chartId: string, filename: string, data: ArrayBuffer) => Promise<void>;
                createNestedDir: (chartId: string, subPath: string) => Promise<void>;
                importChart: (params: {
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
                }) => Promise<string>;
                openPath: (path: string) => Promise<string>;
                saveChartProject: (params: {
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
                }) => Promise<string>;
            };
            // 增量更新
            updater: {
                check: () => Promise<{ checking: boolean; reason?: string; updateInfo?: any; error?: string }>;
                download: () => Promise<{ success: boolean; error?: string }>;
                install: () => Promise<{ success: boolean; error?: string }>;
                status: () => Promise<{ updateAvailable: boolean; updateDownloaded: boolean; updateInfo: any }>;
                onChecking: (callback: () => void) => void;
                onAvailable: (callback: (info: { version: string; totalSize?: number; isIncremental?: boolean }) => void) => void;
                onNotAvailable: (callback: (info: any) => void) => void;
                onProgress: (callback: (progress: any) => void) => void;
                onDownloaded: (callback: (info: any) => void) => void;
                onError: (callback: (error: string) => void) => void;
                removeAllListeners: () => void;
            };
        };
    }
}
