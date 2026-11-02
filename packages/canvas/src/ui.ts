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

// 只按需导入用到的图标（不要 `import { icons }` 整表：包体大，而且新增依赖
// 期间 dev server 没预打包时容易连带整条 import 链失败）
import {
    ChevronLeft,
    ChevronRight,
    Grab,
    Hand,
    Info,
    Lock,
    LockOpen,
    Pencil,
    Redo2,
    Replace,
    Scan,
    SquareDashed,
    SquaresSubtract,
    SquaresUnite,
    Undo2,
    ZoomIn,
    ZoomOut
} from "lucide";

/** lucide 的图标节点：`[['path', { d: '…' }], …]` */
type IconNode = ReadonlyArray<readonly [string, Record<string, string | number>]>;

/** 图标名 -> 节点表（具名导入的产物） */
const ICON_NODES: Record<string, IconNode> = {
    Hand,
    Grab,
    Pencil,
    SquareDashed,
    Scan,
    Info,
    Lock,
    LockOpen,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    // 集合运算：替换 / 并集 / 补充
    Replace,
    SquaresUnite,
    SquaresSubtract
} as unknown as Record<string, IconNode>;

/** 语义名字 -> lucide 图标名。换图标只改这里。 */
export const ICONS = {
    select: "Hand",
    selecting: "Grab",
    edit: "Pencil",
    selectScope: "SquareDashed",
    selectingScope: "Scan",
    info: "Info",
    lock: "Lock",
    unlock: "LockOpen",
    undo: "Undo2",
    redo: "Redo2",
    zoomIn: "ZoomIn",
    zoomOut: "ZoomOut",
    previousLine: "ChevronLeft",
    nextLine: "ChevronRight",
    /** 范围选择：替换 / 并集 / 补集 */
    scopeReplace: "Replace",
    scopeAdd: "SquaresUnite",
    scopeSub: "SquaresSubtract"
} as const;

export type IconName = keyof typeof ICONS;

/** 图标节点 -> Path2D（按 24×24 的 viewBox 建，绘制时再缩放） */
const iconPathCache = new Map<string, Path2D>();

function pathOf(name: IconName): Path2D {
    const cached = iconPathCache.get(name);

    if (cached) return cached;

    const lucideName = ICONS[name];
    const nodes: IconNode = ICON_NODES[lucideName] ?? [];
    const path = new Path2D();

    for (const [tag, attributes] of nodes) {
        const number = (key: string) => Number(attributes[key] ?? 0);

        switch (tag) {
            case "path":
                path.addPath(new Path2D(String(attributes.d ?? "")));
                break;
            case "circle":
                path.moveTo(number("cx") + number("r"), number("cy"));
                path.arc(number("cx"), number("cy"), number("r"), 0, Math.PI * 2);
                break;
            case "ellipse":
                path.moveTo(number("cx") + number("rx"), number("cy"));
                path.ellipse(number("cx"), number("cy"), number("rx"), number("ry"), 0, 0, Math.PI * 2);
                break;
            case "line":
                path.moveTo(number("x1"), number("y1"));
                path.lineTo(number("x2"), number("y2"));
                break;
            case "rect":
                path.rect(number("x"), number("y"), number("width"), number("height"));
                break;
            case "polyline":
            case "polygon": {
                const points = String(attributes.points ?? "")
                    .split(/[\s,]+/)
                    .filter(Boolean)
                    .map(Number);

                for (let i = 0; i < points.length; i += 2) {
                    if (i === 0) path.moveTo(points[0], points[1]);
                    else path.lineTo(points[i], points[i + 1]);
                }

                if (tag === "polygon") path.closePath();

                break;
            }
            default:
                break;
        }
    }

    iconPathCache.set(name, path);

    return path;
}

/**
 * 画一个图标，居中于 (cx, cy)。
 *
 * lucide 的图标都是 24×24、线宽 2 的描边图，这里按 size/24 缩放后描边，
 * 所以放大到 32px 也不会糊（矢量路径，不是位图）。
 */
export function drawIcon(
    context: CanvasRenderingContext2D,
    name: IconName,
    cx: number,
    cy: number,
    size: number,
    color: string,
    strokeWidth = 2
): void {
    const path = pathOf(name);
    const scale = size / 24;

    context.save();
    context.translate(cx - size / 2, cy - size / 2);
    context.scale(scale, scale);
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke(path);
    context.restore();
}

/** 设计基准宽度：原版所有字号都是按 600 宽的画布定的 */
export const DESIGN_WIDTH = 600;

/** 缩到最小也不低于这个字号（再小就读不清了） */
const MIN_FONT = 9;

/**
 * 按画布逻辑宽度等比缩放字号，**取整**。
 *
 * - 宽 >= 600 时原样返回 `base`（桌面端就是 600，字号固定为设计值）；
 * - 窄屏按 `width / 600` 缩小，但不会低于 9px。
 *
 * 之所以不用"几档"：档位在 360~480 这一段会有明显的跳变，反而更别扭；
 * 等比缩放读起来连贯，取整则避免半像素发虚。
 */
export function scaleFont(base: number, width: number): number {
    if (width >= DESIGN_WIDTH) return Math.round(base);

    return Math.max(MIN_FONT, Math.round((base * width) / DESIGN_WIDTH));
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
    /** 按钮上显示的东西（文字；有 `icon` 时不画它） */
    label: string;
    /** 用 lucide 图标代替文字 */
    icon?: IconName;
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
        const color = box.spec.disabled
            ? palette.disabledForeground
            : box.spec.active
              ? palette.activeForeground
              : palette.foreground;

        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        if (box.spec.icon) {
            const size = Math.min(box.height * 0.56, box.width * 0.56);

            drawIcon(context, box.spec.icon, centerX, centerY, size, color);

            continue;
        }

        context.fillStyle = color;
        context.fillText(box.spec.label, centerX, centerY);
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
    const color = box.spec.disabled
        ? palette.disabledForeground
        : box.spec.active
          ? palette.activeForeground
          : palette.foreground;

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    if (box.spec.icon) {
        const size = Math.min(box.height * 0.56, box.width * 0.56);

        drawIcon(context, box.spec.icon, centerX, centerY, size, color);
    } else {
        context.fillStyle = color;
        context.fillText(box.spec.label, centerX, centerY);
    }

    context.restore();
}
