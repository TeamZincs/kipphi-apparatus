/**
 * 保存与"是否有未保存改动"。
 *
 * 移动端没有保存按钮，靠**自动保存**。节奏和桌面端 `AutoSaveRunner` 对齐：
 * **固定间隔**（60s）检查一次，只有 `chart.modified` 才写盘，写完清标志。
 *
 * 早期实现是"改动后停手 1.5s 就写"：操作间隔一旦超过 1.5s，每个操作都会生成
 * 一个新版本 —— `history.json` 和 `chart.*.json` 会迅速膨胀。**别改回去。**
 */
import { writable } from '@graints/runtime';

import { saveChart as saveChartToDisk } from '@kpa/shared/background/tauri';

import { chart, chartId } from './store';

export const saving = writable(false);
export const lastSavedAt = writable<number | null>(null);
export const saveError = writable<string | null>(null);

/** 和桌面端 `KPASettings.autosaveInterval` 的默认值一致（60 秒） */
const AUTOSAVE_INTERVAL_MS = 60_000;

let timer: ReturnType<typeof setInterval> | null = null;

/**
 * 立刻写一次盘。
 *
 * `chart.modified` 为假（没改过）、正在保存、谱面还没加载好时什么都不做 ——
 * 这也是"固定间隔但不会存出重复版本"的关键。
 */
export async function saveNow(
    summary = `Autosave ${new Date().toLocaleString()}`
): Promise<void> {
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

/**
 * 启动自动保存（幂等）。
 *
 * 先清掉可能残留的上一个页面的定时器 —— 路由切换不会自动回收它，
 * 留着会和新页面各存一份。
 */
export function startAutoSave(): void {
    stopAutoSave();

    timer = setInterval(() => {
        void saveNow();
    }, AUTOSAVE_INTERVAL_MS);
}

export function stopAutoSave(): void {
    if (timer) clearInterval(timer);

    timer = null;
}

export const hasUnsavedChanges = (): boolean => Boolean(chart?.modified);
