/**
 * 只放**跨模块**的东西：当前谱面、操作列表、选中的判定线。
 *
 * 播放器相关的时间 / 播放状态 / 控制条可见性都是页面私有的，
 * 留在 `routes/charts/[id]/+page.grain` 里（跟桌面端一样），不要塞这里。
 */
import { writable } from '@graints/runtime';

import { Chart, JudgeLine, Op } from 'kipphi';

import { getChartProject } from './background';
import { isTauri } from './tauri';

/** 当前谱面 */
export let chart: Chart | null = null;
export let operationList: Op.OperationList | null = null;

/** 播放资源（示例谱面没有） */
export let musicUrl: string | null = null;
export let illustration: ImageBitmap | null = null;

/** 当前谱面 id（贴图 / 视频 / 着色器要从这个目录读） */
export let chartId: string | null = null;

/** 当前选中的判定线（编辑器与判定线列表共用） */
export const selectedLineId = writable<number | null>(null);

/**
 * 谱面加载完成的信号（每次 `loadChart` 成功就 +1）。
 *
 * `chart` 是模块级 `let`，赋值本身不会通知任何人；`JudgeLineList` 的 `$node`
 * 在挂载时就把 `chart.judgeLines` 读进缓存了，所以需要一个可订阅的信号让它重算。
 */
export const chartLoaded = writable(0);

/**
 * 播放中的"刷新一下"信号（页面按 ~10Hz 递增）。
 *
 * 判定线的 x / y / θ / α / 速度都是随时间插值的，播放时要在列表里跟着变，
 * 但每帧都重算整个列表太贵，所以节流成一个可订阅的 tick。
 */
export const playbackTick = writable(0);

export const lineOf = (id: number | null): JudgeLine | null =>
    chart && id !== null ? chart.judgeLines.find((line) => line.id === id) ?? null : null;

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

/**
 * 加载谱面。失败**抛错**，由页面决定怎么显示。
 *
 * 成功时这里会写好 `chart` / `operationList` / `musicUrl` / `illustration`，
 * 页面直接读这些 live binding 就行。
 */
export async function loadChart(id: string | null): Promise<void> {
    if (isTauri() && id) {
        const project = await getChartProject(id);

        chartId = id;
        chart = project.chart;
        // `getChartProject` 默认给 Blob，播放器要 ImageBitmap
        illustration = project.illustration ? await createImageBitmap(project.illustration) : null;
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

    // 通知订阅者（判定线列表）谱面已经就位
    chartLoaded.set(chartLoaded.get() + 1);
}
