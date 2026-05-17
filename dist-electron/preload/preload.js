var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 文件系统操作
  fs: {
    queryMeta: () => import_electron.ipcRenderer.invoke("fs:queryMeta"),
    queryCharts: () => import_electron.ipcRenderer.invoke("fs:queryCharts"),
    queryChartMeta: (chartId) => import_electron.ipcRenderer.invoke("fs:queryChartMeta", chartId),
    queryChartHistory: (chartId) => import_electron.ipcRenderer.invoke("fs:queryChartHistory", chartId),
    saveChartMeta: (chartId, metadata) => import_electron.ipcRenderer.invoke("fs:saveChartMeta", chartId, metadata),
    saveChart: (chartId, chart, summary, beutify) => import_electron.ipcRenderer.invoke("fs:saveChart", chartId, chart, summary, beutify),
    getChart: (chartId) => import_electron.ipcRenderer.invoke("fs:getChart", chartId),
    getChartProject: (chartId, returning) => import_electron.ipcRenderer.invoke("fs:getChartProject", chartId, returning),
    readChart: (identifier, filename) => import_electron.ipcRenderer.invoke("fs:readChart", identifier, filename),
    readAFileInChart: (identifier, filename, mimeType, returning) => import_electron.ipcRenderer.invoke("fs:readAFileInChart", identifier, filename, mimeType, returning),
    saveAFileToChart: (identifier, filename, data) => import_electron.ipcRenderer.invoke("fs:saveAFileToChart", identifier, filename, data),
    // 谱面回收
    disposeChart: (identifier) => import_electron.ipcRenderer.invoke("fs:disposeChart", identifier),
    // 纹理
    getTextures: (identifier) => import_electron.ipcRenderer.invoke("fs:getTextures", identifier),
    uploadTexture: (identifier, name, data) => import_electron.ipcRenderer.invoke("fs:uploadTexture", identifier, name, data),
    fetchTexture: (identifier, name, returning) => import_electron.ipcRenderer.invoke("fs:fetchTexture", identifier, name, returning),
    // 资源包
    queryRespackList: () => import_electron.ipcRenderer.invoke("fs:queryRespackList"),
    getFileInRespack: (respackName, filename) => import_electron.ipcRenderer.invoke("fs:getFileInRespack", respackName, filename),
    uploadRespack: (respackName, data) => import_electron.ipcRenderer.invoke("fs:uploadRespack", respackName, data),
    // 下载
    downloadFile: (filename, data, opens) => import_electron.ipcRenderer.invoke("fs:downloadFile", filename, data, opens)
  },
  // 打开系统路径
  openPath: (path) => import_electron.ipcRenderer.invoke("shell:openPath", path)
});
