import { Coordinate, identity, Images, Matrix33 } from "kipphi-player";
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
    addTo(element: HTMLElement) {
        element.appendChild(this.canvas);
        this.observer.observe(element);
        const width = element.clientWidth;
        const ratio = width / this.size;
        this.elementMatrix = identity.scale(ratio, ratio);
        this.elementMatrixInverted = this.elementMatrix.invert();
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
        context.drawImage(
            Images.START_NODE,
            sx - HALF_BEZIER_POINT_SIZE,
            sy - HALF_BEZIER_POINT_SIZE,
            BEZIER_POINT_SIZE,
            BEZIER_POINT_SIZE,
        );
        context.drawImage(
            Images.END_NODE,
            ex - HALF_BEZIER_POINT_SIZE,
            ey - HALF_BEZIER_POINT_SIZE,
            BEZIER_POINT_SIZE,
            BEZIER_POINT_SIZE,
        );
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
