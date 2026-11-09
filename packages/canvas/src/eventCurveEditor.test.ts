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
    ({ sameValuePartner } = await import("./eventCurveEditor"));
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
