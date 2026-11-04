import {
    Easing,
    NormalEasing,
    SegmentedEasing,
    TemplateEasing,
} from "kipphi";
import { identity, Matrix33 } from "kipphi-player";

import type { LTWH } from "./notesEditor";
import { SelectionManager } from "./selectionManager";
import { getCanvasCoordFromEvent, on } from "./util";

/**
 * 缓动曲线画布（从桌面端 `EasingTypeTabs.grain` 里抽出来的）。
 *
 * 三件事：
 *   1. 画曲线（普通 / 模板 / 分段都画）；
 *   2. 分段缓动可以**拖左右边界**，拖完 `change` 事件里给出新的 `Easing`；
 *   3. 拖动过程中把"被裁掉的那一段"标红，所见即所得。
 *
 * 放进共享包之后两端共用：桌面用它编普通缓动，移动端用它产生 `SegmentedEasing`。
 */
export class EasingCanvas extends EventTarget {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    rect: LTWH;
    padding: number;
    selectionManager: SelectionManager<"left" | "right"> =
        new SelectionManager();
    elementMatrix!: Matrix33;
    elementMatrixInverted!: Matrix33;
    holding: "left" | "right" | null = null;
    nodeSize: number = 32;

    constructor(canvas: HTMLCanvasElement, rect: LTWH) {
        super();
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d")!;
        this.context.font = "30px phigros";
        this.context.textBaseline = "top";
        this.rect = rect;
        this.padding = 10;

        const resize = () => {
            const r = this.canvas.getBoundingClientRect();

            if (!r.width || !r.height || !canvas.width || !canvas.height) return;

            this.elementMatrix = identity.scale(
                r.width / canvas.width,
                r.height / canvas.height
            );
            this.elementMatrixInverted = this.elementMatrix.invert();
        };

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(resize);

            observer.observe(canvas);
        }

        resize();

        on(["mousedown", "touchstart"], this.canvas, (e) => {
            if (!this.elementMatrixInverted) return;

            const offset = getCanvasCoordFromEvent(
                e,
                this.canvas,
                this.elementMatrixInverted,
                identity
            );
            const selection = this.selectionManager.click(offset);

            if (selection && !this.holding) {
                this.holding = selection.target;
            }

            this.draw(this.lastEasing);
        });
        on(["mousemove", "touchmove"], this.canvas, (e) => {
            if (!this.holding || !this.elementMatrixInverted) return;

            const offset = getCanvasCoordFromEvent(
                e,
                this.canvas,
                this.elementMatrixInverted,
                identity
            );
            let arg =
                (offset.x - this.padding) / (this.rect[2] - this.padding * 2);

            arg = Math.min(Math.max(arg, 0), 1);

            if (this.holding === "left") {
                this.redrawWithNewBounds(arg, null);
            } else {
                this.redrawWithNewBounds(null, arg);
            }
        });
        on(["mouseup", "touchend", "mouseleave"], this.canvas, () => {
            if (!this.holding) return;

            this.holding = null;
            this.dispatchEvent(
                new CustomEvent("change", { detail: this.lastEasing })
            );
        });
    }

    lastEasing!: TemplateEasing | NormalEasing | SegmentedEasing | Easing;

    draw(easing: Easing) {
        this.selectionManager.refresh();
        this.lastEasing = easing;

        const width = this.rect[2];
        const pad = this.padding;
        const w = this.rect[2] - this.padding * 2;
        const h = this.rect[3];
        const isSegmented = easing instanceof SegmentedEasing;
        const easingLeft = isSegmented ? easing.left : 0;
        const easingRight = isSegmented ? easing.right : 1;
        const context = this.context;
        const inner = isSegmented ? easing.easing : easing;

        context.clearRect(0, 0, width, h);
        context.fillStyle = "#222";
        context.fillRect(0, 0, width, h);
        context.fillStyle = "#fff3";
        context.fillText(easingLeft.toFixed(6), 10, 10);
        context.fillText(easingRight.toFixed(6), 10, 50);
        context.fillText(this.holding + "", 200, 50);
        context.fillStyle = "#2f93";

        context.fillRect(pad, h * 0.5, w, h / 3);

        const bgPath = new Path2D();
        const path1 = new Path2D();
        const path2 = new Path2D();
        const path3 = new Path2D();

        const forbidden =
            this.holding === "left"
                ? inner.getValue(easingRight)
                : inner.getValue(easingLeft);
        let lastPoint: number | null = null;

        if (!this.holding) {
            // 没在拖的时候不需要标红
        }

        path1.moveTo(pad, h * 0.5);

        let i = 0;
        let value: number | undefined;
        let y = h * 0.5;

        for (; i < w * easingLeft; i += 2) {
            value = inner.getValue(i / w);
            y = (h / 3) * (1 - value) + h / 6;
            path1.lineTo(i + pad, y);
        }

        path2.moveTo(i + pad, y);

        const leftTop = [i + pad, y] as const;

        for (; i < w * easingRight; i += 2) {
            value = inner.getValue(i / w);
            y = (h / 3) * (1 - value) + h / 6;
            path2.lineTo(i + pad, y);
        }

        path3.moveTo(i + pad, y);

        const rightBottom =
            easingRight === 1
                ? ([w + pad, h / 6] as const)
                : ([i + pad, y] as const);

        for (; i <= w; i += 2) {
            value = inner.getValue(i / w);
            y = (h / 3) * (1 - value) + h / 6;
            path3.lineTo(i + pad, y);
        }

        if (this.holding) {
            context.fillStyle = "#f006";
            context.fill(bgPath);
        }

        context.lineWidth = 3;
        context.strokeStyle = "#fff";
        context.stroke(path1);
        context.strokeStyle = "#df6";
        context.stroke(path2);
        context.strokeStyle = "#fff";
        context.stroke(path3);

        if (isSegmented) {
            context.fillStyle = "#df63";
            context.fillRect(
                leftTop[0],
                leftTop[1],
                rightBottom[0] - leftTop[0],
                rightBottom[1] - leftTop[1]
            );
            context.strokeStyle = "#2f7a";
            context.beginPath();
            context.moveTo(pad, (h * 5) / 6);

            for (let j = 0; j <= w; j += 2) {
                const v = easing.getValue(j / w);

                context.lineTo(j + pad, (h / 3) * (1 - v) + h / 2);
            }

            context.stroke();
        }

        const ns = this.nodeSize;
        const half = ns / 2;

        context.fillStyle = "#5cfc";
        context.fillRect(pad + easingLeft * w - 2, 0, 4, h / 2);
        context.fillRect(pad + easingLeft * w - half, h / 2, ns, ns);
        this.selectionManager.add({
            target: "left",
            left: pad + easingLeft * w - half,
            top: h / 2 - half,
            width: ns,
            height: ns,
            priority: 1,
        });

        context.fillStyle = "#f20c";
        context.fillRect(pad + easingRight * w - 2, 0, 4, h / 2);
        context.fillRect(pad + easingRight * w - half, h / 2, ns, ns);
        this.selectionManager.add({
            target: "right",
            left: pad + easingRight * w - half,
            top: h / 2 - half,
            width: ns,
            height: ns,
            priority: easingRight < 0.5 ? 2 : 1,
        });
    }

    redrawWithNewBounds(left: number | null, right: number | null) {
        try {
            const next = EasingCanvas.getNewEasing(this.lastEasing, left, right);

            this.draw(next);
        } catch {
            // 左右交叉了：这一帧不画，等用户拖回去
        }
    }

    /** 用新的左右边界包一层 `SegmentedEasing`（0..1 时退回原缓动） */
    static getNewEasing(
        easing: Easing,
        left: number | null,
        right: number | null
    ): Easing {
        const isSegmented = easing instanceof SegmentedEasing;
        const inner = isSegmented ? easing.easing : easing;
        const easingLeft = isSegmented ? easing.left : 0;
        const easingRight = isSegmented ? easing.right : 1;

        const l = left ?? easingLeft;
        const r = right ?? easingRight;

        if (r < l) throw new Error("invalid bounds");

        return l === 0 && r === 1
            ? inner
            : new SegmentedEasing(inner, l, r);
    }
}
