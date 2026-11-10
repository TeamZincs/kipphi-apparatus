/**
 * 放大镜：按住元素时放大主视图，并在侧边画一个更高倍率的局部视图。
 *
 * 两个编辑器共用这一份状态机（档位、0.4s 动画、局部视图框），
 * 具体"怎么画"由调用方通过 `paint` 回调提供。
 *
 * 行为约定（TODO #8 里确认过的）：
 *   · 松手回 1x；
 *   · 倍率不设上限，排形按钮能做多少做多少；
 *   · 局部视图始终比主视图**高一档**；
 *   · 档位切换有 0.4s 动画。
 */

/** 档位：1x 表示"没放大"，之后每档翻倍 */
export const ZOOM_LEVELS = [1, 2, 4, 8, 16, 32, 64, 128] as const;

/** 档位切换动画时长（毫秒） */
export const ZOOM_ANIMATION_MS = 400;

/** 缓出：起步快、收尾稳，符合"放大"的手感 */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

export interface MagnifierAnchor {
    /** 世界坐标（画布内容坐标），局部视图以它为中心 */
    x: number;
    y: number;
}

/**
 * 局部视图的位置：默认**左下角**，手指正好压在左下就换到右下角。
 *
 * 放右上会被工具栏挡住（按钮在那儿），放顶部又容易被手掌盖住 —— 手指按住
 * 元素时，空着的通常是它对面的那个角。
 */
export function insetRect(
    width: number,
    height: number,
    padding: number,
    pointer?: { x: number; y: number } | null
): [number, number, number, number] {
    const size = Math.min(Math.min(width * 0.3, 160), height * 0.4);
    const top = height - size - padding;
    const left = padding;
    const right = width - size - padding;

    // 手指在左下象限 → 挪到右下，别挡住
    const covered =
        !!pointer && pointer.x < width / 2 && pointer.y > height / 2;

    return [covered ? right : left, top, size, size];
}

/**
 * 按**可见范围**挑一个好看的网格步长（1 / 2 / 5 × 10ⁿ）。
 *
 * 局部视图不能直接套主视图的绝对步长：`moveX` 的 `valueGridSpan` 是 1，
 * 而值域有 1350 —— 160px 的小窗格里塞一千多条线就是一片实心。
 *
 * @param visibleSpan 窗口里能装下的世界长度
 * @param target      期望画几条线（4~6 比较舒服）
 */
export function pickGridStep(visibleSpan: number, target = 5): number {
    if (!(visibleSpan > 0) || !(target > 0)) return 1;

    const rough = visibleSpan / target;
    const power = 10 ** Math.floor(Math.log10(rough));
    const candidates = [power, power * 2, power * 5, power * 10];

    let best = candidates[0]!;

    for (const candidate of candidates) {
        if (Math.abs(candidate - rough) < Math.abs(best - rough)) {
            best = candidate;
        }
    }

    return best;
}

/**
 * 网格线标签：整数步长不带小数，小数步长按**步长自己的位数**补零。
 *
 * 不能用 `-log10(step)` 估位数：`0.25` 会算成 1 位，写出 "0.3"。
 */
export function formatGridValue(value: number, step: number): string {
    if (Number.isInteger(step)) return String(Math.round(value));

    let digits = 0;
    let scaled = step;

    while (!Number.isInteger(scaled) && digits < 6) {
        scaled *= 10;
        digits += 1;
    }

    return value.toFixed(digits);
}

export class Magnifier {
    /** 当前档位下标（`ZOOM_LEVELS` 的下标） */
    private index = 0;

    /** 动画中的插值倍率 */
    private value = 1;
    private from = 1;
    private to = 1;
    private startedAt = 0;
    private animating = false;

    /** 局部视图的中心（世界坐标）；为 `null` 时不画局部视图 */
    anchor: MagnifierAnchor | null = null;

    /**
     * 按住的那一下在画布上的位置（屏幕坐标）。
     *
     * 用来决定局部视图放左下还是右下 —— 别被手指挡住。
     */
    pointer: { x: number; y: number } | null = null;

    /** 当前生效的倍率（动画中是插值） */
    get zoom(): number {
        return this.value;
    }

    /** 局部视图的倍率：始终比主视图高一档 */
    get localZoom(): number {
        return this.value * 2;
    }

    /** 目标档位倍率（动画结束后会到这儿） */
    get level(): number {
        return ZOOM_LEVELS[this.index];
    }

    /** 当前档位下标（0 = 没放大） */
    get levelIndex(): number {
        return this.index;
    }

    /**
     * 是否画局部视图。
     *
     * 只要按住元素就显示（此时局部是主视图的 2x，主视图本身不动）——
     * 档位是"让主视图也放大"的另一回事。
     */
    get active(): boolean {
        return this.anchor !== null;
    }

    /** 主视图是否真的在放大（决定要不要改矩阵 / 居中） */
    get zooming(): boolean {
        return this.anchor !== null && this.value > 1;
    }

    /** 是否还在播动画（调用方据此继续请求重绘） */
    get animatingNow(): boolean {
        return this.animating;
    }

    /** 按住元素时定住局部视图中心 */
    focus(anchor: MagnifierAnchor, pointer?: { x: number; y: number }): void {
        const changed =
            !this.anchor ||
            this.anchor.x !== anchor.x ||
            this.anchor.y !== anchor.y;

        this.anchor = anchor;
        this.pointer = pointer ?? null;

        // 换了元素就从头开始（档位也回 1x）
        if (changed) this.setIndex(0, true);
    }

    /**
     * 拖动中更新局部视图的中心。
     *
     * 和 `focus()` 的区别是**不动档位、不播动画**：按住元素拖动时每帧调用，
     * 小窗口才会跟着节点走。用 `focus()` 的话，锚点一变就被当成"换了元素"，
     * 档位直接被打回 1x。
     */
    track(anchor: MagnifierAnchor, pointer?: { x: number; y: number }): void {
        if (!this.anchor) return;

        this.anchor = anchor;

        if (pointer) this.pointer = pointer;
    }

    /** 松手：回到 1x，并收起局部视图 */
    reset(): void {
        this.anchor = null;
        this.pointer = null;
        this.setIndex(0, true);
    }

    /** 升 / 降一档 */
    step(delta: number): void {
        this.setIndex(this.index + delta);
    }

    /** 直接跳到某一档（`immediate` 跳过动画） */
    setIndex(index: number, immediate = false): void {
        const next = Math.min(Math.max(index, 0), ZOOM_LEVELS.length - 1);

        if (next === this.index && !immediate) return;

        this.index = next;

        const target = ZOOM_LEVELS[next];

        if (immediate) {
            this.value = this.from = this.to = target;
            this.animating = false;

            return;
        }

        this.from = this.value;
        this.to = target;
        this.startedAt = performance.now();
        this.animating = true;
    }

    /**
     * 推进动画。
     *
     * @param now 当前时间（默认取 `performance.now()`，测试可以传固定值）
     * @returns 倍率是否发生了变化（调用方据此决定要不要重绘）
     */
    tick(now = performance.now()): boolean {
        if (!this.animating) return false;

        const progress = Math.min(
            1,
            (now - this.startedAt) / ZOOM_ANIMATION_MS
        );
        const next = this.from + (this.to - this.from) * easeOutCubic(progress);

        const changed = next !== this.value;

        this.value = next;

        if (progress >= 1) {
            this.value = this.to;
            this.animating = false;
        }

        return changed;
    }

    /**
     * 画局部视图。
     *
     * 调用方提供 `paint`：它按 `scale` 倍的矩阵、以 `anchor` 为中心重画内容，
     * 坐标系原点就是**局部视图框的中心**。框本身、裁剪和边框由这里统一处理。
     */
    drawInset(
        context: CanvasRenderingContext2D,
        rect: [number, number, number, number],
        paint: (
            context: CanvasRenderingContext2D,
            scale: number,
            anchor: MagnifierAnchor
        ) => void
    ): boolean {
        if (!this.active || !this.anchor) return false;

        const [left, top, size, height] = rect;

        context.save();

        context.beginPath();
        context.rect(left, top, size, height);
        context.clip();

        // 背景：局部视图下面垫一层深色，避免和主画布糊在一起
        context.fillStyle = "rgba(12, 16, 22, 0.92)";
        context.fillRect(left, top, size, height);

        context.translate(left + size / 2, top + height / 2);
        paint(context, this.localZoom, this.anchor);

        context.restore();

        // 边框最后画，不受 clip 影响
        context.save();
        context.lineWidth = 2;
        context.strokeStyle = "rgba(255, 255, 255, 0.35)";
        context.strokeRect(left, top, size, height);
        context.restore();

        return true;
    }
}
