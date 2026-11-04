import { describe, expect, it } from "bun:test";

import { resolveSeekTarget } from "./playback";

/**
 * "进度条第二次才跟随拖动"那条坑的回归测试。
 *
 * 根因是播放器第一帧还没渲染时 `renderingBeats` 为 `NaN`，直接相加会把
 * `audio.currentTime` 写成 `NaN`，之后要等一次正常渲染才恢复 ——
 * 用户看到的就是"第一次拖没反应，第二次才跟"。
 */

describe("resolveSeekTarget", () => {
    it("正常情况下就是基准 + 增量", () => {
        expect(resolveSeekTarget(10, 2)).toBe(12);
        expect(resolveSeekTarget(10, -2)).toBe(8);
    });

    it("零前时间是合法的，不夹到 0", () => {
        expect(resolveSeekTarget(1, -3)).toBe(-2);
    });

    it("基准是 NaN（第一帧没画）时不 seek", () => {
        expect(resolveSeekTarget(NaN, 2)).toBeNull();
    });

    it("基准是 Infinity 时也不 seek", () => {
        expect(resolveSeekTarget(Infinity, 2)).toBeNull();
    });

    it("增量为 0 或非有限数时不 seek（避免无谓地写 audio.currentTime）", () => {
        expect(resolveSeekTarget(10, 0)).toBeNull();
        expect(resolveSeekTarget(10, NaN)).toBeNull();
        expect(resolveSeekTarget(10, Infinity)).toBeNull();
    });

    it("基准合法、增量极小也要跟着走", () => {
        expect(resolveSeekTarget(0, 1e-6)).toBeCloseTo(1e-6, 12);
    });
});
