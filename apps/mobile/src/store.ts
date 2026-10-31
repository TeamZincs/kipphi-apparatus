import { writable } from '@graints/runtime';

import { Chart, JudgeLine, Op } from 'kipphi';

import { getChartProject } from './background';
import { isTauri } from './tauri';

/** 底部标签栏的三页 */
export type MobileTab = 'lines' | 'notes' | 'events';

export const activeTab = writable<MobileTab>('lines');

/**
 * 当前谱面。
 *
 * 首页点进来之后由 `loadChart()` 赋值；没加载完之前是 `null`，
 * 编辑器区域靠 `ready` 挡住，避免各个画布编辑器拿到空对象。
 */
export let chart: Chart | null = null;
export let operationList: Op.OperationList | null = null;

/** 播放资源（demo 谱面没有） */
export let musicUrl: string | null = null;
export let illustration: ImageBitmap | null = null;

/** 当前谱面的 id（贴图/视频/着色器要从这个目录里读） */
export let chartId: string | null = null;

export const ready = writable(false);
export const loadError = writable<string | null>(null);

/** 当前选中的判定线（三个编辑器共用） */
export const selectedLineId = writable<number | null>(null);

export const lineOf = (id: number | null): JudgeLine | null =>
    chart && id !== null ? chart.judgeLines.find((line) => line.id === id) ?? null : null;

/** 播放器状态（实例在 boot.ts 里挂上来） */
export const playerReady = writable(false);
export const playerError = writable<string | null>(null);
export const isPlaying = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);

/** 没接真实谱面时用的示例谱：3 条判定线，够点一圈 UI */
function buildDemoChart(): Chart {
    const demo = new Chart();

    operationList = new Op.OperationList(demo);

    for (let index = 0; index < 3; index += 1) {
        const line = new JudgeLine(demo);

        operationList.do(new Op.JudgeLineCreateOperation(demo, line));
    }

    return demo;
}

export async function loadChart(id: string | null): Promise<void> {
    ready.set(false);
    loadError.set(null);
    playerReady.set(false);
    playerError.set(null);
    isPlaying.set(false);
    currentTime.set(0);

    try {
        if (isTauri() && id) {
            const project = await getChartProject(id);

            chartId = id;
            chart = project.chart;
            illustration = project.illustration;
            musicUrl = project.music ? URL.createObjectURL(project.music) : null;
            operationList = new Op.OperationList(chart);
        } else {
            // 浏览器里（或没带 id）：用示例谱面，方便在电脑上看 UI
            chartId = null;
            chart = buildDemoChart();
            illustration = null;
            musicUrl = null;
        }

        const first = chart.judgeLines[0];

        selectedLineId.set(first ? first.id : null);
        duration.set(chart.duration ?? 0);
        ready.set(true);
    } catch (error) {
        loadError.set(error instanceof Error ? error.message : String(error));
    }
}
