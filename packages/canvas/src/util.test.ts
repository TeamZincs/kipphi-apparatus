import { beforeAll, describe, expect, it } from "bun:test";

/**
 * 吸附是画布里最容易"差一点点"的地方：预览、落子、拖动都靠它，
 * 算错半格就会让人觉得"预览和真节点对不上"。
 *
 * 注意：`./util` 会间接 import `kipphi-player`，它在模块加载时就摸 `window`
 *（`polyfill.ts` 里 `if (window)`）。所以先补一个最小 shim，再动态 import。
 */

type Util = typeof import("./util");

let computeAttach: Util["computeAttach"];
let generateAttachable: Util["generateAttachable"];
let divideOrMul: Util["divideOrMul"];
let getPercentile: Util["getPercentile"];

beforeAll(async () => {
    const globals = globalThis as unknown as Record<string, unknown>;

    globals.window = globals.window ?? {};

    const util = await import("./util");

    computeAttach = util.computeAttach;
    generateAttachable = util.generateAttachable;
    divideOrMul = util.divideOrMul;
    getPercentile = util.getPercentile;
});

describe("computeAttach", () => {
    const grid = [0, 1, 2, 3];

    it("没有可吸附值时原样返回", () => {
        expect(computeAttach([], 1.5)).toBe(1.5);
    });

    it("小于最小值吸附到最小值", () => {
        expect(computeAttach(grid, -5)).toBe(0);
    });

    it("正好命中时返回本身", () => {
        expect(computeAttach(grid, 1)).toBe(1);
    });

    it("取更近的那一个", () => {
        expect(computeAttach(grid, 1.2)).toBe(1);
        expect(computeAttach(grid, 1.8)).toBe(2);
    });

    it("正中间时取右边（`<` 不是 `<=`）", () => {
        expect(computeAttach(grid, 1.5)).toBe(2);
    });

    it("大于最大值吸附到最大值", () => {
        expect(computeAttach(grid, 99)).toBe(3);
    });

    it("正好等于最大值也吸附到最大值", () => {
        // 之前这里返回 undefined（循环没覆盖最后一项），
        // 后面拿它去算坐标就成了 NaN
        expect(computeAttach(grid, 3)).toBe(3);
    });

    it("单个值时永远吸附到它", () => {
        expect(computeAttach([2], 0)).toBe(2);
        expect(computeAttach([2], 2)).toBe(2);
        expect(computeAttach([2], 9)).toBe(2);
    });
});

describe("generateAttachable", () => {
    it("按 k、b 生成范围内的格点", () => {
        expect(generateAttachable([1, 0], [0, 3])).toEqual([0, 1, 2, 3, 4]);
    });

    it("带偏移的格点：从区间左侧前一个格点起，到右端之后一个止", () => {
        expect(generateAttachable([1, 0.5], [0, 2])).toEqual([
            -0.5, 0.5, 1.5, 2.5
        ]);
    });

    it("k 太小时退化成首 / b / 尾", () => {
        expect(generateAttachable([0, 7], [-1, 1])).toEqual([-1, 7, 1]);
    });
});

describe("divideOrMul", () => {
    it("整除时按整除收缩", () => {
        expect(divideOrMul(8, 4)).toBe(2);
    });

    it("不能整除时取能整除的最大因子", () => {
        expect(divideOrMul(9, 4)).toBe(3);
    });

    it("gridSpan 比 maximum 小时给 1", () => {
        expect(divideOrMul(2, 4)).toBe(1);
    });

    it("maximum 小于 1 时走乘法分支", () => {
        expect(divideOrMul(1, 0.5)).toBe(2);
    });
});

describe("getPercentile", () => {
    it("按下标取", () => {
        expect(getPercentile([1, 2, 3, 4], 0)).toBe(1);
        expect(getPercentile([1, 2, 3, 4], 0.5)).toBe(3);
        expect(getPercentile([1, 2, 3, 4], 0.99)).toBe(4);
    });
});
