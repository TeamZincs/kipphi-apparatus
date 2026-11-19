import { beforeAll, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";

/*
 * 拖动时 ghost 里画哪些节点。
 *
 * 用户可见的规则：**拖单节点、又没启用紫节点绑定，就只能看到一个副本**。
 * 多出来那个会跟着飘，看起来像编辑器在乱选。
 *
 * `./eventCurveEditor` 会间接 import `kpp/polyfill`，那个模块在**顶层**就读
 * `window`，所以要先铺好 DOM 再动态 import。
 */

type Node = { name: string };

let draggedNodes: (selected: Node, group: Iterable<Node> | null, partner: Node | null) => Node[];

beforeAll(async () => {
    const window = new Window();
    const globals = globalThis as unknown as Record<string, unknown>;

    globals.window = window;
    globals.document = window.document;
    globals.Node = window.Node;
    globals.CustomEvent = window.CustomEvent;
    globals.HTMLElement = window.HTMLElement;

    ({ draggedNodes } = await import("./eventCurveEditor"));
});

const a = { name: "a" };
const b = { name: "b" };
const c = { name: "c" };

describe("拖动 ghost 的节点集合", () => {
    it("单节点 + 没开绑定 → 只有被拖的那个", () => {
        expect(draggedNodes(a, null, null)).toEqual([a]);
    });

    it("单节点 + 开了绑定 → 被拖的那个 + 伙伴", () => {
        expect(draggedNodes(a, null, b)).toEqual([a, b]);
    });

    it("伙伴就是自己时不重复", () => {
        expect(draggedNodes(a, null, a)).toEqual([a]);
    });

    it("多选拖动 → 整批（伙伴已经在里面也不重复）", () => {
        expect(draggedNodes(a, [a, b, c], b)).toEqual([a, b, c]);
    });
});
