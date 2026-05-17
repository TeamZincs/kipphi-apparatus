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
        getChart: (chartId) => ipcRenderer.invoke("fs:getChart", chartId),
        getChartProject: (chartId, returning) => ipcRenderer.invoke("fs:getChartProject", chartId, returning),
        readChart: (identifier, filename) => ipcRenderer.invoke("fs:readChart", identifier, filename),
        readAFileInChart: (identifier, filename, mimeType, returning) => 
            ipcRenderer.invoke("fs:readAFileInChart", identifier, filename, mimeType, returning),
        saveAFileToChart: (identifier, filename, data) => 
            ipcRenderer.invoke("fs:saveAFileToChart", identifier, filename, data),
        
        // 谱面回收
        disposeChart: (identifier) => ipcRenderer.invoke("fs:disposeChart", identifier),
        
        // 纹理
        getTextures: (identifier) => ipcRenderer.invoke("fs:getTextures", identifier),
        uploadTexture: (identifier, name, data) => ipcRenderer.invoke("fs:uploadTexture", identifier, name, data),
        fetchTexture: (identifier, name, returning) => ipcRenderer.invoke("fs:fetchTexture", identifier, name, returning),
        
        // 资源包
        queryRespackList: () => ipcRenderer.invoke("fs:queryRespackList"),
        getFileInRespack: (respackName, filename) => ipcRenderer.invoke("fs:getFileInRespack", respackName, filename),
        uploadRespack: (respackName, data) => ipcRenderer.invoke("fs:uploadRespack", respackName, data),
        
        // 下载
        downloadFile: (filename, data, opens) => ipcRenderer.invoke("fs:downloadFile", filename, data, opens),
    },
    
    // 打开系统路径
    openPath: (path) => ipcRenderer.invoke("shell:openPath", path),
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
                getChart: (chartId: string) => Promise<any>;
                getChartProject: (chartId: string, returning?: any) => Promise<any>;
                readChart: (identifier: string, filename: string) => Promise<any>;
                readAFileInChart: (identifier: string, filename: string, mimeType: string, returning?: any) => Promise<any>;
                saveAFileToChart: (identifier: string, filename: string, data: ArrayBuffer) => Promise<void>;
                disposeChart: (identifier: string) => Promise<void>;
                getTextures: (identifier: string) => Promise<string[]>;
                uploadTexture: (identifier: string, name: string, data: ArrayBuffer) => Promise<void>;
                fetchTexture: (identifier: string, name: string, returning?: any) => Promise<any>;
                queryRespackList: () => Promise<any[]>;
                getFileInRespack: (respackName: string, filename: string) => Promise<Blob | null>;
                uploadRespack: (respackName: string, data: ArrayBuffer) => Promise<void>;
                downloadFile: (filename: string, data: Uint8Array, opens?: boolean) => Promise<void>;
            };
            openPath: (path: string) => Promise<void>;
        };
    }
}
