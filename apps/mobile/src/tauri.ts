/**
 * Tauri 相关的一层薄封装。
 *
 * 移动端正经要跑在 Tauri 里（读谱面、读 respack、将来调平台能力都得靠它），
 * 但**也要能在电脑浏览器里直接打开调试** —— 所以每条都留了浏览器下的退路，
 * 失败就退回 fetch，而不是直接报错。
 */

/** 是不是跑在 Tauri 的 webview 里 */
export const isTauri = (): boolean =>
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/** 应用数据目录（谱面、用户 respack 放这儿）；浏览器下返回 null */
export async function appDataDir(): Promise<string | null> {
    if (!isTauri()) return null;

    try {
        const { appDataDir: dir } = await import('@tauri-apps/api/path');

        return await dir();
    } catch {
        return null;
    }
}

/**
 * 读打包进 resource 目录的默认 respack。
 *
 * 优先走 Tauri 的 fs（`resourceDir()/default/<filename>`），
 * 读不到（比如在浏览器里、或者 resource 里没有）就退回 `fetch('/default/...')`。
 */
export async function readDefaultRespackFile(filename: string): Promise<Blob | null> {
    if (isTauri()) {
        try {
            const [{ readFile }, { resourceDir, join }] = await Promise.all([
                import('@tauri-apps/plugin-fs'),
                import('@tauri-apps/api/path')
            ]);

            const base = await resourceDir();
            const path = await join(base, 'default', filename);
            const data = await readFile(path);

            return new Blob([data]);
        } catch {
            // 掉到下面的 fetch
        }
    }

    try {
        const response = await fetch(`/default/${filename}`);

        return response.ok ? response.blob() : null;
    } catch {
        return null;
    }
}
