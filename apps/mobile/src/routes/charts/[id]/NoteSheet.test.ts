import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";
import { NoteType } from "kipphi";

/**
 * 音符面板的宏部分：绑定下拉框 + 关联宏标签。
 *
 * 和 `EventSheet.test.ts` 一样的做法：编译真正组件，只把 `#/store`
 * 换成转发代理，`#/time` 用真实文件。
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
let currentOps: FakeOperationList;

const fakeChart = {
    macroLib: {
        noteMacros: new Map<string, unknown>()
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
    globals.__noteSheetChart = fakeChart;
});

beforeEach(() => {
    document.body.innerHTML = "";
    fakeChart.macroLib.noteMacros.clear();

    currentOps = new FakeOperationList();
    (globalThis as unknown as Record<string, unknown>).__noteSheetOps =
        currentOps;
});

class FakeOperationList extends EventTarget {
    do(operation: { do: () => void }): void {
        operation.do();
        this.dispatchEvent(new Event("needsupdate"));
    }
}

const norm = (path: string): string => path.replace(/\\/g, "/");

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

async function stub(name: string, source: string): Promise<string> {
    mkdirSync(OUT, { recursive: true });

    const file = join(OUT, `${name}.ts`);

    await Bun.write(file, source);

    return file;
}

describe("NoteSheet 宏", () => {
    it("列出音符宏并回显当前绑定，关联宏以标签展示", async () => {
        fakeChart.macroLib.noteMacros.set("n1", { id: "n1" });
        fakeChart.macroLib.noteMacros.set("n2", { id: "n2" });

        const storeStub = await stub(
            "note-sheet-store",
            `const ops = () => (globalThis as any).__noteSheetOps;
            export const chart = (globalThis as any).__noteSheetChart;
            export const operationList = {
                addEventListener: (type: string, fn: EventListener) => ops()?.addEventListener(type, fn),
                removeEventListener: (type: string, fn: EventListener) => ops()?.removeEventListener(type, fn),
                do: (operation: any) => ops()?.do(operation)
            };`
        );

        const numField = await build(
            join(MOBILE_SRC, "components", "NumField.grain"),
            "ns-numfield"
        );
        const segmented = await build(
            join(MOBILE_SRC, "components", "Segmented.grain"),
            "ns-segmented"
        );
        const sheet = await build(join(HERE, "NoteSheet.grain"), "ns-sheet", {
            "#/components/NumField.grain": numField,
            "#/components/Segmented.grain": segmented,
            "#/components/Switch.grain": await build(
                join(MOBILE_SRC, "components", "Switch.grain"),
                "ns-switch"
            ),
            "#/store": storeStub,
            "#/time": join(MOBILE_SRC, "time.ts")
        });

        const module = await import(sheet);
        const target = document.createElement("div");

        document.body.appendChild(target);

        const note = {
            startTime: [0, 0, 1] as [number, number, number],
            endTime: [0, 0, 1] as [number, number, number],
            type: NoteType.tap,
            above: true,
            fake: false,
            x: 0,
            yOffset: 0,
            size: 1,
            judgeSize: 1,
            alpha: 1,
            speed: 1,
            macro: { id: "n1" },
            linkedMacros: [{ id: "parent" }]
        };

        module.create(
            { note, editor: { draw() {} }, onclose: () => {} },
            null,
            { parent: target, before: null }
        );

        const select = target.querySelector(
            ".macro select"
        ) as HTMLSelectElement;

        expect(select).toBeTruthy();
        expect([...select.options].map((o) => o.value)).toEqual([
            "",
            "n1",
            "n2"
        ]);
        // 当前绑的是 n1
        expect(select.value).toBe("n1");

        expect(
            [...target.querySelectorAll(".chip")].map((c) => c.textContent)
        ).toEqual(["parent"]);
    });
});
