import { beforeAll, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";

/**
 * 贝塞尔编辑器的控制点绘制。
 *
 * 之前用的是 `Images.START_NODE` / `END_NODE` 两张按钮贴图，换成圆球 +
 * 到锚点的连线（控制点 1 蓝、控制点 2 红）。这里锁住形状和配色，
 * 免得以后又被改回贴图。
 *
 * 注意：`./bezierEditor` 会间接 import `kpp/polyfill`，那个模块在**顶层**
 * 就读 `window`，所以必须先铺好 DOM 再动态 import。
 */

type Call = [string, ...unknown[]];

function recordingContext(): { ctx: Record<string, unknown>; calls: Call[] } {
    const calls: Call[] = [];

    const ctx: Record<string, unknown> = {
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 0,
        font: "",
        textBaseline: "",
        beginPath: () => calls.push(["beginPath"]),
        moveTo: (...args: unknown[]) => calls.push(["moveTo", ...args]),
        lineTo: (...args: unknown[]) => calls.push(["lineTo", ...args]),
        arc: (...args: unknown[]) => calls.push(["arc", ...args]),
        bezierCurveTo: (...args: unknown[]) =>
            calls.push(["bezierCurveTo", ...args]),
        fill: () => calls.push(["fill"]),
        stroke: () => calls.push(["stroke"]),
        fillRect: (...args: unknown[]) => calls.push(["fillRect", ...args]),
        fillText: (...args: unknown[]) => calls.push(["fillText", ...args]),
        drawImage: (...args: unknown[]) => calls.push(["drawImage", ...args]),
        clearRect: () => {},
        save: () => {},
        restore: () => {}
    };

    // 记录 fillStyle / strokeStyle 的赋值：颜色是"圆球还是按钮"的关键
    for (const key of ["fillStyle", "strokeStyle"]) {
        let value: unknown = "";

        Object.defineProperty(ctx, key, {
            get: () => value,
            set: (next: unknown) => {
                value = next;
                calls.push([key, next]);
            }
        });
    }

    return { ctx, calls };
}

let BezierEditor: typeof import("./bezierEditor").BezierEditor;

beforeAll(async () => {
    const window = new Window();

    (globalThis as unknown as Record<string, unknown>).window = window;
    (globalThis as unknown as Record<string, unknown>).document =
        window.document;
    (globalThis as unknown as Record<string, unknown>).HTMLCanvasElement =
        window.HTMLCanvasElement;

    // 构造函数里会 new ResizeObserver（跟踪容器宽度做坐标换算），测试用不到
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
        observe() {}
        disconnect() {}
    };

    ({ BezierEditor } = await import("./bezierEditor"));
});

describe("BezierEditor 控制点", () => {
    it("画成两个圆球 + 连线，蓝色是控制点 1、红色是控制点 2", () => {
        const { ctx, calls } = recordingContext();
        const proto = (
            globalThis as unknown as {
                HTMLCanvasElement: typeof HTMLCanvasElement;
            }
        ).HTMLCanvasElement.prototype;

        const original = proto.getContext;

        // 测试环境不需要真的 2D 上下文，只关心调用了什么
        proto.getContext = (() => ctx) as unknown as typeof proto.getContext;

        try {
            const editor = new BezierEditor();

            // `setValue` 自己会 update 一次，清空记录后单独跑一次绘制
            editor.setValue(0.25, 0.1, 0.25, 1);
            calls.length = 0;
            editor.update();

            const arcs = calls.filter((call) => call[0] === "arc");

            // 两个控制点各一个圆
            expect(arcs.length).toBe(2);

            // 半径一致（都是 BEZIER_POINT_SIZE/2 - 3 = 12）
            expect(arcs[0][3]).toBe(arcs[1][3]);

            // 到两个锚点各一条连线：(0,0) 在像素 (0, 300)，(1,1) 在 (300, 0)
            const moveTos = calls.filter((call) => call[0] === "moveTo");

            expect(
                moveTos.some((call) => call[1] === 0 && call[2] === 300)
            ).toBe(true);
            expect(
                moveTos.some((call) => call[1] === 300 && call[2] === 0)
            ).toBe(true);

            const fills = calls
                .filter((call) => call[0] === "fillStyle")
                .map((call) => call[1]);

            expect(fills).toContain("#4c8dff");
            expect(fills).toContain("#f2545b");

            // 不再用贴图按钮
            expect(calls.some((call) => call[0] === "drawImage")).toBe(false);
        } finally {
            proto.getContext = original;
        }
    });
});
