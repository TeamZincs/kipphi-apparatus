import { Coordinate, identity, Matrix33 } from "kipphi-player";
import { SelectionManager } from "./selectionManager";
import {
    drawBezierCurve,
    getCanvasCoordFromEvent,
    getOffsetCoordFromEvent,
    on,
} from "./util";
import { KPAEvent } from "./notesEditor";

const BEZIER_POINT_SIZE = 30;
const HALF_BEZIER_POINT_SIZE = BEZIER_POINT_SIZE / 2;
enum BezierEditorState {
    select,
    selectingStart,
    selectingEnd,
}

/** 编辑三次贝塞尔曲线 */
export class BezierEditor extends EventTarget {
    size = 300;
    context: CanvasRenderingContext2D;
    canvas = document.createElement("canvas");
    selectionManager = new SelectionManager<"start" | "end">();
    startPoint = new Coordinate(0, 0);
    endPoint = new Coordinate(1, 1);
    state = BezierEditorState.select;
    drawn = false;
    private observer: ResizeObserver;
    /** 挂载时给的回调，比 addEventListener 好处是「只留最后一个」 */
    private onChange: (() => void) | null = null;
    constructor() {
        super();
        this.canvas.width = this.canvas.height = this.size;
        this.context = this.canvas.getContext("2d");
        on(["mousedown", "touchstart"], this.canvas, (e) => {
            this.downHandler(e);
            this.update();
        });
        on(["mousemove", "touchmove"], this.canvas, (e) => {
            this.moveHandler(e);
            this.update();
        });
        on(["mouseup", "touchend", "mouseleave"], this.canvas, (e) => {
            this.upHandler(e);
            this.update();
        });
        this.observer = new ResizeObserver(() => {
            if (!this.canvas.isConnected) {
                return;
            }
            const width = this.canvas.parentElement.clientWidth;
            const ratio = width / this.size;
            this.elementMatrix = identity.scale(ratio, ratio);
            this.elementMatrixInverted = this.elementMatrix.invert();
        });
    }
    /**
     * 挂到某个容器上
     *
     * 这是个**单例**：每挂一次就 `observer.observe(容器)`，解挂时没人摘，
     * 于是 ResizeObserver 会一直攥着历次挂载过的容器（及其子树），元素再也回收不掉。
     * 所以这里先 {@linkcode removeFrom} 再挂 —— 重复挂载等于「搬家」，不会累积。
     *
     * @param onChange 值变了要通知谁。同样只保留最后一个，避免监听器在单例上越攒越多
     */
    addTo(element: HTMLElement, onChange?: () => void) {
        this.removeFrom();
        this.onChange = onChange ?? null;
        element.appendChild(this.canvas);
        this.observer.observe(element);
        const width = element.clientWidth;
        const ratio = width / this.size;
        this.elementMatrix = identity.scale(ratio, ratio);
        this.elementMatrixInverted = this.elementMatrix.invert();
    }

    /** 从容器上摘下来：断开观察、丢掉回调、把画布移出 DOM */
    removeFrom() {
        this.observer.disconnect();
        this.onChange = null;
        this.canvas.remove();
    }
    update() {
        this.updateMatrix();
        this.selectionManager.refresh();
        const { context, size, startPoint, endPoint, selectionManager } = this;
        const { x: sx, y: sy } = startPoint.mul(this.matrix);
        const { x: ex, y: ey } = endPoint.mul(this.matrix);
        context.fillStyle = "#222";
        context.fillRect(0, 0, size, size);

        context.fillStyle = "#EEE";
        context.font = "36px Phigros";
        context.fillText(
            `${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)}`,
            20,
            60,
        );
        context.fillText(
            `${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)}`,
            20,
            90,
        );
        context.fillText(BezierEditorState[this.state], 20, 120);

        context.strokeStyle = "#EE7";
        context.lineWidth = 5;
        drawBezierCurve(
            context,
            [0, size],
            [size, 0],
            [startPoint.x, startPoint.y],
            [endPoint.x, endPoint.y],
        );
        /*
         * 控制点画成圆球 + 到锚点的连线，不再用贴图按钮：
         * 蓝色是控制点 1（对应左下角 (0,0)），红色是控制点 2（右上角 (1,1)）。
         * 连线用同色半透明，既表明"从哪个角拉出来的"，又不抢曲线的视觉。
         */
        const radius = HALF_BEZIER_POINT_SIZE - 3;

        context.lineWidth = 2;

        context.strokeStyle = "rgba(76, 141, 255, 0.5)";
        context.beginPath();
        context.moveTo(0, size);
        context.lineTo(sx, sy);
        context.stroke();

        context.strokeStyle = "rgba(242, 84, 91, 0.5)";
        context.beginPath();
        context.moveTo(size, 0);
        context.lineTo(ex, ey);
        context.stroke();

        const ball = (x: number, y: number, color: string): void => {
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();

            // 一圈浅描边，深色背景上边缘更清楚，也方便看清压在哪里
            context.lineWidth = 2;
            context.strokeStyle = "rgba(255, 255, 255, 0.85)";
            context.stroke();
        };

        ball(sx, sy, "#4c8dff");
        ball(ex, ey, "#f2545b");
        selectionManager.add({
            centerX: sx,
            centerY: sy,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 1,
            target: "start",
        });
        selectionManager.add({
            centerX: ex,
            centerY: ey,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 0,
            target: "end",
        });
    }
    updateMatrix() {
        const size = this.size;
        this.matrix = identity.translate(0, size).scale(size, -size);
        this.matrixInverted = this.matrix.invert();
    }
    downHandler(event: MouseEvent | TouchEvent) {
        const { x, y } = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            identity,
        );
        const tar = this.selectionManager.click(x, y);
        if (!tar) {
            return;
        }
        if (tar.target === "start") {
            this.state = BezierEditorState.selectingStart;
        } else if (tar.target === "end") {
            this.state = BezierEditorState.selectingEnd;
        }
    }
    moveHandler(event: MouseEvent | TouchEvent) {
        if (this.state === BezierEditorState.select) {
            return;
        }
        const canvasCoord = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            identity,
        );
        const coord = canvasCoord.mul(this.matrixInverted);
        if (this.state === BezierEditorState.selectingStart) {
            this.startPoint = coord;
        } else if (this.state === BezierEditorState.selectingEnd) {
            this.endPoint = coord;
        }
    }
    upHandler(event: TouchEvent | MouseEvent) {
        if (
            this.state === BezierEditorState.selectingStart ||
            this.state === BezierEditorState.selectingEnd
        ) {
            this.dispatchEvent(new KPAEvent("change"));
            this.onChange?.();
        }
        this.state = BezierEditorState.select;
    }
    override addEventListener(
        type: "change",
        listener: (e: KPAEvent) => void,
        options?: EventListenerOptions,
    ): void {
        super.addEventListener(type, listener, options);
    }
    getValue() {
        return [
            this.startPoint.x,
            this.startPoint.y,
            this.endPoint.x,
            this.endPoint.y,
        ] as [number, number, number, number];
    }
    setValue(cp1x: number, cp1y: number, cp2x: number, cp2y: number) {
        this.startPoint = new Coordinate(cp1x, cp1y);
        this.endPoint = new Coordinate(cp2x, cp2y);
        this.update();
    }

    private matrix: Matrix33;
    private matrixInverted: Matrix33;
    // 这个编辑器没有canvasMatrix
    private elementMatrix: Matrix33;
    private elementMatrixInverted: Matrix33;
}
