import type { ZipResult, FileToCompress } from "./workers/zip.worker";

let worker: Worker;


export async function zip(files: FileToCompress[]): Promise<ZipResult> {
    if (!worker) {
        worker = new Worker(new URL("./workers/zip.worker.ts", import.meta.url), { type: "module" });
    }
    return new Promise((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<ZipResult>) => {
            // 解压后的文件数据在 event.data 中
            resolve(event.data);
        };

        worker.onerror = (error) => {
            reject(error);
        };

        // 通过transferable发送ArrayBuffer
        worker.postMessage(files, files.map((file) => file.data));
    });
}
