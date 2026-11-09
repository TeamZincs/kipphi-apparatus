import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";

/**
 * 历史版本页：读 `history.json` 的快照并支持还原。
 *
 * 数据层（`#/background`）在这一层桩掉 —— 真正的读写要 Tauri / Electron 的
 * 文件 API，测不到；这里只保证「列表渲染 + 点击还原」这条 UI 链路。
 */

const HERE = import.meta.dir;
const OUT = join(HERE, ".tmp");
const RUNTIME = resolve(
    HERE,
    "../../../../../../../grain/packages/runtime/index.ts"
);

const norm = (path: string) => path.replace(/\\/g, "/");

let window: Window;
let document: Document;

/** 页面会读到的历史快照 */
let history: Array<{ time: number; summary: string; filename: string }> = [];
/** 点击「还原」时记录下来的调用 */
let restored: Array<[string | undefined, string]> = [];

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
});

beforeEach(() => {
    document.body.innerHTML = "";
    history = [];
    restored = [];
});

async function mountHistoryPage(): Promise<HTMLElement> {
    mkdirSync(OUT, { recursive: true });

    const backgroundStub = join(OUT, "history-background.ts");

    await Bun.write(
        backgroundStub,
        `export const queryChartHistory = async () => (globalThis as any).__history;
        export const restoreChartVersion = async (chartId: string, filename: string) => {
            (globalThis as any).__restored.push([chartId, filename]);
        };`
    );

    const js = compile(
        await Bun.file(join(HERE, "history", "+page.grain")).text(),
        {
            runtimeModule: norm(RUNTIME),
            filename: "history/+page.grain"
        }
    ).js
        .replace(/"#\/background"/g, JSON.stringify(norm(backgroundStub)))
        // 页面用 `route.get().params.id`，测试里给个固定值
        .replace(
            /route(\.get\(\))?\.params\.id/g,
            JSON.stringify("chart-1")
        );

    const file = join(OUT, "history-page.ts");

    await Bun.write(file, js);

    // 桩的全局必须在 import 之前挂上
    (globalThis as unknown as Record<string, unknown>).__history = history;
    (globalThis as unknown as Record<string, unknown>).__restored = restored;

    const module = await import(file);
    const target = document.createElement("div");

    document.body.appendChild(target);
    module.default(target);

    // `refresh()` 是异步的
    await new Promise((done) => setTimeout(done, 10));

    return target;
}

describe("历史版本页", () => {
    it("没有历史时显示空状态", async () => {
        const target = await mountHistoryPage();

        expect(target.querySelectorAll(".row").length).toBe(0);
        expect(target.textContent).toContain("还没有保存过版本");
    });

    it("按时间倒序列出版本，点「还原」调用后端", async () => {
        history = [
            { time: 1000, summary: "第一次", filename: "chart.a.kpa2.json" },
            { time: 2000, summary: "第二次", filename: "chart.b.kpa2.json" }
        ];

        const target = await mountHistoryPage();
        const rows = [...target.querySelectorAll(".row")];

        expect(rows.length).toBe(2);
        // 最新的排最前
        expect(rows[0]!.textContent).toContain("第二次");
        expect(rows[1]!.textContent).toContain("第一次");

        (rows[0]!.querySelector(".restore") as HTMLElement).dispatchEvent(
            new window.MouseEvent("click", { bubbles: true })
        );

        await new Promise((done) => setTimeout(done, 10));

        expect(restored.length).toBe(1);
        expect(restored[0]![1]).toBe("chart.b.kpa2.json");
    });
});
