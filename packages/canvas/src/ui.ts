/**
 * 画布编辑器里那些"画在 canvas 上"的 UI：圆角矩形按钮、排形按钮组、字号档位。
 *
 * 为什么要单独一个文件：TODO 里第一条就要求"为圆角矩形按钮专开一个处理机制"。
 * 现在两个编辑器各自画各自的文字（`BezierEditorState[...]`、`Beats: ...`），
 * 既不能点、样式也不统一。这里给出**绘制 + 布局 + 命中**三件套，两边共用。
 *
 * 坐标一律是**画布坐标系**（和编辑器内部 `clippingRect` 一致），
 * 由调用方负责把指针位置换算到这个坐标系再调用 `hitTest`。
 */

/** 字号档位：按画布尺寸取固定几档，不做按比例的连续缩放 */
export const FONT_TIERS = [12, 14, 16, 20] as const;

/**
 * 按画布宽度挑字号。
 *
 * 档位而不是比例：比例会让同一个界面在不同机型上前后的"层级感"变掉，
 * 而且小屏上 0.8 倍的 16px 会落在 12.8px 这种半像素上，发虚。
 */
export function fontForCanvas(width: number): number {
    if (width <= 240) return FONT_TIERS[0];
    if (width <= 360) return FONT_TIERS[1];
    if (width <= 480) return FONT_TIERS[2];

    return FONT_TIERS[3];
}

export interface ButtonPalette {
    /** 按钮底色 */
    background: string;
    /** 组内分隔线 / 外框 */
    border: string;
    /** 文字 / 图标颜色 */
    foreground: string;
    /** 选中态的底色 */
    activeBackground: string;
    /** 选中态的文字颜色 */
    activeForeground: string;
    /** 禁用态文字 */
    disabledForeground: string;
}

export const DEFAULT_PALETTE: ButtonPalette = {
    background: "rgba(28, 32, 40, 0.82)",
    border: "rgba(255, 255, 255, 0.16)",
    foreground: "rgba(255, 255, 255, 0.92)",
    activeBackground: "rgba(96, 165, 250, 0.9)",
    activeForeground: "#0b1220",
    disabledForeground: "rgba(255, 255, 255, 0.32)"
};

export interface ButtonSpec {
    id: string;
    /** 按钮上显示的东西（图标字符或英文缩写） */
    label: string;
    /** 当前是否处于激活态 */
    active?: boolean;
    disabled?: boolean;
    /** 组内占几格宽（排形按钮里不等宽的情况） */
    span?: number;
}

export interface ButtonBox {
    id: string;
    spec: ButtonSpec;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** 圆角矩形路径（老 Safari 没有 `roundRect`） */
export function roundRectPath(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
): void {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));

    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.arcTo(x + width, y, x + width, y + r, r);
    context.lineTo(x + width, y + height - r);
    context.arcTo(x + width, y + height, x + width - r, y + height, r);
    context.lineTo(x + r, y + height);
    context.arcTo(x, y + height, x, y + height - r, r);
    context.lineTo(x, y + r);
    context.arcTo(x, y, x + r, y, r);
    context.closePath();
}

export interface GroupLayoutOptions {
    x: number;
    y: number;
    /** 整组高度 */
    height: number;
    /** 组内按钮之间**不留缝**（排形按钮），这里只影响 span 分配的基准宽度 */
    cellWidth: number;
    /** 整组外框圆角 */
    radius?: number;
    gap?: number;
}

/**
 * 排形按钮组的布局：组内密接、无圆角，只有整组外框是圆角。
 *
 * 返回的每个 `ButtonBox` 与相邻按钮**共享边**（`x + width === next.x`），
 * 所以命中测试不需要留间隙。
 */
export function layoutGroup(specs: ButtonSpec[], options: GroupLayoutOptions): ButtonBox[] {
    const { x, y, height, cellWidth, gap = 0 } = options;
    const boxes: ButtonBox[] = [];
    let cursor = x;

    for (const spec of specs) {
        const width = cellWidth * (spec.span ?? 1);

        boxes.push({ id: spec.id, spec, x: cursor, y, width, height });
        cursor += width + gap;
    }

    return boxes;
}

/** 命中测试：传入画布坐标系里的点，返回按钮 id */
export function hitTest(boxes: ButtonBox[], x: number, y: number): string | null {
    for (const box of boxes) {
        if (box.spec.disabled) continue;
        if (x < box.x || y < box.y || x > box.x + box.width || y > box.y + box.height) continue;

        return box.id;
    }

    return null;
}

/**
 * 画一组排形按钮。
 *
 * 做法：先按整组外框裁一刀（`clip`），再逐格填色、画分隔线 —— 这样只有整组
 * 外框是圆角，组内各格是方角，正是设计稿要的形状。
 */
export function drawGroup(
    context: CanvasRenderingContext2D,
    boxes: ButtonBox[],
    palette: ButtonPalette,
    options: { radius?: number; fontSize?: number; font?: string } = {}
): void {
    if (boxes.length === 0) return;

    const radius = options.radius ?? 8;
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    const groupX = first.x;
    const groupY = first.y;
    const groupWidth = last.x + last.width - groupX;
    const groupHeight = first.height;

    context.save();

    // 整组底 + 外框
    roundRectPath(context, groupX, groupY, groupWidth, groupHeight, radius);
    context.fillStyle = palette.background;
    context.fill();

    // 组内：逐格填激活色，然后裁进整组形状里
    context.save();
    roundRectPath(context, groupX, groupY, groupWidth, groupHeight, radius);
    context.clip();

    for (const box of boxes) {
        if (box.spec.active) {
            context.fillStyle = palette.activeBackground;
            context.fillRect(box.x, box.y, box.width, box.height);
        }
    }

    context.restore();

    // 分隔线
    context.strokeStyle = palette.border;
    context.lineWidth = 1;

    for (let i = 1; i < boxes.length; i += 1) {
        const boundary = boxes[i].x;

        context.beginPath();
        context.moveTo(boundary + 0.5, groupY + 4);
        context.lineTo(boundary + 0.5, groupY + groupHeight - 4);
        context.stroke();
    }

    // 外框
    roundRectPath(context, groupX + 0.5, groupY + 0.5, groupWidth - 1, groupHeight - 1, radius);
    context.strokeStyle = palette.border;
    context.stroke();

    // 文字
    const fontSize = options.fontSize ?? Math.round(groupHeight * 0.44);

    context.font = `${fontSize}px ${options.font ?? "Phigros, sans-serif"}`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    for (const box of boxes) {
        context.fillStyle = box.spec.disabled
            ? palette.disabledForeground
            : box.spec.active
              ? palette.activeForeground
              : palette.foreground;

        context.fillText(box.spec.label, box.x + box.width / 2, box.y + box.height / 2);
    }

    context.restore();
}

/**
 * 单格按钮（不组队的时候用）：圆角矩形 + 文字。
 *
 * 和 `drawGroup` 的唯一区别是四角都圆，用于"具体的、独立的一个动作"
 * （比如事件编辑器里"返回总览"）。
 */
export function drawButton(
    context: CanvasRenderingContext2D,
    box: ButtonBox,
    palette: ButtonPalette,
    options: { radius?: number; fontSize?: number; font?: string } = {}
): void {
    const radius = options.radius ?? 8;

    context.save();

    roundRectPath(context, box.x, box.y, box.width, box.height, radius);
    context.fillStyle = box.spec.active ? palette.activeBackground : palette.background;
    context.fill();

    context.strokeStyle = palette.border;
    context.lineWidth = 1;
    context.stroke();

    const fontSize = options.fontSize ?? Math.round(box.height * 0.44);

    context.font = `${fontSize}px ${options.font ?? "Phigros, sans-serif"}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = box.spec.active ? palette.activeForeground : palette.foreground;
    context.fillText(box.spec.label, box.x + box.width / 2, box.y + box.height / 2);

    context.restore();
}
