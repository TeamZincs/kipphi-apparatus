/**
 * 只放**跨模块**的东西：当前谱面、操作列表、选中的判定线、播放器实例。
 *
 * 播放器实例本身在这里（桌面端 `store.ts` 也是这么放的），但它的时间 /
 * 播放状态 / 控制条可见性仍是页面私有的，不要塞进来。
 */
import { writable } from '@graints/runtime';

import { Chart, JudgeLine, KPAError, Op } from 'kipphi';
import type { Player } from 'kipphi-player';

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

/**
 * 播放器实例。
 *
 * 面板要直接改 `player.textureMapping`（换贴图要立刻生效），所以放在这里
 * 而不是只留在页面里 —— 桌面端 `store.ts` 也是同样的做法。
 */
export let player: Player | null = null;

/** 页面创建 / 销毁播放器时写入 */
export function setPlayer(instance: Player | null): void {
    player = instance;
}

/** 当前选中的判定线（编辑器与判定线列表共用） */
export const selectedLineId = writable<number | null>(null);

/**
 * 左滑露出操作按钮的那一行（同一时刻只允许一行展开）。
 *
 * 递归组件之间没法靠 props 传递"谁开着"，放在这里最简单。
 */
export const openLineId = writable<number | null>(null);

/**
 * 正在编辑属性的判定线（左滑的「设定」按钮写它）。
 *
 * 和 `openLineId` 分开：那个是"哪一行露出了操作按钮"，这个是"打开了哪个
 * 属性面板"。写完立刻被页面消费掉（置回 null），避免重复触发。
 */
export const editingLineId = writable<number | null>(null);

/**
 * 谱面加载完成的信号（每次 `loadChart` 成功就 +1）。
 *
 * `chart` 是模块级 `let`，赋值本身不会通知任何人；`JudgeLineList` 的 `$node`
 * 在挂载时就把 `chart.judgeLines` 读进缓存了，所以需要一个可订阅的信号让它重算。
 */
export const chartLoaded = writable(0);

export const lineOf = (id: number | null): JudgeLine | null =>
    chart && id !== null ? chart.judgeLines.find((line) => line.id === id) ?? null : null;

/**
 * 刷新 / 回流是**两件事**（跟桌面端 `store.ts`、Svelte 原版一致）：
 *
 *   · refresh —— 只重算每行的 x / y / θ / α / 速度这些随时间变的数值，播放时调；
 *   · reflow  —— 增删判定线、改父子关系之后重建列表结构，只在 `needsreflow` 时调。
 *
 * grain 的组件实例没有对外方法，父级没法像 Svelte 那样 `bind:this` 之后调
 * `child.update()`，所以改成子级自己登记、store 统一广播。
 */
const refreshHandlers = new Set<() => void>();

export function registerRefresh(handler: () => void): () => void {
    refreshHandlers.add(handler);

    return () => {
        refreshHandlers.delete(handler);
    };
}

let refreshing = false;

export function refreshAll(): void {
    if (refreshing) return;

    refreshing = true;

    try {
        for (const handler of refreshHandlers) handler();
    } finally {
        refreshing = false;
    }
}

const reflowHandlers = new Set<() => void>();

export function registerReflow(handler: () => void): () => void {
    reflowHandlers.add(handler);

    return () => {
        reflowHandlers.delete(handler);
    };
}

/** 正在广播中（防重入，见下） */
let reflowing = false;

/**
 * 广播一次全量回流。
 *
 * 防重入：每个登记方在刷新时都可能间接再触发一次 `reflowAll`（比如刷新里又
 * 派发了事件），不拦的话会叠成"刷新 → 广播 → 刷新"的环，把 grain 的循环保护打满。
 */
export function reflowAll(): void {
    if (reflowing) return;

    reflowing = true;

    try {
        for (const handler of reflowHandlers) handler();
    } finally {
        reflowing = false;
    }
}

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
    /*
     * 上一张谱面留下的解析警告不能带到这一张 —— `buffer` 是静态的，
     * 不在这里清就会越积越多，错误页也会显示别的谱面的问题。
     */
    KPAError.flush();

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

    // 操作列表发来的 `needsreflow` 统一转成一次全量回流。
    // 必须挂在这里（operationList 刚建好），不能在组件里 `operationList?.addEventListener`：
    // 组件挂载时 operationList 还是 null，那一句会被直接跳过、再也不补。
    if (operationList) {
        operationList.addEventListener("needsreflow", () => reflowAll());
    }

    // 通知订阅者（判定线列表）谱面已经就位
    chartLoaded.set(chartLoaded.get() + 1);
}
