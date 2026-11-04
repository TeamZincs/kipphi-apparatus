import { beforeAll, describe, expect, it } from "bun:test";

/**
 * 工具栏的**布局**与**命中/手势语义**。
 *
 * 这两块最近动过好几次（工具栏排三行、总览里隐藏按钮），而它们全是纯算术 +
 * 状态机，最适合用回归测试钉住：
 *   · 靠左 / 靠右的 x 怎么算
 *   · 排形按钮组是密接的（没有 gap）
 *   · 竖排的步进
 *   · `press / drag / release` 各自什么时候回调谁
 */

type Manager = typeof import("./buttonManager");

let ButtonManager: Manager["ButtonManager"];

const noop = () => undefined;

/** 只要方法被调用不炸就行 —— 布局和写入 `boxes` 发生在 draw() 里 */
const stubContext = (): CanvasRenderingContext2D => {
    const store: Record<string, unknown> = {};

    const fallback = (key: string) => {
        if (key === "measureText") return () => ({ width: 0 });
        if (key === "createLinearGradient" || key === "createRadialGradient")
            return () => ({ addColorStop: noop });

        return noop;
    };

    return new Proxy(store, {
        get: (target, key: string) =>
            key in target ? target[key] : fallback(key),
        set: (target, key: string, value) => {
            target[key] = value;

            return true;
        }
    }) as unknown as CanvasRenderingContext2D;
};

beforeAll(async () => {
    const globals = globalThis as unknown as Record<string, unknown>;

    globals.window = globals.window ?? {};

    const module = await import("./buttonManager");

    ButtonManager = module.ButtonManager;
});

const buttons = (count: number, extra = {}) =>
    Array.from({ length: count }, (_, index) => ({
        id: `b${index}`,
        label: `${index}`,
        ...extra
    }));

const boxesOf = (manager: InstanceType<Manager["ButtonManager"]>) => {
    manager.draw(stubContext(), buttons(3));

    return manager["boxes"] as { id: string; x: number; y: number; width: number; height: number }[];
};

describe("toolbar 布局", () => {
    it("靠左：从 margin 起，逐个加 size + gap", () => {
        const manager = new ButtonManager("screen", {
            kind: "toolbar",
            margin: 14,
            size: 40,
            gap: 6,
            y: 14
        });

        expect(boxesOf(manager).map((box) => [box.x, box.y])).toEqual([
            [14, 14],
            [60, 14],
            [106, 14]
        ]);
    });

    it("靠右：从右边缘往回推", () => {
        const manager = new ButtonManager("screen", {
            kind: "toolbar",
            margin: 14,
            size: 40,
            gap: 6,
            y: 14,
            align: "right"
        });

        manager.setViewportWidth(358);

        // total = 3*40 + 2*6 = 132；起点 = 358 - 14 - 132 = 212
        expect(boxesOf(manager).map((box) => box.x)).toEqual([212, 258, 304]);
    });

    it("靠右但画布太窄时，起点被夹在 margin", () => {
        const manager = new ButtonManager("screen", {
            kind: "toolbar",
            margin: 14,
            size: 40,
            gap: 6,
            align: "right"
        });

        manager.setViewportWidth(100);

        expect(boxesOf(manager)[0].x).toBe(14);
    });

    it("每个按钮都是 size × size", () => {
        const manager = new ButtonManager("screen", { kind: "toolbar", size: 40 });

        expect(boxesOf(manager).map((box) => [box.width, box.height])).toEqual([
            [40, 40],
            [40, 40],
            [40, 40]
        ]);
    });
});

describe("column / row 布局", () => {
    it("竖排按 step 递进", () => {
        const manager = new ButtonManager("screen", {
            kind: "column",
            x: 10,
            y: 20,
            size: 32,
            step: 36
        });

        expect(boxesOf(manager).map((box) => [box.x, box.y])).toEqual([
            [10, 20],
            [10, 56],
            [10, 92]
        ]);
    });

    it("排形按钮组是密接的（没有 gap）", () => {
        const manager = new ButtonManager("screen", {
            kind: "row",
            x: 100,
            y: 50,
            cell: 36,
            height: 28
        });

        expect(boxesOf(manager).map((box) => [box.x, box.width])).toEqual([
            [100, 36],
            [136, 36],
            [172, 36]
        ]);
    });
});

describe("命中", () => {
    const make = () =>
        new ButtonManager("screen", {
            kind: "toolbar",
            margin: 14,
            size: 40,
            gap: 6
        });

    it("点在按钮里命中它", () => {
        const manager = make();

        manager.draw(stubContext(), buttons(3));

        expect(manager.hit(20, 20)?.id).toBe("b0");
        expect(manager.hit(70, 20)?.id).toBe("b1");
        expect(manager.hit(110, 20)?.id).toBe("b2");
    });

    it("点在 gap / 外面不命中", () => {
        const manager = make();

        manager.draw(stubContext(), buttons(3));

        expect(manager.hit(56, 20)).toBeNull(); // 14+40=54 是边缘，56 落在缝里
        expect(manager.hit(5, 5)).toBeNull();
        expect(manager.hit(200, 20)).toBeNull();
    });

    it("禁用的按钮不参与命中", () => {
        const manager = make();

        manager.draw(
            stubContext(),
            buttons(3, { disabled: true })
        );

        expect(manager.hit(20, 20)).toBeNull();
    });
});

describe("手势", () => {
    const make = () => {
        const manager = new ButtonManager("screen", {
            kind: "toolbar",
            margin: 14,
            size: 40,
            gap: 6
        });
        const log: string[] = [];

        manager.draw(stubContext(), [
            {
                id: "a",
                onPress: () => log.push("press:a"),
                onClick: () => log.push("click:a"),
                onDragEnter: () => log.push("enter:a"),
                onRelease: (inside) => log.push(`release:a:${inside}`)
            },
            {
                id: "b",
                onClick: () => log.push("click:b"),
                onDragEnter: () => log.push("enter:b"),
                onRelease: (inside) => log.push(`release:b:${inside}`)
            }
        ]);

        return { manager, log };
    };

    it("按下 + 松手在同一颗 → press、release(true)、click", () => {
        const { manager, log } = make();

        manager.press(20, 20);
        manager.release(20, 20);

        expect(log).toEqual(["press:a", "release:a:true", "click:a"]);
    });

    it("按下 A 松手在 B → release(false)，不触发 click", () => {
        const { manager, log } = make();

        manager.press(20, 20);
        manager.release(70, 20);

        expect(log).toEqual(["press:a", "release:a:false"]);
    });

    it("拖进另一颗只回调一次 onDragEnter（同一次手势里不重复）", () => {
        const { manager, log } = make();

        manager.press(20, 20);
        manager.drag(70, 20);
        manager.drag(72, 22); // 还在 b 上
        manager.drag(20, 20); // 回到 a —— 这次手势里 a 已经进过了

        expect(log).toEqual(["press:a", "enter:b"]);
    });

    it("拖到空白处会清掉\"已进入\"状态", () => {
        const { manager, log } = make();

        manager.press(20, 20);
        manager.drag(70, 20);
        manager.drag(200, 200); // 空白
        manager.drag(70, 20); // 再进来应该再回调一次

        expect(log).toEqual(["press:a", "enter:b", "enter:b"]);
    });

    it("没按下就松手什么也不发生", () => {
        const { manager, log } = make();

        manager.release(20, 20);

        expect(log).toEqual([]);
    });
});
