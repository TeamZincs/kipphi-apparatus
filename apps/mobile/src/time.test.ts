import { describe, expect, it } from "bun:test";

import { TC } from "kipphi";

import {
    beatsOf,
    formatTime,
    num,
    parseTime,
    splitBeats,
    splitTime,
    toTime
} from "./time";

/**
 * 时间工具是面板里最容易"看起来对、其实错一点点"的地方：
 * 三个框 ↔ 单个分数框 ↔ `TimeT` 三元组，三套表示来回换。
 * 这里把每条换算都钉住。
 */

describe("formatTime", () => {
    it("整数拍只显示拍号", () => {
        expect(formatTime([3, 0, 1])).toBe("3");
        expect(formatTime([0, 0, 1])).toBe("0");
    });

    it("带分数显示成 `拍+分子/分母`", () => {
        expect(formatTime([3, 1, 4])).toBe("3+1/4");
        expect(formatTime([0, 1, 4])).toBe("1/4");
    });

    it("约分成最简分数", () => {
        expect(formatTime([1, 2, 4])).toBe("1+1/2");
        expect(formatTime([0, 480, 960])).toBe("1/2");
    });

    it("分子等于分母时并进拍号", () => {
        expect(formatTime([2, 4, 4])).toBe("3");
    });
});

describe("parseTime", () => {
    it("认整数", () => {
        expect(parseTime("3")).toBe(3);
    });

    it("认 `拍+分子/分母`", () => {
        expect(parseTime("3+1/4")).toBe(3.25);
        expect(parseTime("3 + 1 / 4")).toBe(3.25);
    });

    it("认纯分数", () => {
        expect(parseTime("1/4")).toBe(0.25);
    });

    it("认小数", () => {
        expect(parseTime("3.25")).toBe(3.25);
    });

    it("认不出来是 NaN（不是 0）", () => {
        expect(Number.isNaN(parseTime(""))).toBe(true);
        expect(Number.isNaN(parseTime("abc"))).toBe(true);
        expect(Number.isNaN(parseTime("1/0"))).toBe(true);
        expect(Number.isNaN(parseTime("3+1/0"))).toBe(true);
    });
});

describe("formatTime ↔ parseTime", () => {
    it("往返不丢值", () => {
        for (const beats of [0, 1, 3.25, 2.5, 0.125, 7 + 3 / 8]) {
            const text = formatTime(toTime(beats));

            expect(parseTime(text)).toBeCloseTo(beats, 6);
        }
    });
});

describe("splitTime / splitBeats", () => {
    it("三元组拆成三个框", () => {
        expect(splitTime([3, 1, 4])).toEqual(["3", "1", "4"]);
    });

    it("拆的时候顺便约分", () => {
        expect(splitTime([1, 2, 4])).toEqual(["1", "1", "2"]);
    });

    it("整数拍的分子是 0", () => {
        expect(splitTime([5, 0, 1])).toEqual(["5", "0", "1"]);
    });

    it("从拍数拆（解析回来的路径）", () => {
        expect(splitBeats(3.25)).toEqual(["3", "1", "4"]);
    });
});

describe("beatsOf", () => {
    it("拍 + 分子/分母", () => {
        expect(beatsOf("3", "1", "4")).toBe(3.25);
    });

    it("分子可以超过分母", () => {
        expect(beatsOf("2", "6", "4")).toBe(3.5);
    });

    it("分母为 0 是 NaN", () => {
        expect(Number.isNaN(beatsOf("1", "1", "0"))).toBe(true);
    });

    it("空串 / 非数字是 NaN", () => {
        expect(Number.isNaN(beatsOf("", "1", "4"))).toBe(true);
        expect(Number.isNaN(beatsOf("x", "1", "4"))).toBe(true);
    });
});

describe("toTime", () => {
    it("保留到 1/960 拍", () => {
        expect(TC.toBeats(toTime(3.25))).toBeCloseTo(3.25, 6);
    });

    it("负数拍也能表示（零前时间合法）", () => {
        expect(TC.toBeats(toTime(-1.5))).toBeCloseTo(-1.5, 6);
    });
});

describe("num", () => {
    it("空串算 NaN，不是 0", () => {
        expect(Number.isNaN(num(""))).toBe(true);
        expect(num(" -2 ")).toBe(-2);
        expect(num("1.5")).toBe(1.5);
    });
});
