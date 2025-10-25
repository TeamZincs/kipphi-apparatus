import type { UnzipResult, UnzippedFile } from "./workers/unzip.worker";
/*
import { invoke } from "@tauri-apps/api/core";



interface RawFile {
    name: string;
    data: number[]; // 我不明白，为什么tauri后端要返回number[]，而不是Uint8Array<ArrayBuffer>
}

export async function unzip(file: Blob) {
    console.log(new Date);
    const result = await invoke("unzip", {zipData: new Uint8Array(await file.arrayBuffer())});
    console.log(new Date);
    return (result as RawFile[]).map((fileData) => {
        return {
            name: fileData.name,
            data: new Uint8Array(fileData.data)
        }
    }) as UnzipedFile[];
}

*/
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

