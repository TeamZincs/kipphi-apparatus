import { describe, expect, it } from "bun:test";

import { insetRect, Magnifier, ZOOM_LEVELS } from "./magnifier";

describe("Magnifier", () => {
    it("初始是 1x，没按下元素时不激活", () => {
        const magnifier = new Magnifier();

        expect(magnifier.level).toBe(1);
        expect(magnifier.zoom).toBe(1);
        expect(magnifier.active).toBe(false);
    });

    it("按下元素只定住中心：主视图不动，但局部视图已经出来", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 12, y: 4 });

        expect(magnifier.anchor).toEqual({ x: 12, y: 4 });
        // 没点档位之前主视图不动
        expect(magnifier.zoom).toBe(1);
        expect(magnifier.zooming).toBe(false);
        // 局部视图是"按住就有"，此时是主视图的 2x
        expect(magnifier.active).toBe(true);
        expect(magnifier.localZoom).toBeCloseTo(2, 5);
    });

    it("切档后有 0.4s 动画，结束后倍率到位、局部高一档", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 0, y: 0 });
        magnifier.setIndex(1);

        expect(magnifier.level).toBe(2);
        expect(magnifier.animatingNow).toBe(true);

        // 动画中：还没到 2x
        magnifier.tick(performance.now());
        expect(magnifier.zoom).toBeLessThan(2);

        // 跳过动画时长
        magnifier.tick(performance.now() + 1000);

        expect(magnifier.zoom).toBeCloseTo(2, 5);
        expect(magnifier.animatingNow).toBe(false);
        expect(magnifier.active).toBe(true);
        // 局部视图始终比主视图高一档
        expect(magnifier.localZoom).toBeCloseTo(4, 5);
    });

    it("继续升档是翻倍，降档回到上一层", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 0, y: 0 });
        magnifier.setIndex(2, true);
        expect(magnifier.zoom).toBe(ZOOM_LEVELS[2]);
        expect(magnifier.localZoom).toBe(ZOOM_LEVELS[2] * 2);

        magnifier.step(-1);
        magnifier.tick(performance.now() + 1000);
        expect(magnifier.zoom).toBeCloseTo(ZOOM_LEVELS[1], 5);
    });

    it("松手回 1x 并收起局部视图", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 3, y: 5 });
        magnifier.setIndex(1, true);
        expect(magnifier.active).toBe(true);

        magnifier.reset();

        expect(magnifier.anchor).toBeNull();
        expect(magnifier.active).toBe(false);
        expect(magnifier.level).toBe(1);
    });

    it("档位下标不会越界", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 0, y: 0 });
        magnifier.setIndex(ZOOM_LEVELS.length + 10, true);

        expect(magnifier.levelIndex).toBe(ZOOM_LEVELS.length - 1);

        magnifier.setIndex(-5, true);

        expect(magnifier.levelIndex).toBe(0);
    });

    it("换一个元素会重置回 1x", () => {
        const magnifier = new Magnifier();

        magnifier.focus({ x: 1, y: 1 });
        magnifier.setIndex(2, true);

        magnifier.focus({ x: 9, y: 9 });

        expect(magnifier.levelIndex).toBe(0);
        expect(magnifier.anchor).toEqual({ x: 9, y: 9 });
    });
});

describe("insetRect", () => {
    it("默认画在左下角，边长不超过画布宽度的 30%", () => {
        const [left, top, size, height] = insetRect(400, 800, 10);

        expect(size).toBeCloseTo(120, 5);
        expect(height).toBe(size);
        expect(left).toBe(10);
        expect(top).toBe(800 - size - 10);
    });

    it("手指压在左下角时挪到右下角", () => {
        const [left] = insetRect(400, 800, 10, { x: 40, y: 700 });

        expect(left).toBe(400 - 120 - 10);
    });

    it("手指在别处时仍然留在左下角", () => {
        expect(insetRect(400, 800, 10, { x: 40, y: 40 })[0]).toBe(10);
        // 右下角的手指也不影响（局部视图本来就在左边）
        expect(insetRect(400, 800, 10, { x: 360, y: 700 })[0]).toBe(10);
    });

    it("窄画布下也不会超过高度的一半", () => {
        const [, , size] = insetRect(1000, 200, 8);

        expect(size).toBeLessThanOrEqual(200 * 0.4);
    });
});
