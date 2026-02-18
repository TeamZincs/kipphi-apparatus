import type { UnzipResult, UnzippedFile } from "./workers/unzip.worker";

let worker: Worker;
interface UnzipedFile {
    name: string;
    data: ArrayBuffer;
}


export async function unzip(blob: Blob): Promise<UnzipResult> {
    const arrayBuffer = await blob.arrayBuffer();
    if (!worker) {
        worker = new Worker(new URL("./workers/unzip.worker.ts", import.meta.url), { type: "module" });
    }
    return new Promise((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<UnzipResult>) => {
            // 解压后的文件数据在 event.data 中
            resolve(event.data);
        };

        worker.onerror = (error) => {
            reject(error);
        };

        // 通过transferable发送ArrayBuffer
        worker.postMessage(arrayBuffer, [arrayBuffer]);
    });
}

