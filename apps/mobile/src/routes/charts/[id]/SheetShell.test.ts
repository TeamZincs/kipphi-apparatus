import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import type { Document } from "happy-dom";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { compile } from "@graints/compiler";

/**
 * `SheetShell` 的收起流程。
 *
 * 线上踩过的坑：`{#if}` 的分支**复用同一个组件实例**，关闭时如果 `closing`
 * 没复位，`.closing` 那条 `forwards` 动画会把面板永远停在 `translateY(100%)`，
 * 遮罩却还盖着整页 —— 表现是"只剩一个凸起、页面点不动"。
 *
 * 所以这里断言两件事：
 *   1. 点凸起 → 先挂 `.closing` 播动画、再回调 `onclose`（不是立刻卸载）；
 *   2. 回调之前的最后一刻，`closing` **已经被复位**（实例被复用时下次才干净）。
 *
 * 注：grain 运行时对"根本身就是一个 `{#if}`"的挂载不太配合（分支 thunk 不会
 * 在首次 mount 时求值），所以这里直接 `create(...)` 挂组件，用 `onclose` 观测
 * 生命周期；"分支复用实例"这层由 grain 仓库的
 * `packages/compiler/tests/branch-component-reuse.test.ts` 覆盖。
 */

type Compiled = { file: string };

const HERE = import.meta.dir;
const OUT = join(HERE, ".tmp");
/** grain 运行时（源码直接用，bun 能跑 TS） */
const RUNTIME = resolve(
    HERE,
    "../../../../../../../grain/packages/runtime/index.ts"
);

let window: Window;
let document: Document;
let seq = 0;

beforeAll(() => {
    window = new Window();
    document = window.document as unknown as Document;

    const globals = globalThis as unknown as Record<string, unknown>;

    globals.document = document;
    globals.Node = window.Node;
    globals.window = window;

    // happy-dom 没实现指针捕获；`SheetShell` 里是 `?.` 调用，补个空实现更稳
    const proto = (window as unknown as { HTMLElement: { prototype: object } })
        .HTMLElement.prototype as Record<string, unknown>;

    proto.setPointerCapture ??= () => {};
    proto.releasePointerCapture ??= () => {};
});

/** 把一段 .grain 编译成 .ts 落盘，返回可直接 import 的路径 */
const build = async (source: string, name: string): Promise<Compiled> => {
    const file = join(OUT, `${name}.ts`);

    mkdirSync(join(OUT), { recursive: true });

    const js = compile(source, { runtimeModule: RUNTIME, filename: `${name}.grain` }).js;

    await Bun.write(file, js);

    return { file };
};

let shellSource: string | null = null;

const shellCode = async (): Promise<string> => {
    shellSource ??= await Bun.file(join(HERE, "SheetShell.grain")).text();

    return shellSource;
};

/** 直接挂组件（`mount(target)` 传不了 props，所以走 `create`） */
const mountShell = async () => {
    const shell = await build(await shellCode(), `sheet-${seq}`);

    seq += 1;

    const module = await import(shell.file);
    const target = document.createElement("div");

    document.body.appendChild(target);

    const closings: number[] = [];
    const onclose = () => {
        closings.push(Date.now());
    };

    module.create({ onclose }, null, { parent: target, before: null });

    const sheet = target.querySelector(".sheet") as HTMLElement;
    const handle = target.querySelector(".handle") as HTMLElement;

    return {
        target,
        sheet,
        handle,
        onclose,
        closings,
        mask: target.querySelector(".mask") as HTMLElement
    };
};

/** 模拟"抓一下凸起然后松手"（没移动 → 直接收起） */
const clickHandle = (handle: HTMLElement) => {
    handle.dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
    handle.dispatchEvent(new window.Event("pointerup", { bubbles: true }));
};

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

describe("SheetShell", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("遮罩 / 面板 / 凸起都渲染出来了，且带 opening", async () => {
        const { mask, sheet, handle } = await mountShell();

        expect(mask).toBeTruthy();
        expect(sheet).toBeTruthy();
        expect(handle).toBeTruthy();
        expect(sheet.classList.contains("opening")).toBe(true);
        expect(sheet.style.transform).toContain("translateY(0");
    });

    it("点一下凸起：先播收起动画，再回调 onclose", async () => {
        const { handle, sheet, closings } = await mountShell();

        clickHandle(handle);

        expect(sheet.classList.contains("closing")).toBe(true);
        expect(closings.length).toBe(0);

        await sleep(320);

        expect(closings.length).toBe(1);
    });

    it("卸载前把 closing / offset / opening 复位（实例复用才干净）", async () => {
        const { handle, sheet, closings } = await mountShell();

        clickHandle(handle);
        await sleep(320);

        expect(closings.length).toBe(1);

        // 这一刻组件已经交给调用方卸载了：状态必须是"待入场"而不是"收起中"
        expect(sheet.classList.contains("closing")).toBe(false);
        expect(sheet.classList.contains("opening")).toBe(true);
        expect(sheet.style.transform).toContain("translateY(0");
    });
});
