import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";
import {
    BezierEasing,
    easingArray,
    NumericEasedEvaluator,
    TemplateEasing
} from "kipphi";

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

/**
 * 当前用例的操作列表。
 *
 * `store` 桩导出的是**转发代理**，每次调用都读这个全局 —— 所以每个用例
 * 换一个新的 ops 就够了，不需要给每个用例换一份编译产物（换文件名会让
 * Bun 首次解析新文件时偶尔报 "Cannot find module"）。
 */
let currentOps: FakeOperationList;

/**
 * 假的 `chart`（`store` 桩导出它）。
 *
 * 引用**固定不变**，用例改它的字段（比如往 `templateEasingLib.easings`
 * 里塞模板）就够了 —— 换对象会让模块缓存里的旧引用失效。
 */
const fakeChart = {
    templateEasingLib: { easings: new Map<string, unknown>() },
    macroLib: {
        valueMacros: new Map<string, unknown>(),
        timeMacros: new Map<string, unknown>()
    }
};

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
    globals.HTMLElement = window.HTMLElement;
    globals.__eventSheetChart = fakeChart;
});

beforeEach(() => {
    document.body.innerHTML = "";
    fakeChart.templateEasingLib.easings.clear();
    fakeChart.macroLib.valueMacros.clear();
    fakeChart.macroLib.timeMacros.clear();

    // 每个用例一份新的操作列表：上一个用例的组件仍挂着监听，但挂在旧对象上
    currentOps = new FakeOperationList();
    (globalThis as unknown as Record<string, unknown>).__eventSheetOps =
        currentOps;
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
    node: Record<string, unknown>;
    evaluator: () => unknown;
    setEvaluator: (next: unknown) => void;
};

async function mountSheet(
    throughShell = false,
    initial: "bezier" | "normal" = "bezier"
): Promise<Mounted> {
    const ops = currentOps;

    // 不同参数组合用不同产物，隔离 `<script module>` 里的草稿
    const tag = `${initial}-${throughShell ? "shell" : "direct"}`;

    // 转发代理：每次调用都读当前用例的 ops，同一个模块实例可以复用到多个用例
    const storeStub = await stub(
        `event-sheet-store-${tag}`,
        `const ops = () => (globalThis as any).__eventSheetOps;
        export const chart = (globalThis as any).__eventSheetChart;
        export const operationList = {
            addEventListener: (type: string, fn: EventListener) => ops()?.addEventListener(type, fn),
            removeEventListener: (type: string, fn: EventListener) => ops()?.removeEventListener(type, fn),
            do: (operation: any) => ops()?.do(operation)
        };`
    );

    const canvasStub = await stub(
        `event-sheet-canvas-${tag}`,
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
                    const root = el.closest(".eval");
                    if (!root) return;
                    const orphan = document.createElement("canvas");
                    orphan.className = "orphan-canvas";
                    root.appendChild(orphan);
                }, 0);
            }
        }
        export class EasingCanvas extends EventTarget {
            constructor(_el: HTMLCanvasElement, _rect: number[]) { super(); }
            draw() {}
            setValue() {}
        }`
    );

    const segmented = await build(
        join(MOBILE_SRC, "components", "Segmented.grain"),
        `ev-segmented-${tag}`
    );
    const easingBox = await build(
        join(MOBILE_SRC, "components", "EasingBox.grain"),
        `ev-easing-box-${tag}`,
        { "#/components/Segmented.grain": segmented }
    );
    const bezierEditor = await build(
        join(MOBILE_SRC, "components", "BezierEditor.grain"),
        `ev-bezier-editor-${tag}`,
        { "@kpa/canvas": canvasStub }
    );
    const sheet = await build(
        join(HERE, "EventSheet.grain"),
        `ev-sheet-${tag}`,
        {
        "@kpa/canvas": canvasStub,
        "#/components/BezierEditor.grain": bezierEditor,
        "#/components/EasingBox.grain": easingBox,
        "#/components/Segmented.grain": segmented,
        "#/components/Switch.grain": await build(
            join(MOBILE_SRC, "components", "Switch.grain"),
            `ev-switch-${tag}`
        ),
        "#/store": storeStub,
        "#/time": join(MOBILE_SRC, "time.ts")
    });

    const node: Record<string, unknown> = {
        time: [0, 0, 1] as [number, number, number],
        value: 0,
        macro: null,
        macroTime: null,
        linkedMacros: [],
        // 两种起步：贝塞尔测命令式画布，普通测 EasingBox 的残留 / 重复
        evaluator: new NumericEasedEvaluator(
            initial === "bezier"
                ? new BezierEasing([0.25, 0.1], [0.25, 1])
                : easingArray[1]
        )
    };

    (globalThis as any).__eventSheetNode = node;
    (globalThis as any).__eventSheetEditor = { draw() {} };

    let entry = sheet;

    if (throughShell) {
        const shell = await build(
            join(HERE, "SheetShell.grain"),
            `ev-shell-${tag}`
        );
        entry = await buildSource(
            `<script>
    import SheetShell from "${norm(shell)}";
    import EventSheet from "${norm(sheet)}";

    // 和 +page.grain 一样：外层 {#if sheetOpen}，children 里再套一层 {#if}
    let open = $state(true);
    let kind = $state("event");
    (globalThis as any).__setOpen = (v) => { open = v; };
    (globalThis as any).__setKind = (v) => { kind = v; };
</script>

{#if open}
    <SheetShell onclose={() => {}}>
        {#if kind === "note"}
            <div class="note-stub">note</div>
        {:else}
            <EventSheet
                node={(globalThis as any).__eventSheetNode}
                editor={(globalThis as any).__eventSheetEditor}
                onclose={() => {}}
            />
        {/if}
    </SheetShell>
{/if}`,
            `ev-harness-${tag}`
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
        node,
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

    it.each([false, true])(
        "普通缓动起步：来回切求值器，EasingBox 不残留也不重复（经 SheetShell = %s）",
        async (throughShell) => {
            const { target } = await mountSheet(throughShell, "normal");

            // `EasingBox` 的特征：三行 + 一个函数下拉框
            const boxes = () => target.querySelectorAll("select.pick").length;
            const rows = () => target.querySelectorAll("div.row").length;

            expect(boxes()).toBe(1);
            expect(rows()).toBe(3);

            const buttons = [
                ...target.querySelectorAll("button.seg")
            ] as HTMLElement[];
            const toExpression = buttons.find(
                (b) => b.textContent === "表达式"
            )!;
            const toEased = buttons.find((b) => b.textContent === "缓动")!;

            const click = (button: HTMLElement) =>
                button.dispatchEvent(
                    new window.MouseEvent("click", { bubbles: true })
                );

            for (let round = 1; round <= 3; round++) {
                click(toExpression);
                expect(boxes()).toBe(0);
                expect(rows()).toBe(0);

                click(toEased);
                expect(boxes()).toBe(1);
                expect(rows()).toBe(3);
                // 整块面板 / 框架自己建的分段画布都只能各有一份
                expect(target.querySelectorAll(".eval").length).toBe(1);
                expect(target.querySelectorAll("canvas.curve").length).toBe(
                    1
                );
            }
        }
    );

    it("缓动种类来回切（普通↔贝塞尔），第二次切回普通只有一份 EasingBox", async () => {
        const { target } = await mountSheet(false, "normal");

        const boxes = () => target.querySelectorAll("select.pick").length;
        const curves = () => target.querySelectorAll("canvas.curve").length;
        const beziers = () => target.querySelectorAll(".stub-canvas").length;

        const button = (label: string) =>
            [...target.querySelectorAll("button.seg")].find(
                (b) => b.textContent === label
            ) as HTMLElement;
        const click = (b: HTMLElement) =>
            b.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

        expect(boxes()).toBe(1);
        expect(curves()).toBe(1);

        for (let round = 1; round <= 3; round++) {
            click(button("贝塞尔"));
            expect(boxes()).toBe(0);
            expect(beziers()).toBe(1);

            click(button("普通"));
            expect(boxes()).toBe(1);
            expect(curves()).toBe(1);
            expect(beziers()).toBe(0);
        }

        expect(target.querySelectorAll(".eval").length).toBe(1);
    });

    it("普通 → 贝塞尔 → 普通 → 表达式，缓动分支必须整块消失", async () => {
        const { target } = await mountSheet(false, "normal");

        const boxes = () => target.querySelectorAll("select.pick").length;
        const curves = () => target.querySelectorAll("canvas.curve").length;

        const button = (label: string) =>
            [...target.querySelectorAll("button.seg")].find(
                (b) => b.textContent === label
            ) as HTMLElement;
        const click = (b: HTMLElement) =>
            b.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

        expect(boxes()).toBe(1);
        expect(curves()).toBe(1);

        // 用户报的顺序：先切贝塞尔，再回普通，最后切表达式
        click(button("贝塞尔"));
        expect(boxes()).toBe(0);

        click(button("普通"));
        expect(boxes()).toBe(1);
        expect(curves()).toBe(1);

        click(button("表达式"));

        // 到这一步缓动那一支必须整块没了
        expect(boxes()).toBe(0);
        expect(curves()).toBe(0);
        expect(
            [...target.querySelectorAll("button.seg")].some(
                (b) => b.textContent === "普通"
            )
        ).toBe(false);
    });

    it("节点上的贝塞尔值变了，组件里的四个控制点输入框要跟着更新", async () => {
        const { target, ops, setEvaluator } = await mountSheet(false, "bezier");

        const inputs = () =>
            [...target.querySelectorAll(".quad input")] as HTMLInputElement[];

        expect(inputs().map((i) => i.value)).toEqual(["0.25", "0.1", "0.25", "1"]);

        // 模拟"节点被改"：数据变了 + 操作列表通知
        setEvaluator(
            new NumericEasedEvaluator(new BezierEasing([0.4, 0.2], [0.6, 0.9]))
        );
        ops.dispatchEvent(new Event("needsupdate"));

        expect(inputs().map((i) => i.value)).toEqual(["0.4", "0.2", "0.6", "0.9"]);
    });

    it("模板缓动：列出谱面里的模板，选中后写成求值器", async () => {
        fakeChart.templateEasingLib.easings.set(
            "ease1",
            new TemplateEasing("ease1", {} as never)
        );
        fakeChart.templateEasingLib.easings.set(
            "ease2",
            new TemplateEasing("ease2", {} as never)
        );

        const { target, evaluator } = await mountSheet(false, "normal");

        const button = (label: string) =>
            [...target.querySelectorAll("button.seg")].find(
                (b) => b.textContent === label
            ) as HTMLElement;

        button("模板").dispatchEvent(
            new window.MouseEvent("click", { bubbles: true })
        );

        const options = [
            ...target.querySelectorAll("select.pick option")
        ] as HTMLOptionElement[];

        expect(options.map((o) => o.textContent)).toEqual(["ease1", "ease2"]);

        // 切过来要自动落到第一个模板上（暂存为空时也总得有个能用的）
        expect(
            (evaluator() as { easing?: { name?: string } }).easing?.name
        ).toBe("ease1");
    });

    it("宏：谱面里有值宏 / 时间宏时列出，没有时不占地方", async () => {
        const { target } = await mountSheet(false, "normal");

        // 谱面里没有宏：整块不渲染
        expect(target.querySelectorAll(".macro").length).toBe(0);

        fakeChart.macroLib.valueMacros.set("val1", { id: "val1" });
        fakeChart.macroLib.timeMacros.set("time1", { id: "time1" });

        currentOps.dispatchEvent(new Event("needsupdate"));

        const selects = [
            ...target.querySelectorAll(".macro select.pick")
        ] as HTMLSelectElement[];

        expect(selects.length).toBe(2);

        const values = (select: HTMLSelectElement) =>
            [...select.options].map((option) => option.value);

        // 第一项是「无」，对应解绑
        expect(values(selects[0])).toEqual(["", "val1"]);
        expect(values(selects[1])).toEqual(["", "time1"]);
    });

    it("关联宏：节点被哪些宏引用着，以标签形式列出来", async () => {
        const { target, node, ops } = await mountSheet(false, "normal");

        expect(target.querySelectorAll(".chip").length).toBe(0);

        node.linkedMacros = [{ id: "parent1" }, { id: "parent2" }];
        ops.dispatchEvent(new Event("needsupdate"));

        const chips = [...target.querySelectorAll(".chip")].map(
            (chip) => chip.textContent
        );

        expect(chips).toEqual(["parent1", "parent2"]);
    });

    it("关闭再打开 / children 分支切换后，EasingBox 不出现两份", async () => {
        const { target } = await mountSheet(true, "normal");

        const boxes = () => target.querySelectorAll("select.pick").length;
        const evals = () => target.querySelectorAll(".eval").length;

        expect(boxes()).toBe(1);
        expect(evals()).toBe(1);

        // 关闭面板再打开 —— "第二次进入缓动求值器"
        (globalThis as any).__setOpen(false);
        expect(boxes()).toBe(0);

        (globalThis as any).__setOpen(true);
        expect(boxes()).toBe(1);
        expect(evals()).toBe(1);

        // children 里 {#if note / event} 来回切
        (globalThis as any).__setKind("note");
        expect(boxes()).toBe(0);

        (globalThis as any).__setKind("event");
        expect(boxes()).toBe(1);
        expect(evals()).toBe(1);
    });
});
