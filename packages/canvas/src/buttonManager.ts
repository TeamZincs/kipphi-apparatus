/**
 * 画布上的圆角按钮管理器（即时模式）。
 *
 * 设计取舍：
 *   · **监听器挂在按钮上**（`onClick` / `onPress` / `onRelease` / `onDragEnter`），
 *     管理器本身不知道任何业务语义，只负责"布局 → 绘制 → 命中 → 转发"；
 *   · **状态由编辑器传进来**（`active` / `disabled` 每次 draw 现给），
 *     管理器不存一份，避免两份状态互相打架；
 *   · **坐标空间显式声明**：`screen` 是位图像素（0…width，左上原点），
 *     `world` 是编辑器过了相机矩阵之后的坐标。`hit()` 的入参必须和声明的一致 ——
 *     之前音符编辑器"点了没反应"就是这两者混了；
 *   · **拖动状态机留在编辑器里**，管理器只提供 `press` / `drag` / `release` 三个动作，
 *     以及 `onDragEnter` 这个"按住从别的按钮滑进来"的回调。
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

/** 按钮所在的坐标空间 */
export type ButtonSpace = "screen" | "world";

export interface CanvasButton {
    id: string;
    /** 文字（有 `icon` 时不画） */
    label?: string;
    icon?: IconName;
    /** 选中态（由编辑器每帧给） */
    active?: boolean;
    disabled?: boolean;

    /** 左键按下 */
    onPress?: () => void;
    /** 松开：`inside` 表示松手时还在这个按钮上 */
    onRelease?: (inside: boolean) => void;
    /** 点击（按下和松开都在同一个按钮上） */
    onClick?: () => void;
    /** 按住状态下从别的按钮滑进这个按钮（放大镜切档、音符拖出） */
    onDragEnter?: () => void;
}

export type ButtonLayout =
    /** 左上角一排（工具栏） */
    | { kind: "toolbar"; margin?: number; size?: number; gap?: number; radius?: number }
    /** 竖排一列（事件总览的层级） */
    | { kind: "column"; x: number; y: number; size: number; step: number; radius?: number }
    /** 排形按钮组：组内密接、只有整组圆角（放大镜 2x/4x/8x） */
    | { kind: "row"; x: number; y: number; cell: number; height: number; radius?: number };

export interface CanvasButtonRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class ButtonManager {
    private boxes: ButtonBox[] = [];
    private pressed: CanvasButton | null = null;
    private inside = new Set<string>();

    constructor(
        readonly space: ButtonSpace,
        private layout: ButtonLayout = { kind: "toolbar" }
    ) {}

    setLayout(layout: ButtonLayout): void {
        this.layout = layout;
    }

    /** 即时模式：每帧把当前按钮表传进来 */
    draw(
        context: CanvasRenderingContext2D,
        buttons: CanvasButton[],
        palette: ButtonPalette = DEFAULT_PALETTE
    ): void {
        const boxes = this.layoutBoxes(buttons);

        this.boxes = boxes;

        if (this.layout.kind === "row") {
            this.drawRow(context, boxes, palette);

            return;
        }

        for (const box of boxes) drawButton(context, box, palette, { radius: this.layout.radius ?? 8 });
    }

    /** 命中（入参空间必须和 `space` 一致） */
    hit(x: number, y: number): CanvasButton | null {
        const id = hitTest(this.boxes, x, y);

        return id ? (this.buttonById(id) ?? null) : null;
    }

    /** 按下：命中就记下来并回调 `onPress` */
    press(x: number, y: number): CanvasButton | null {
        const button = this.hit(x, y);

        this.pressed = button;
        this.inside = new Set(button ? [button.id] : []);

        button?.onPress?.();

        return button;
    }

    /** 按住移动：进入新按钮时回调 `onDragEnter` */
    drag(x: number, y: number): CanvasButton | null {
        const button = this.hit(x, y);

        if (!button) {
            this.inside.clear();

            return null;
        }

        if (!this.inside.has(button.id)) {
            this.inside.add(button.id);
            button.onDragEnter?.();
        }

        return button;
    }

    /** 松开：同一颗就触发 `onClick`，并总是回调 `onRelease(inside)` */
    release(x: number, y: number): void {
        const button = this.hit(x, y);
        const pressed = this.pressed;

        this.pressed = null;
        this.inside.clear();

        if (!pressed) return;

        pressed.onRelease?.(button?.id === pressed.id);

        if (button?.id === pressed.id) button.onClick?.();
    }

    private buttonById(id: string): CanvasButton | undefined {
        return this.lastButtons?.find((button) => button.id === id);
    }

    private lastButtons: CanvasButton[] | null = null;

    private specOf(button: CanvasButton) {
        return {
            id: button.id,
            label: button.label ?? "",
            icon: button.icon,
            active: button.active,
            disabled: button.disabled
        };
    }

    private layoutBoxes(buttons: CanvasButton[]): ButtonBox[] {
        this.lastButtons = buttons;

        const layout = this.layout;

        if (layout.kind === "toolbar") {
            const { margin = 8, size = 30, gap = 6 } = layout;
            let cursor = margin;

            return buttons.map((button) => {
                const box: ButtonBox = {
                    id: button.id,
                    spec: this.specOf(button),
                    x: cursor,
                    y: margin,
                    width: size,
                    height: size
                };

                cursor += size + gap;

                return box;
            });
        }

        if (layout.kind === "column") {
            const { x, y, size, step } = layout;

            return buttons.map((button, index) => ({
                id: button.id,
                spec: this.specOf(button),
                x,
                y: y + step * index,
                width: size,
                height: size
            }));
        }

        if (layout.kind === "row") {
            const { x, y, cell, height } = layout;

            return buttons.map((button, index) => ({
                id: button.id,
                spec: this.specOf(button),
                x: x + cell * index,
                y,
                width: cell,
                height
            }));
        }

        return [];
    }

    /** 排形组：整组圆角、组内方角、中间有分隔线 */
    private drawRow(context: CanvasRenderingContext2D, boxes: ButtonBox[], palette: ButtonPalette): void {
        if (boxes.length === 0) return;

        const radius = this.layout.kind === "row" ? (this.layout.radius ?? 8) : 8;
        const first = boxes[0];
        const last = boxes[boxes.length - 1];
        const width = last.x + last.width - first.x;

        for (let i = 0; i < boxes.length; i += 1) {
            const box = boxes[i];
            const isFirst = i === 0;
            const isLast = i === boxes.length - 1;

            context.save();
            roundRectPath(
                context,
                isFirst ? box.x : box.x,
                box.y,
                box.width,
                box.height,
                isFirst || isLast ? radius : 0
            );
            context.clip();
            drawButton(context, box, palette, { radius: 0 });
            context.restore();
        }

        roundRectPath(context, first.x + 0.5, first.y + 0.5, width - 1, first.height - 1, radius);
        context.strokeStyle = palette.border;
        context.stroke();
    }
}
