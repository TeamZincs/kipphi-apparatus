import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";
import { EventMacroValue, NoteMacro } from "kipphi";

/**
 * 宏面板：列表页按「音符宏 / 事件宏」分组，点进去看属性。
 */

const HERE = import.meta.dir;
const OUT = join(HERE, ".tmp");
const RUNTIME = resolve(
    HERE,
    "../../../../../../../grain/packages/runtime/index.ts"
);

let window: Window;
let document: Document;

const fakeChart = {
    macroLib: {
        noteMacros: new Map<string, unknown>(),
        valueMacros: new Map<string, unknown>(),
        timeMacros: new Map<string, unknown>()
    }
};

class FakeOperationList extends EventTarget {
    chart = fakeChart;
    do(operation: { do: () => void }): void {
        operation.do();
        this.dispatchEvent(new Event("needsupdate"));
    }
}

let currentOps: FakeOperationList;

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
    globals.__macroSheetChart = fakeChart;
});

beforeEach(() => {
    document.body.innerHTML = "";

    fakeChart.macroLib.noteMacros.clear();
    fakeChart.macroLib.valueMacros.clear();
    fakeChart.macroLib.timeMacros.clear();

    currentOps = new FakeOperationList();
    (globalThis as unknown as Record<string, unknown>).__macroSheetOps =
        currentOps;
});

const norm = (path: string): string => path.replace(/\\/g, "/");

/** 用原型造一个"看起来像真的"宏（`instanceof` 判断能过） */
function makeMacro<T extends object>(proto: object, fields: T): T {
    return Object.assign(Object.create(proto), {
        consumers: new Set(),
        checkSyntax: () => null,
        ...fields
    });
}

async function mountMacroSheet(): Promise<HTMLElement> {
    mkdirSync(OUT, { recursive: true });

    const storeStub = join(OUT, "macro-sheet-store.ts");

    await Bun.write(
        storeStub,
        `const ops = () => (globalThis as any).__macroSheetOps;
        export const chart = (globalThis as any).__macroSheetChart;
        export const operationList = {
            addEventListener: (type: string, fn: EventListener) => ops()?.addEventListener(type, fn),
            removeEventListener: (type: string, fn: EventListener) => ops()?.removeEventListener(type, fn),
            do: (operation: any) => ops()?.do(operation)
        };`
    );

    const js = compile(await Bun.file(join(HERE, "MacroSheet.grain")).text(), {
        runtimeModule: norm(RUNTIME),
        filename: "MacroSheet.grain"
    }).js.replace(
        /"#\/store"/g,
        JSON.stringify(norm(storeStub))
    );

    const file = join(OUT, "macro-sheet.ts");

    await Bun.write(file, js);

    const module = await import(file);
    const target = document.createElement("div");

    document.body.appendChild(target);

    module.create({ macro: null, onclose: () => {} }, null, {
        parent: target,
        before: null
    });

    return target;
}

describe("MacroSheet", () => {
    it("列表按音符宏 / 事件宏分组，点进去看得到类型和编号", async () => {
        fakeChart.macroLib.noteMacros.set(
            "nm1",
            makeMacro(NoteMacro.prototype, { id: "nm1", macro: "" })
        );
        fakeChart.macroLib.valueMacros.set(
            "vm1",
            makeMacro(EventMacroValue.prototype, { id: "vm1", macro: "a + 1" })
        );

        const target = await mountMacroSheet();
        const text = target.textContent ?? "";

        expect(text).toContain("音符宏");
        expect(text).toContain("事件宏");
        expect(text).toContain("nm1");
        expect(text).toContain("vm1");

        // 点数值宏 → 属性页
        const item = [...target.querySelectorAll("button.item")].find(
            (button) => button.textContent?.trim() === "vm1"
        ) as HTMLElement;

        item.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

        const body = target.textContent ?? "";

        expect(body).toContain("数值宏");
        expect(body).toContain("vm1");

        // 事件宏有可改的参数化表达式
        const textarea = target.querySelector("textarea") as HTMLTextAreaElement;

        expect(textarea).toBeTruthy();
        expect(textarea.value).toBe("a + 1");
    });

    it("谱面里没有宏时给提示", async () => {
        const target = await mountMacroSheet();

        expect(target.textContent).toContain("还没有宏");
    });
});
