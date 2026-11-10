import { beforeAll, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";

/**
 * 「背靠背同值绑定」的配对判定。
 *
 * 链是 `start₁ → end₁ → start₂ → end₂ …`：
 *   · 一段内部的 `startₖ → endₖ` 隔着整段时间，是"面对面"，不绑；
 *   · **交界处**的 `endₖ` 和 `startₖ₊₁` 同一时刻贴身站着，值相同才绑。
 *
 * `./eventCurveEditor` 会间接 import `kpp/polyfill`，那个模块在**顶层**就读
 * `window`，所以要先铺好 DOM 再动态 import。
 */

type AnyNode = { value: number; next: unknown; previous: unknown };

let EventStartNode: any;
let EventEndNode: any;
let sameValuePartner: (node: AnyNode) => AnyNode | null;
let chooseGridStep: (
    baseSpan: number,
    zoom: number,
    rangeLength: number
) => number;
let pickValueGridSpan: (
    values: number[],
    baseSpan: number,
    rangeLength: number
) => number;
let roundValue: (value: number) => number;

beforeAll(async () => {
    const window = new Window();

    (globalThis as unknown as Record<string, unknown>).window = window;
    (globalThis as unknown as Record<string, unknown>).document =
        window.document;
    (globalThis as unknown as Record<string, unknown>).HTMLElement =
        window.HTMLElement;
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
        observe() {}
        disconnect() {}
    };

    ({ EventStartNode, EventEndNode } = await import("kipphi"));
    ({ sameValuePartner, chooseGridStep, pickValueGridSpan, roundValue } =
        await import("./eventCurveEditor"));
});

/** 用原型造节点，`instanceof` 判断能过；只需要 value / next / previous */
function make(type: any, value: number): AnyNode {
    return Object.assign(Object.create(type.prototype), {
        value,
        next: null,
        previous: null
    }) as AnyNode;
}

/**
 * 按 `[startingValue, endingValue]` 列表把段串起来。
 *
 * 每段：`start.value → end.value`；相邻两段之间 `end.next = 下一个 start`。
 */
function chain(segments: [number, number][]): AnyNode[] {
    const starts: AnyNode[] = [];
    let previous: AnyNode | null = null;

    for (const [from, to] of segments) {
        const start = make(EventStartNode, from);
        const end = make(EventEndNode, to);

        start.next = end;
        end.previous = start;

        if (previous) {
            previous.next = start;
            start.previous = previous;
        }

        starts.push(start);
        previous = end;
    }

    return starts;
}

describe("sameValuePartner", () => {
    it("交界处同值的 end 和 start 互为伙伴", () => {
        const [start1, start2] = chain([
            [1, 1],
            [1, 1]
        ]);
        const end1 = start1.next as AnyNode;

        expect(sameValuePartner(end1)).toBe(start2);
        expect(sameValuePartner(start2)).toBe(end1);
    });

    it("一段内部的 start 和 end 是面对面，不配对", () => {
        const [start1] = chain([[1, 1]]);

        // 左边是 head（这里是 null），右边是 tail（也是 null）
        expect(sameValuePartner(start1)).toBeNull();
        expect(sameValuePartner(start1.next as AnyNode)).toBeNull();
    });

    it("序列第一个 start 永远没有伙伴", () => {
        const [start1] = chain([
            [5, 5],
            [5, 5]
        ]);

        expect(sameValuePartner(start1)).toBeNull();
    });

    it("交界处值不同就不绑", () => {
        const [start1, start2] = chain([
            [1, 1],
            [2, 2]
        ]);

        expect(sameValuePartner(start1.next as AnyNode)).toBeNull();
        expect(sameValuePartner(start2)).toBeNull();
    });

    it("段是斜的也不影响交界处配对", () => {
        // 第一段 1 → 2，下一段从 2 开始：交界处都是 2
        const [start1, start2] = chain([
            [1, 2],
            [2, 2]
        ]);

        expect(sameValuePartner(start1.next as AnyNode)).toBe(start2);
    });

    it("连续三段同值时，中间交界处的两对都成立", () => {
        const [start1, start2, start3] = chain([
            [1, 1],
            [1, 1],
            [1, 1]
        ]);

        expect(sameValuePartner(start1.next as AnyNode)).toBe(start2);
        expect(sameValuePartner(start2.next as AnyNode)).toBe(start3);
        // 第一个 start 依然不参与
        expect(sameValuePartner(start1)).toBeNull();
    });
});

describe("chooseGridStep（放大时的值网格密度）", () => {
    it("没放大时步长不变", () => {
        expect(chooseGridStep(10, 1, 100)).toBe(10);
        expect(chooseGridStep(10, 0.5, 100)).toBe(10);
    });

    it("能整除时按放大倍数细分", () => {
        expect(chooseGridStep(10, 2, 100)).toBe(5);
        // 4 倍时 10/4 = 2.5 不是整数 → 退到 5 倍（间隔 2，仍是整数）
        expect(chooseGridStep(10, 4, 100)).toBe(2);
    });

    it("间隔是 1 时允许小数", () => {
        expect(chooseGridStep(1, 2, 10)).toBe(0.5);
        expect(chooseGridStep(1, 4, 10)).toBe(0.25);
    });

    it("间隔不是 2 的倍数时，退到能整除的 3 / 5 倍", () => {
        // 3 只能靠 3 倍整除
        expect(chooseGridStep(3, 2, 3)).toBe(1);
        // 5 只能靠 5 倍整除
        expect(chooseGridStep(5, 2, 5)).toBe(1);
    });

    it("加密后超过 50 条线就放弃加密", () => {
        // 1x 就有 60 条（100 的间隔、6000 的范围）
        expect(chooseGridStep(100, 2, 6000)).toBe(100);
    });

    it("线太少时继续升倍（不到 5 条）", () => {
        // 1x 只有 2 条；2x 才 4 条 → 升到 5 倍（间隔 2，共 10 条）
        expect(chooseGridStep(10, 2, 20)).toBe(2);
    });
});

describe("pickValueGridSpan（负值不该把网格压成 1）", () => {
    it("往左拖出来的负值不会命中 -1", () => {
        // 修复前：-1 整除一切 → 步长 1 → 1350 个值域画满一屏
        const span = pickValueGridSpan([-40, -20, 30], 1, 1350);

        expect(span).toBeGreaterThan(1);
        expect(1350 / span).toBeLessThanOrEqual(200);
    });

    it("全是负数时步长仍然合理", () => {
        const span = pickValueGridSpan([-1, -2, -3], 1, 1350);

        expect(span).toBeGreaterThan(1);
        expect(Number.isFinite(span)).toBe(true);
    });

    it("正常值仍按能整除最多个数的来", () => {
        // 10 能整除 10 / 20 / 30 三个
        expect(pickValueGridSpan([10, 20, 30], 1, 100)).toBe(10);
    });
});

describe("roundValue（去掉浮点误差尾巴）", () => {
    it("1.1 * 3 不再拖一串 0", () => {
        expect(roundValue(1.1 * 3)).toBe(3.3);
    });

    it("5.500000000000001 收敛成 5.5", () => {
        expect(roundValue(5.500000000000001)).toBe(5.5);
    });

    it("整数原样返回", () => {
        expect(roundValue(6)).toBe(6);
    });

    it("NaN / Infinity 不炸", () => {
        expect(Number.isNaN(roundValue(NaN))).toBe(true);
        expect(roundValue(Infinity)).toBe(Infinity);
    });
});

describe("拖动产生的脏值不该改网格步长", () => {
    it("5.500000000000001 不会被当成候选值", () => {
        // 5.5 不整除 6，命中的还是 6 自己 → 步长是干净的 6（不是 5.5 / 1.1）
        const span = pickValueGridSpan([6, 5.500000000000001], 1, 100);

        expect(span).toBe(6);
        expect(Number.isInteger(span)).toBe(true);
    });
});
