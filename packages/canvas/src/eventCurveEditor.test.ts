import { beforeAll, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";

/**
 * 「同值联动」的分组判定。
 *
 * 事件序列的链是 `start → end → start → end …`，一段由 start 和它自己的
 * next（end）组成。这里只测分组算法，不碰 canvas 实例。
 *
 * `./eventCurveEditor` 会间接 import `kpp/polyfill`，那个模块在**顶层**就读
 * `window`，所以要先铺好 DOM 再动态 import。
 */

type StartNode = {
    value: number;
    next: unknown;
    previous: unknown;
};
type Node = { value: number; next: unknown; previous: unknown };

let EventStartNode: any;
let EventEndNode: any;
let collectSameValueGroup: (node: StartNode) => StartNode[];

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
    ({ collectSameValueGroup } = await import("./eventCurveEditor"));
});

/** 用原型造节点，`instanceof` 判断能过；只需要 value / next / previous */
function make(type: any, value: number): Node {
    return Object.assign(Object.create(type.prototype), {
        value,
        next: null,
        previous: null
    }) as Node;
}

/**
 * 按 `[startingValue, endingValue]` 列表把段串起来。
 *
 * 每段：`start.value → end.value`；相邻两段之间 `end.next = 下一个 start`。
 */
function chain(segments: [number, number][]): StartNode[] {
    const starts: StartNode[] = [];
    let previous: Node | null = null;

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

describe("collectSameValueGroup", () => {
    it("连续水平的同值段会并成一组", () => {
        const starts = chain([
            [1, 1],
            [1, 1],
            [1, 1]
        ]);

        expect(collectSameValueGroup(starts[0]).length).toBe(3);
        expect(collectSameValueGroup(starts[1]).length).toBe(3);
        expect(collectSameValueGroup(starts[2]).length).toBe(3);
    });

    it("中间出现不同值就断开", () => {
        const starts = chain([
            [1, 1],
            [1, 1],
            [2, 2],
            [2, 2]
        ]);

        expect(collectSameValueGroup(starts[0]).length).toBe(2);
        expect(collectSameValueGroup(starts[1]).length).toBe(2);
        expect(collectSameValueGroup(starts[2]).length).toBe(2);
        expect(collectSameValueGroup(starts[3]).length).toBe(2);
    });

    it("起点值不同就断开（和这一段平不平无关）", () => {
        const starts = chain([
            [0, 1],
            [1, 1]
        ]);

        expect(collectSameValueGroup(starts[0]).length).toBe(1);
        expect(collectSameValueGroup(starts[1]).length).toBe(1);
    });

    it("只有一个节点时组里只有它自己", () => {
        const starts = chain([[3, 3]]);

        expect(collectSameValueGroup(starts[0]).length).toBe(1);
    });

    it("中间夹着斜段也不影响同值的邻居绑定", () => {
        // 起点值：1、1、2 —— 前两段同值，第三段不同。
        // 斜段只说明"这一段不是平的"，不该让同值的前两段散伙。
        const starts = chain([
            [1, 1],
            [1, 2],
            [2, 2]
        ]);

        expect(collectSameValueGroup(starts[0]).length).toBe(2);
        expect(collectSameValueGroup(starts[1]).length).toBe(2);
        // 第三个起点值是 2，不和前面同值
        expect(collectSameValueGroup(starts[2]).length).toBe(1);
    });
});
