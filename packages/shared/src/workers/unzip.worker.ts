// unzip.worker.ts
import JSZip from 'jszip';

interface UnzippedFile {
  name: string;
  buffer: ArrayBuffer;
}

interface UnzipResult {
  files: UnzippedFile[];
  success: boolean;
}

const workerSelf = self as unknown as DedicatedWorkerGlobalScope

workerSelf.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  try {
    // 接收通过transferable传递的ArrayBuffer
    const arrayBuffer = event.data;
    
    // 加载ZIP文件
    const zip = new JSZip();
    const contents = await zip.loadAsync(arrayBuffer);
    
    const files: UnzippedFile[] = [];
    const transferables: Transferable[] = [];
    
    // 遍历所有文件
    for (const [filename, zipObject] of Object.entries(contents.files)) {
      // 跳过目录
      if (!zipObject.dir) {
        // 使用零拷贝方式获取ArrayBuffer
        const buffer = await zipObject.async('arraybuffer');
        files.push({
          name: filename,
          buffer
        });
        // 收集需要转移的ArrayBuffer
        transferables.push(buffer);
      }
    }
    
    const result: UnzipResult = {
      files,
      success: true
    };
    
    // 将解压后的文件通过transferable发送回去
    workerSelf.postMessage(result, transferables);
  } catch (error) {
    const errorResult: UnzipResult = {
      files: [],
      success: false
    };
    workerSelf.postMessage(errorResult);
  }
};

export type { UnzippedFile, UnzipResult };