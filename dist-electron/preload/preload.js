var r = require("electron");
r.contextBridge.exposeInMainWorld("electronAPI", {
  // 文件系统操作
  fs: {
    queryMeta: () => r.ipcRenderer.invoke("fs:queryMeta"),
    queryCharts: () => r.ipcRenderer.invoke("fs:queryCharts"),
    queryChartMeta: (e) => r.ipcRenderer.invoke("fs:queryChartMeta", e),
    queryChartHistory: (e) => r.ipcRenderer.invoke("fs:queryChartHistory", e),
    saveChartMeta: (e, a) => r.ipcRenderer.invoke("fs:saveChartMeta", e, a),
    saveChart: (e, a, i, n) => r.ipcRenderer.invoke("fs:saveChart", e, a, i, n),
    getChartData: (e) => r.ipcRenderer.invoke("fs:getChartData", e),
    getChartProjectData: (e) => r.ipcRenderer.invoke("fs:getChartProjectData", e),
    readChart: (e, a) => r.ipcRenderer.invoke("fs:readChart", e, a),
    readAFileInChart: (e, a) => r.ipcRenderer.invoke("fs:readAFileInChart", e, a),
    saveAFileToChart: (e, a, i) => r.ipcRenderer.invoke("fs:saveAFileToChart", e, a, i),
    loadChartImage: (e, a) => r.ipcRenderer.invoke("fs:loadChartImage", e, a),
    // 谱面回收
    disposeChart: (e) => r.ipcRenderer.invoke("fs:disposeChart", e),
    // 纹理
    getTextures: (e) => r.ipcRenderer.invoke("fs:getTextures", e),
    uploadTexture: (e, a, i) => r.ipcRenderer.invoke("fs:uploadTexture", e, a, i),
    fetchTexture: (e, a) => r.ipcRenderer.invoke("fs:fetchTexture", e, a),
    // 资源包
    queryRespackList: () => r.ipcRenderer.invoke("fs:queryRespackList"),
    getFileInRespack: (e, a) => r.ipcRenderer.invoke("fs:getFileInRespack", e, a),
    uploadRespack: (e, a) => r.ipcRenderer.invoke("fs:uploadRespack", e, a),
    // 下载
    downloadFile: (e, a, i) => r.ipcRenderer.invoke("fs:downloadFile", e, a, i),
    // 谱面创建/导入
    checkChartDirExists: (e) => r.ipcRenderer.invoke("fs:checkChartDirExists", e),
    createChartDir: (e) => r.ipcRenderer.invoke("fs:createChartDir", e),
    saveTextFile: (e, a, i) => r.ipcRenderer.invoke("fs:saveTextFile", e, a, i),
    saveBinaryFile: (e, a, i) => r.ipcRenderer.invoke("fs:saveBinaryFile", e, a, i),
    createNestedDir: (e, a) => r.ipcRenderer.invoke("fs:createNestedDir", e, a),
    importChart: (e) => r.ipcRenderer.invoke("fs:importChart", e),
    saveChartProject: (e) => r.ipcRenderer.invoke("fs:saveChartProject", e)
  },
  // 打开系统路径
  openPath: (e) => r.ipcRenderer.invoke("shell:openPath", e),
  // 增量更新
  updater: {
    check: () => r.ipcRenderer.invoke("updater:check"),
    download: () => r.ipcRenderer.invoke("updater:download"),
    install: () => r.ipcRenderer.invoke("updater:install"),
    status: () => r.ipcRenderer.invoke("updater:status"),
    onChecking: (e) => r.ipcRenderer.on("updater:checking", e),
    onAvailable: (e) => r.ipcRenderer.on("updater:available", (a, i) => e(i)),
    onNotAvailable: (e) => r.ipcRenderer.on("updater:not-available", (a, i) => e(i)),
    onProgress: (e) => r.ipcRenderer.on("updater:progress", (a, i) => e(i)),
    onDownloaded: (e) => r.ipcRenderer.on("updater:downloaded", (a, i) => e(i)),
    onError: (e) => r.ipcRenderer.on("updater:error", (a, i) => e(i)),
    removeAllListeners: () => {
      r.ipcRenderer.removeAllListeners("updater:checking"), r.ipcRenderer.removeAllListeners("updater:available"), r.ipcRenderer.removeAllListeners("updater:not-available"), r.ipcRenderer.removeAllListeners("updater:progress"), r.ipcRenderer.removeAllListeners("updater:downloaded"), r.ipcRenderer.removeAllListeners("updater:error");
    }
  }
});
