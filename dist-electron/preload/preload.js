var r = require("electron");
r.contextBridge.exposeInMainWorld("electronAPI", {
  // 文件系统操作
  fs: {
    queryMeta: () => r.ipcRenderer.invoke("fs:queryMeta"),
    queryCharts: () => r.ipcRenderer.invoke("fs:queryCharts"),
    queryChartMeta: (e) => r.ipcRenderer.invoke("fs:queryChartMeta", e),
    queryChartHistory: (e) => r.ipcRenderer.invoke("fs:queryChartHistory", e),
    saveChartMeta: (e, i) => r.ipcRenderer.invoke("fs:saveChartMeta", e, i),
    saveChart: (e, i, a, t) => r.ipcRenderer.invoke("fs:saveChart", e, i, a, t),
    getChartData: (e) => r.ipcRenderer.invoke("fs:getChartData", e),
    getChartProjectData: (e) => r.ipcRenderer.invoke("fs:getChartProjectData", e),
    readChart: (e, i) => r.ipcRenderer.invoke("fs:readChart", e, i),
    readAFileInChart: (e, i) => r.ipcRenderer.invoke("fs:readAFileInChart", e, i),
    saveAFileToChart: (e, i, a) => r.ipcRenderer.invoke("fs:saveAFileToChart", e, i, a),
    loadChartImage: (e, i) => r.ipcRenderer.invoke("fs:loadChartImage", e, i),
    // 谱面回收
    disposeChart: (e) => r.ipcRenderer.invoke("fs:disposeChart", e),
    // 纹理
    getTextures: (e) => r.ipcRenderer.invoke("fs:getTextures", e),
    uploadTexture: (e, i, a) => r.ipcRenderer.invoke("fs:uploadTexture", e, i, a),
    fetchTexture: (e, i) => r.ipcRenderer.invoke("fs:fetchTexture", e, i),
    // 资源包
    queryRespackList: () => r.ipcRenderer.invoke("fs:queryRespackList"),
    getFileInRespack: (e, i) => r.ipcRenderer.invoke("fs:getFileInRespack", e, i),
    uploadRespack: (e, i) => r.ipcRenderer.invoke("fs:uploadRespack", e, i),
    // 下载
    downloadFile: (e, i, a) => r.ipcRenderer.invoke("fs:downloadFile", e, i, a),
    // 谱面创建/导入
    checkChartDirExists: (e) => r.ipcRenderer.invoke("fs:checkChartDirExists", e),
    createChartDir: (e) => r.ipcRenderer.invoke("fs:createChartDir", e),
    saveTextFile: (e, i, a) => r.ipcRenderer.invoke("fs:saveTextFile", e, i, a),
    saveBinaryFile: (e, i, a) => r.ipcRenderer.invoke("fs:saveBinaryFile", e, i, a),
    createNestedDir: (e, i) => r.ipcRenderer.invoke("fs:createNestedDir", e, i),
    importChart: (e) => r.ipcRenderer.invoke("fs:importChart", e),
    saveChartProject: (e) => r.ipcRenderer.invoke("fs:saveChartProject", e)
  },
  // 打开系统路径
  openPath: (e) => r.ipcRenderer.invoke("shell:openPath", e)
});
