import JSZip from "jszip";

interface FileToCompress {
  name: string;
  data: ArrayBuffer;
}

interface ZipResult {
  buffer: ArrayBuffer | null;
  success: boolean;
}

const workerSelf = self as unknown as DedicatedWorkerGlobalScope;

workerSelf.onmessage = async (event: MessageEvent<FileToCompress[]>) => {
  try {
    const files = event.data;
    
    // 创建 ZIP 文件
    const zip = new JSZip();
    
    // 添加所有文件到 ZIP
    for (const file of files) {
      zip.file(file.name, file.data);
    }
    
    // 生成 ZIP blob
    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    
    const result: ZipResult = {
      buffer: buffer,
      success: true
    };
    
    workerSelf.postMessage(result, {
        transfer: [buffer]
    });
  } catch (error) {
    const errorResult: ZipResult = {
      buffer: null,
      success: false
    };
    workerSelf.postMessage(errorResult);
  }
};

export type { FileToCompress, ZipResult };