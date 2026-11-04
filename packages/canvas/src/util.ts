import { Coordinate, type Matrix33 } from "kipphi-player";

export type StripReadonly<T> = {
    -readonly [P in keyof T]: T[P];
};

/**
 * 对于一个值，在一系列可吸附值上寻找最接近的值
 * @param sortedAttachable
 * @param value
 * @returns
 */
export const computeAttach = (sortedAttachable: number[], value: number) => {
    const len = sortedAttachable.length;
    if (len === 0) return value;
    if (value < sortedAttachable[0]) {
        return sortedAttachable[0];
    }
    for (let i = 0; i < len - 1; i++) {
        const cur = sortedAttachable[i];
        if (value === cur) {
            return cur;
        }
        const next = sortedAttachable[i + 1];
        if (value > cur && value < next) {
            return value - cur < next - value ? cur : next;
        }
    }
    // `>=` 不是 `>`：正好等于最后一个值时，循环里那个 `value < next` 走不到，
    // 用 `>` 会掉到函数末尾返回 undefined，调用方拿它算坐标就成了 NaN
    if (value >= sortedAttachable[len - 1]) {
        return sortedAttachable[len - 1];
    }
};
/**
 * 生成可吸附值
 * @param linear 一次函数的两个系数
 * @param range 显示范围
 */
export function generateAttachable(
    linear: [k: number, b: number],
    range: readonly [number, number],
) {
    const k = linear[0],
        b = linear[1];
    const left = range[0],
        right = range[1];
    if (k <= 1e-6) {
        return [left, b, right];
    }
    const startingX = Math.floor((left - b) / k);
    const attachable: number[] = [];
    for (let i = startingX; ; i++) {
        const val = k * i + b;
        attachable.push(k * i + b);
        if (val > right) break;
    }
    return attachable;
}

export function divideOrMul(gridSpan: number, maximum: number) {
    const m = Math.floor(maximum);
    if (m === 0) {
        const times = Math.floor(1 / maximum);
        return gridSpan * times;
    }
    if (isNaN(gridSpan) || isNaN(m)) {
        debugger;
    }
    if (!Number.isInteger(gridSpan)) {
        return gridSpan / m;
    } else {
        // 有的时候maximum莫名其妙整的特大，采取这种方式
        if (gridSpan < maximum) {
            return 1;
        }
        for (let i = m; i >= 1; i--) {
            if (gridSpan % i === 0) {
                return gridSpan / i;
            }
        }
        return gridSpan;
    }
}

/**
 *
 * 把同一个事件处理函数绑定到一个元素的多个事件类型上
 *
 * To assign the same handler for different event types on an element
 * @param eventTypes array of strings representing the types
 * @param element
 * @param handler
 */
export function on<K extends keyof HTMLElementEventMap>(
    eventTypes: K[],
    element: HTMLElement,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
) {
    for (let type of eventTypes) {
        element.addEventListener(type, handler);
    }
}

/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
export const getOffsetCoordFromEvent: (
    event: MouseEvent | TouchEvent,
    element: HTMLElement,
) => [number, number] = (
    event: MouseEvent | TouchEvent,
    element: HTMLElement,
) => {
    if (event instanceof MouseEvent) {
        return [event.offsetX, event.offsetY];
    } else {
        const [left, top] = getOffset(element); // 不是简单的offsetLeft，因为offsetLeft是相对于offsetParent的
        return [
            event.changedTouches[0].clientX - left,
            event.changedTouches[0].clientY - top,
        ];
    }
};

export const getCanvasCoordFromEvent = (
    event: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement,
    eleMatInv: Matrix33,
    canvasMatInv: Matrix33,
) => {
    const [x, y] = getOffsetCoordFromEvent(event, canvas);
    return new Coordinate(x, y).mul(eleMatInv).mul(canvasMatInv);
};

export const getOffset = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return [rect.left, rect.top];
};

/**
 * 获取一串数字的第？分位数
 */
export function getPercentile(sorted: number[], percentile: number): number {
    return sorted[Math.floor(sorted.length * percentile)];
}

/**
 *
 * @param context
 * @param startXY
 * @param endXY
 * @param cp1xy 控制点1（相对坐标）
 * @param cp2xy 控制点2（相对坐标）
 */
export function drawBezierCurve(
    context: CanvasRenderingContext2D,
    startXY: [number, number],
    endXY: [number, number],
    cp1xy: [number, number],
    cp2xy: [number, number],
) {
    context.beginPath();
    context.moveTo(startXY[0], startXY[1]);
    const deltaX = endXY[0] - startXY[0];
    const deltaY = endXY[1] - startXY[1];
    context.bezierCurveTo(
        startXY[0] + deltaX * cp1xy[0],
        startXY[1] + deltaY * cp1xy[1],
        startXY[0] + deltaX * cp2xy[0],
        startXY[1] + deltaY * cp2xy[1],
        endXY[0],
        endXY[1],
    );
    context.stroke();
}
