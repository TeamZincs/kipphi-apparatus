import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";
import { BezierEasing, easingArray, NumericEasedEvaluator } from "kipphi";

/**
 * 事件面板「表达式 ↔ 缓动求值器」切换的**集成**回归。
 *
 * grain 仓库里那些简化结构的用例都通过，但真实面板还是会出现"旧分支的
 * 元素删不掉"。所以这里直接编译并挂载真正的 `EventSheet.grain`，
 * 只把跨模块依赖换成桩（`@kpa/canvas` 的两块画布、`#/store`），
 * 其余（组件、宏、`$state`、模板分支）全是真的。
 */

const HERE = import.meta.dir;
const OUT = join(HERE, ".tmp");
const MOBILE_SRC = resolve(HERE, "..", "..", "..");
const RUNTIME = resolve(
    HERE,
    "../../../../../../../grain/packages/runtime/index.ts"
);

let window: Window;
let document: Document;

beforeAll(() => {
    window = new Window();
    document = window.document as unknown as Document;

    const globals = globalThis as unknown as Record<string, unknown>;

    globals.document = document;
    globals.Node = window.Node;
    globals.window = window;
    globals.requestAnimationFrame = (fn: FrameRequestCallback) =>
        setTimeout(() => fn(Date.now()), 0) as unknown as number;
    globals.ResizeObserver = class {
        observe() {}
        disconnect() {}
    };
    globals.CustomEvent = window.CustomEvent;
});

beforeEach(() => {
    document.body.innerHTML = "";
});

const norm = (path: string): string => path.replace(/\\/g, "/");

/** 编译一段 .grain 源码（用来搭和页面一样的挂载结构） */
async function buildSource(
    source: string,
    name: string,
    imports: Record<string, string> = {}
): Promise<string> {
    mkdirSync(OUT, { recursive: true });

    let js = compile(source, {
        runtimeModule: norm(RUNTIME),
        filename: `${name}.grain`
    }).js;

    for (const [from, to] of Object.entries(imports)) {
        js = js.split(`"${from}"`).join(JSON.stringify(norm(to)));
    }

    const file = join(OUT, `${name}.ts`);

    await Bun.write(file, js);

    return file;
}

/** 编译 .grain → .ts，顺手把 import 路径替换成测试桩 / 编译产物 */
async function build(
    sourcePath: string,
    name: string,
    imports: Record<string, string> = {}
): Promise<string> {
    mkdirSync(OUT, { recursive: true });

    let js = compile(await Bun.file(sourcePath).text(), {
        runtimeModule: norm(RUNTIME),
        filename: `${name}.grain`
    }).js;

    for (const [from, to] of Object.entries(imports)) {
        js = js.split(`"${from}"`).join(JSON.stringify(norm(to)));
    }

    const file = join(OUT, `${name}.ts`);

    await Bun.write(file, js);

    return file;
}

/** 假的操作列表：do() 里执行操作并派发 needsupdate（和真的一样） */
class FakeOperationList extends EventTarget {
    do(operation: { do: () => void }): void {
        operation.do();
        this.dispatchEvent(new Event("needsupdate"));
    }
}

async function stub(name: string, source: string): Promise<string> {
    mkdirSync(OUT, { recursive: true });

    const file = join(OUT, `${name}.ts`);

    await Bun.write(file, source);

    return file;
}

type Mounted = {
    target: HTMLElement;
    ops: FakeOperationList;
    evaluator: () => unknown;
    setEvaluator: (next: unknown) => void;
};

async function mountSheet(throughShell = false): Promise<Mounted> {
    const ops = new FakeOperationList();

    const storeStub = await stub(
        "event-sheet-store",
        `export const operationList = (globalThis as any).__eventSheetOps;`
    );

    const canvasStub = await stub(
        "event-sheet-canvas",
        `export class BezierEditor extends EventTarget {
            getValue() { return [0.25, 0.1, 0.25, 1]; }
            setValue() {}
            addTo(el: HTMLElement) {
                const c = document.createElement("canvas");
                c.className = "stub-canvas";
                el.appendChild(c);

                // 模拟"框架不认识"的命令式挂载：异步挂到求值器容器上，
                // 编译期生成的分支 nodes 快照里没有它
                setTimeout(() => {
                    const root = document.querySelector(".eval");
                    if (!root) return;
                    const orphan = document.createElement("canvas");
                    orphan.className = "orphan-canvas";
                    root.appendChild(orphan);
                }, 0);
            }
        }
        export class EasingCanvas extends EventTarget {
            constructor(_el: HTMLCanvasElement, _rect: number[]) {}
            draw() {}
            setValue() {}
        }`
    );

    (globalThis as any).__eventSheetOps = ops;

    const segmented = await build(
        join(MOBILE_SRC, "components", "Segmented.grain"),
        "ev-segmented"
    );
    const easingBox = await build(
        join(MOBILE_SRC, "components", "EasingBox.grain"),
        "ev-easing-box",
        { "#/components/Segmented.grain": segmented }
    );
    const bezierEditor = await build(
        join(MOBILE_SRC, "components", "BezierEditor.grain"),
        "ev-bezier-editor",
        { "@kpa/canvas": canvasStub }
    );
    const sheet = await build(join(HERE, "EventSheet.grain"), "ev-sheet", {
        "@kpa/canvas": canvasStub,
        "#/components/BezierEditor.grain": bezierEditor,
        "#/components/EasingBox.grain": easingBox,
        "#/components/Segmented.grain": segmented,
        "#/components/Switch.grain": await build(
            join(MOBILE_SRC, "components", "Switch.grain"),
            "ev-switch"
        ),
        "#/store": storeStub,
        "#/time": join(MOBILE_SRC, "time.ts")
    });

    const node = {
        time: [0, 0, 1] as [number, number, number],
        value: 0,
        // 用贝塞尔起步，才能测到「onmount 里挂的画布」那一条分支
        evaluator: new NumericEasedEvaluator(
            new BezierEasing([0.25, 0.1], [0.25, 1])
        )
    };

    (globalThis as any).__eventSheetNode = node;
    (globalThis as any).__eventSheetEditor = { draw() {} };

    let entry = sheet;

    if (throughShell) {
        const shell = await build(join(HERE, "SheetShell.grain"), "ev-shell");
        entry = await buildSource(
            `<script>
    import SheetShell from "${norm(shell)}";
    import EventSheet from "${norm(sheet)}";
</script>

<SheetShell onclose={() => {}}>
    <EventSheet
        node={(globalThis as any).__eventSheetNode}
        editor={(globalThis as any).__eventSheetEditor}
        onclose={() => {}}
    />
</SheetShell>`,
            "ev-harness"
        );
    }

    const module = await import(entry);
    const target = document.createElement("div");

    document.body.appendChild(target);

    module.create(
        throughShell
            ? {}
            : { node, editor: { draw() {} }, onclose: () => {} },
        null,
        { parent: target, before: null }
    );

    return {
        target,
        ops,
        evaluator: () => node.evaluator,
        setEvaluator: (next: unknown) => {
            (node as any).evaluator = next;
        }
    };
}

describe("EventSheet 求值器分支", () => {
    it.each([false, true])(
        "切到表达式后旧分支全部移除（经 SheetShell = %s）",
        async (throughShell) => {
        const { target } = await mountSheet(throughShell);

        // 等命令式挂载的那一帧
        await new Promise((done) => setTimeout(done, 20));

        const buttons = [
            ...target.querySelectorAll("button.seg")
        ] as HTMLElement[];
        const toExpression = buttons.find((b) => b.textContent === "表达式");
        const toEased = buttons.find((b) => b.textContent === "缓动");

        expect(toExpression).toBeTruthy();
        expect(toEased).toBeTruthy();

        // 初始是贝塞尔分支：画布已挂载、缓动类型按钮组也在
        expect(target.querySelectorAll(".stub-canvas").length).toBe(1);
        expect(target.querySelectorAll(".orphan-canvas").length).toBe(1);

        const canvasBefore = target.querySelector(".stub-canvas");
        expect(
            [...target.querySelectorAll("button.seg")].some(
                (b) => b.textContent === "普通"
            )
        ).toBe(true);

        toExpression!.dispatchEvent(
            new window.MouseEvent("click", { bubbles: true })
        );

        // 表达式输入框出现
        expect(
            target.querySelector('input[placeholder="a * b"]')
        ).toBeTruthy();

        // 缓动那一支的东西必须都没了
        expect(
            [...target.querySelectorAll("button.seg")].some(
                (b) => b.textContent === "普通"
            )
        ).toBe(false);
        // 用布尔比较：失败时不要把整棵 DOM 序列化出来（会很慢）
        expect(target.querySelector(".stub-canvas") === null).toBe(true);
        expect(target.querySelector("canvas") === null).toBe(true);
        expect(target.querySelector("select.pick") === null).toBe(true);
        // 命令式挂上去、框架不认识的那一块也必须被清掉
        expect(target.querySelector(".orphan-canvas") === null).toBe(true);

        // 来回切：不能残留旧分支，也不能出现两份
        const click = (button: HTMLElement) =>
            button.dispatchEvent(
                new window.MouseEvent("click", { bubbles: true })
            );

        click(toEased!);
        expect(
            target.querySelector('input[placeholder="a * b"]')
        ).toBeNull();
        expect(
            [...target.querySelectorAll("button.seg")].some(
                (b) => b.textContent === "普通"
            )
        ).toBe(true);
        // 分支复活时画布重新挂上，且没有残留的旧画布
        expect(target.querySelectorAll(".stub-canvas").length).toBe(1);
        expect(target.querySelector(".stub-canvas")).not.toBe(canvasBefore);

        // 新分支的异步挂载也要等一帧
        await new Promise((done) => setTimeout(done, 20));

        expect(target.querySelectorAll(".orphan-canvas").length).toBe(1);
        expect(target.querySelectorAll("canvas").length).toBe(2);

        click(toExpression!);
        expect(
            target.querySelectorAll('input[placeholder="a * b"]').length
        ).toBe(1);
        expect(
            [...target.querySelectorAll("button.seg")].some(
                (b) => b.textContent === "普通"
            )
        ).toBe(false);

        click(toEased!);
        expect(
            target.querySelector('input[placeholder="a * b"]')
        ).toBeNull();
        // 求值器那一排始终只有一组
        expect(
            [...target.querySelectorAll("button.seg")].filter(
                (b) => b.textContent === "缓动" || b.textContent === "表达式"
            ).length
        ).toBe(2);
    });
});
