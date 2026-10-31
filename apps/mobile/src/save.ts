/**
 * 保存与"是否有未保存改动"。
 *
 * 移动端没有保存按钮，靠**自动保存**：改动停手 1.5s 就写盘，写盘后把
 * `chart.modified` 清掉。离开页面的确认（返回 / beforeunload）就是看这个标志。
 */
import { writable } from '@graints/runtime';

import { saveChart as saveChartToDisk } from '@kpa/shared/background/tauri';

import { chart, chartId } from './store';

export const saving = writable(false);
export const lastSavedAt = writable<number | null>(null);
export const saveError = writable<string | null>(null);

const DEBOUNCE_MS = 1500;

let timer: ReturnType<typeof setTimeout> | null = null;

export async function saveNow(summary = '移动端自动保存'): Promise<void> {
    if (!chart || !chartId || !chart.modified || saving.get()) return;

    saving.set(true);

    try {
        await saveChartToDisk(chartId, chart, summary);

        chart.modified = false;
        lastSavedAt.set(Date.now());
        saveError.set(null);
    } catch (error) {
        saveError.set(error instanceof Error ? error.message : String(error));
    } finally {
        saving.set(false);
    }
}

/** 改动后调一次：停手一会儿再写盘 */
export function scheduleSave(): void {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
        timer = null;
        void saveNow();
    }, DEBOUNCE_MS);
}

export const hasUnsavedChanges = (): boolean => Boolean(chart?.modified);
