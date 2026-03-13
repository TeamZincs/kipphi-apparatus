import { openPath as tauriOpenPath } from "@tauri-apps/plugin-opener"

export function openPath(path: string, openWith?: string) {
    tauriOpenPath(path, openWith);
}