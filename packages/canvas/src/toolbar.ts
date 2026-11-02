/**
 * 画布左上角的按钮条。
 *
 * 和 `ui.ts` 的分工：`ui.ts` 只管"怎么画 / 怎么判命中"，这里管"有哪些按钮、
 * 当前哪个是激活的、点了怎么办"。
 *
 * 坐标是**画布像素坐标**（左上角原点、y 向下）。调用方在 `draw()` 里画之前
 * 需要 `setTransform(1, 0, 0, 1, 0, 0)` —— 编辑器内部默认是相机变换。
 */
import {
    DEFAULT_PALETTE,
    drawButton,
    hitTest,
    roundRectPath,
    type ButtonBox,
    type ButtonPalette,
    type IconName
} from "./ui";

export interface ToolbarButton {
    id: string;
    icon: IconName;
    active?: boolean;
    disabled?: boolean;
}

export interface ToolbarOptions {
    /** 单格边长 */
    size?: number;
    /** 距画布左上角 */
    margin?: number;
    /** 按钮之间留缝（单独按钮，不是排形组） */
    gap?: number;
    radius?: number;
}

export class EditorToolbar {
    buttons: ToolbarButton[] = [];

    private boxes: ButtonBox[] = [];

    constructor(
        buttons: ToolbarButton[] = [],
        private readonly options: ToolbarOptions = {}
    ) {
        this.buttons = buttons;
    }

    setButtons(buttons: ToolbarButton[]): void {
        this.buttons = buttons;
    }

    /** 画在左上角。返回占用的矩形（供调用方避开这块区域） */
    draw(context: CanvasRenderingContext2D, palette: ButtonPalette = DEFAULT_PALETTE): DOMRect | null {
        const { size = 30, margin = 8, gap = 6, radius = 8 } = this.options;

        this.boxes = [];

        let cursor = margin;

        for (const button of this.buttons) {
            this.boxes.push({
                id: button.id,
                spec: { id: button.id, label: "", icon: button.icon, active: button.active, disabled: button.disabled },
                x: cursor,
                y: margin,
                width: size,
                height: size
            });

            cursor += size + gap;
        }

        for (const box of this.boxes) drawButton(context, box, palette, { radius });

        if (this.boxes.length === 0) return null;

        const first = this.boxes[0];
        const last = this.boxes[this.boxes.length - 1];

        return new DOMRect(first.x, first.y, last.x + last.width - first.x, first.height);
    }

    /** 命中测试（画布像素坐标） */
    hit(x: number, y: number): string | null {
        return hitTest(this.boxes, x, y);
    }

    /**
     * 画一块"排形按钮组"：组内密接、无圆角，只有整组外框圆角。
     *
     * 放大镜的 2x / 4x / 8x 那种一排的就是用它。
     */
    static drawRow(
        context: CanvasRenderingContext2D,
        buttons: ToolbarButton[],
        options: { x: number; y: number; cellWidth: number; height: number; radius?: number },
        palette: ButtonPalette = DEFAULT_PALETTE
    ): ButtonBox[] {
        const { x, y, cellWidth, height, radius = 8 } = options;
        const boxes: ButtonBox[] = buttons.map((button, index) => ({
            id: button.id,
            spec: { id: button.id, label: "", icon: button.icon, active: button.active, disabled: button.disabled },
            x: x + index * cellWidth,
            y,
            width: cellWidth,
            height
        }));

        // 组背景 + 分隔线：整块圆角，内部方角
        roundRectPath(context, x, y, cellWidth * buttons.length, height, radius);

        for (const box of boxes) drawButton(context, box, palette, { radius: 0 });

        roundRectPath(context, x + 0.5, y + 0.5, cellWidth * buttons.length - 1, height - 1, radius);
        context.strokeStyle = palette.border;
        context.stroke();

        return boxes;
    }
}
