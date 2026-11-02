import {
    Coordinate,
    drawLine,
    identity,
    Images,
    Matrix33,
    rgb,
} from "kipphi-player";
import { KPAEvent, SelectState, type LTWH } from "./notesEditor";
import {
    BezierEasing,
    BPMEndNode,
    BPMStartNode,
    ColorEasedEvaluator,
    EasedEvaluator,
    Easing,
    EffectNodeSequence,
    EventEndNode,
    EventNode,
    EventNodeLike,
    EventNodeSequence,
    EventStartNode,
    EventType,
    EventValueType,
    ExpressionEvaluator,
    fixedEasing,
    JudgeLine,
    linearEasing,
    MacroEvaluator,
    NodeType,
    NormalEasing,
    Op as O,
    TC,
    TemplateEasing,
    type EventValueESType,
    type EventValueTypeOfType,
    type NonLastStartNode,
    type RGB,
    type SpeedENS,
    type TimeT,
} from "kipphi";
import { SelectionManager } from "./selectionManager";
import {
    drawBezierCurve,
    getCanvasCoordFromEvent,
    getPercentile,
    on,
    type StripReadonly,
} from "./util";
import { messages } from "./messages";
import { rgb2hex } from "kipphi";

class KPANodeSelectedEvent extends KPAEvent {
    constructor(
        public node:
            EventStartNode<EventValueESType> | EventEndNode<EventValueESType>,
    ) {
        super("nodeselected");
    }
}
class KPANodeScopeselectedEvent extends KPAEvent {
    constructor(public nodes: Set<EventStartNode<EventValueESType>>) {
        super("nodescopeselected");
    }
}

class KPABPMAffectedEvent extends KPAEvent {
    constructor() {
        super("bpmaffected");
    }
}

class KPALayerChangeEvent extends KPAEvent {
    constructor(public readonly layer: LayerID) {
        super("layerchange");
    }
}

class KPAEventTypeChangeEvent extends KPAEvent {
    constructor(public readonly eventType: EventTypeName | "general") {
        super("eventtypechange");
    }
}

interface KPANodeEventMap {
    nodeselected: KPANodeSelectedEvent;
    nodescopeselected: KPANodeScopeselectedEvent;
    layerchange: KPALayerChangeEvent;
    eventtypechange: KPAEventTypeChangeEvent;
}

const COLOR_INTERPOLATION_STEP = 0.05;
const COLOR_INTERPOLATION_MAX_STOPS = 20;

const eventTypeMap = [
    {
        // moveX
        valueGridSpan: 135,
        valueRange: [-675, 675],
    },
    {
        // moveY
        valueGridSpan: 180,
        valueRange: [-450, 450],
    },
    {
        // rotate
        valueGridSpan: 90,
        valueRange: [-360, 360],
    },
    {
        // alpha
        valueGridSpan: 17,
        valueRange: [0, 255],
    },
    {
        // speed
        valueGridSpan: 2,
        valueRange: [-5, 15],
    },
    {
        // easing
        valueGridSpan: 270,
        valueRange: [-675, 675],
    },
    {
        // bpm
        valueGridSpan: 40,
        valueRange: [0, 400],
    },
    {
        // scaleX
        valueGridSpan: 1,
        valueRange: [-5, 5],
    },
    {
        // scaleY
        valueGridSpan: 1,
        valueRange: [-5, 5],
    },
    null, // text
    null, // color
    null, // video
    {
        // videoAlpha
        valueGridSpan: 0.05,
        valueRange: [0, 1],
    },
    {
        // videoDim
        valueGridSpan: 0.05,
        valueRange: [0, 1],
    },
] satisfies { valueGridSpan: number; valueRange: [number, number] }[];

type EventTypeName =
    | "moveX"
    | "moveY"
    | "alpha"
    | "rotate"
    | "speed"
    | "easing"
    | "bpm"
    | "scaleX"
    | "scaleY"
    | "text"
    | "color";
type ExtendedEventTypeName = "scaleX" | "scaleY" | "text" | "color";

export enum NewNodeState {
    controlsStart,
    controlsEnd,
    controlsBoth,
}

const eventTypeKeys = [
    "moveX",
    "moveY",
    "alpha",
    "rotate",
    "speed",
    "easing",
    "bpm",
    "scaleX",
    "scaleY",
    "text",
    "color",
    "videoAlpha",
    "videoDim",
] as const;
const normalTypes = [
    "moveX",
    "moveY",
    "alpha",
    "rotate",
    "speed",
    "easing",
    "bpm",
] as const;
const extendedTypes = ["scaleX", "scaleY", "text", "color"] as const;
const numericEventTypeKeys = [
    "moveX",
    "moveY",
    "alpha",
    "rotate",
    "speed",
    "easing",
    "bpm",
    "scaleX",
    "scaleY",
    "videoAlpha",
    "videoDim",
] as const;

type ChangeTargetOptions = { judgeLine?: JudgeLine; layerID?: LayerID };

const ALL = 255;

type LayerID = "0" | "1" | "2" | "3" | "ex" | "glb" | "eff";

/**
 * @example
 * 
 * 
    eventSequenceEditors = new EventSequenceEditors(
        eventSequenceEditorCanvas,
        [0, 0, 600, 900],
        operationList
    );
    eventSequenceEditors.changeTarget({ judgeLine: chart.judgeLines[0] });
    // 注意这句，不然容易出错
 */
export class EventSequenceEditors extends EventTarget {
    selectState: SelectState;
    timeDivisor: number = 4;

    readonly moveX: NumericEventCurveEditor;
    readonly moveY: NumericEventCurveEditor;
    readonly alpha: NumericEventCurveEditor;
    readonly rotate: NumericEventCurveEditor;
    readonly speed: NumericEventCurveEditor;
    readonly easing: NumericEventCurveEditor;

    readonly text: TextEventSequenceEditor;
    readonly color: ColorEventSequenceEditor;

    readonly scaleX: NumericEventCurveEditor;
    readonly scaleY: NumericEventCurveEditor;

    readonly video: TextEventSequenceEditor;
    readonly videoAlpha: NumericEventCurveEditor;
    readonly videoDim: NumericEventCurveEditor;
    readonly bpm: NumericEventCurveEditor;

    readonly general: GeneralEventSequencesEditor;

    /** `eff` 层点进来的临时目标：着色器名序列 */
    readonly effectShader: TextEventSequenceEditor;
    /** `eff` 层点进来的临时目标：某个 uniform 变量序列 */
    readonly effectVar: NumericEventCurveEditor;

    lastBeats: number;
    easingBeats: number = 0;

    useEasing: Easing = linearEasing;

    constructor(
        public canvas: HTMLCanvasElement,
        public clippingRect: LTWH,
        public readonly operationList: O.OperationList,
        timeBasis: number,
    ) {
        super();
        this.init(timeBasis || 0);
    }
    init(timeBasis = 0) {
        for (const type of numericEventTypeKeys) {
            (this as StripReadonly<this>)[type] = new NumericEventCurveEditor(
                EventType[type],
                this.canvas,
                this.clippingRect,
                this.operationList,
                this,
            );
            this[type].active = false;
            this[type].timeBasis = timeBasis;
        }
        (this as StripReadonly<this>).text = new TextEventSequenceEditor(
            EventType.text,
            this.canvas,
            this.clippingRect,
            this.operationList,
            this,
        );
        (this as StripReadonly<this>).color = new ColorEventSequenceEditor(
            EventType.color,
            this.canvas,
            this.clippingRect,
            this.operationList,
            this,
        );
        (this as StripReadonly<this>).video = new TextEventSequenceEditor(
            EventType.video,
            this.canvas,
            this.clippingRect,
            this.operationList,
            this,
        );
        this.text.timeBasis = timeBasis;
        this.color.timeBasis = timeBasis;
        this.bpm.target = this.operationList.chart.timeCalculator.bpmSequence; // 这个不会变
        this.video.timeBasis = timeBasis;
        const videoChannel = this.operationList.chart.video;
        this.video.target = videoChannel.name;
        this.videoAlpha.target = videoChannel.alpha;
        this.videoDim.target = videoChannel.dim;

        (this as StripReadonly<this>).general = new GeneralEventSequencesEditor(
            this.canvas,
            this.clippingRect,
            this.operationList,
            this,
        );
        this.general.timeBasis = timeBasis;

        // eff 层的两个临时编辑器：点哪条就把它绑到哪条序列上。
        // type 只是给取值轴定个默认标度，不做 createTarget（target 一定由外面给上）
        (this as StripReadonly<this>).effectShader =
            new TextEventSequenceEditor(
                EventType.text,
                this.canvas,
                this.clippingRect,
                this.operationList,
                this,
            );
        (this as StripReadonly<this>).effectVar = new NumericEventCurveEditor(
            EventType.speed,
            this.canvas,
            this.clippingRect,
            this.operationList,
            this,
        );
        this.effectShader.active = false;
        this.effectVar.active = false;
        this.effectShader.timeBasis = timeBasis;
        this.effectVar.timeBasis = timeBasis;

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            this.activatedEditor.moveHandler(event);
            this.draw();
        });
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.activatedEditor.downHandler(event);
            this.draw();
        });
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.activatedEditor.upHandler(event);
            this.draw();
        });
        /*
        this.text = new TextEventSequenceEditor(this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
        this.text.active = false;
        this.color = new ColorEventSequenceEditor(this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
        this.color.active = false;
        */
        this.activatedEditor = this.general;
        this.general.active = true;
    }
    _selectedEditor: EventSequenceEditorBase;
    get activatedEditor() {
        return this._selectedEditor;
    }
    set activatedEditor(val) {
        if (val === this._selectedEditor) return;
        if (this._selectedEditor) this._selectedEditor.active = false;
        this._selectedEditor = val;
        val.active = true;
        this.draw();
    }
    selectedLayer: LayerID = "0";
    draw(beats?: number) {
        beats = beats || this.lastBeats;
        this.lastBeats = beats;
        //console.log("draw")
        if (this.activatedEditor === this.easing) {
            this.easing.draw(this.easingBeats);
        } else {
            this.activatedEditor.draw(beats);
        }
    }
    targetLine: JudgeLine;
    changeTarget(options: ChangeTargetOptions) {
        const chart = this.operationList.chart;
        const targetLine = options.judgeLine ?? this.targetLine;
        const targetLayer = options.layerID ?? this.selectedLayer;
        // 速度
        this.speed.targetLine = targetLine;
        this.speed.target = targetLine.speedSequence ??=
            chart.createEventNodeSequence(
                EventType.speed,
                `#${targetLine.id}.speed`,
            ) as SpeedENS;

        const oldTargetLine = this.targetLine;
        const oldSelectedLayer = this.selectedLayer;

        this.targetLine = targetLine;
        this.selectedLayer = targetLayer;
        this.general.targetLine = targetLine;
        this.general.layer = targetLayer;

        const layerType = (layerId: LayerID) => {
            return layerId === "glb" ? 2 : layerId === "ex" ? 1 : 0;
        };

        if (targetLayer === "ex") {
            // 缩放
            (["scaleX", "scaleY"] as const).forEach((type) => {
                const seq = this[type];
                seq.targetLine = targetLine;
                seq.target = targetLine.extendedLayer[type] ??=
                    chart.createEventNodeSequence(
                        EventType[type],
                        `#${targetLine.id}.ex.${type}`,
                    );
                // Kipphi 2.x谱面中所有判定线都默认带有缩放序列，但为了兼容性，保留这句。
                // 理论上不需要，因为创建谱面的时候已经补上了这两个序列
            });

            // 文本
            this.text.targetLine = targetLine;
            this.text.target = targetLine.extendedLayer.text;
            // 这里不要检测不存在创建，因为可能并不需要这么一个序列，而前面几种序列是刚需
            // 颜色事件
            this.color.targetLine = targetLine;
            this.color.target = targetLine.extendedLayer.color;
            // 颜色事件也是，并非刚需
        } else if (targetLayer !== "glb" && targetLayer !== "eff") {
            // 全局层、特效层没有目标判定线

            // 前四个类型
            (["moveX", "moveY", "alpha", "rotate"] as const).forEach((type) => {
                const seq = this[type];
                seq.targetLine = targetLine;
                const layer = (targetLine.eventLayers[targetLayer] ??= {});
                seq.target = layer[type];
                // 这里不要创建序列，因为可能不需要序列
            });
        }

        if (layerType(targetLayer) !== layerType(oldSelectedLayer)) {
            this.changeTypeActively("general");
        }

        //*/

        this.draw();
    }

    public buffer: string[] = [];
    notify(str: string) {
        this.buffer.push(str);
    }

    addEventListenerForAll<T extends keyof KPANodeEventMap>(
        type: T,
        listener: (event: KPANodeEventMap[T]) => void,
        options?: EventListenerOptions,
    ): void {
        for (const editor of [
            this.moveX,
            this.moveY,
            this.alpha,
            this.rotate,
            this.speed,
            this.easing,
            this.bpm,
            this.text,
            this.color,
            this.scaleX,
            this.scaleY,
            this.video,
            this.videoAlpha,
            this.videoDim,
        ]) {
            editor.addEventListener(type, listener, options);
        }
    }
    returnToGeneralActively() {
        this.changeTypeActively("general");
    }
    changeLayerActively(layer: LayerID) {
        this.changeTarget({ layerID: layer });
        this.dispatchEvent(new KPALayerChangeEvent(layer));
    }
    /** 从 eff 概览点进某条序列：把它绑到对应的临时编辑器上 */
    changeEffectActively(
        sequence: EventNodeSequence<any>,
        kind: "shader" | "var",
    ) {
        const editor = kind === "shader" ? this.effectShader : this.effectVar;
        const target = editor as unknown as EventSequenceEditor<any>;
        target.targetLine =
            this.targetLine ?? this.operationList.chart.judgeLines[0];
        target.target = sequence;
        this.activatedEditor = editor;
    }

    changeTypeActively(type: EventTypeName | "general") {
        const editor = this[type] as EventSequenceEditorBase | undefined;
        // 没有对应编辑器就什么都别做：概览里点到的可能只是条只读条带，
        // 赋成 undefined 之后下一次 mousemove 就会炸在 activatedEditor 上
        if (!editor) return;
        this.activatedEditor = editor;

        this.dispatchEvent(new KPAEventTypeChangeEvent(type));
    }
    override addEventListener<T extends keyof KPANodeEventMap>(
        type: T,
        callback: (event: KPANodeEventMap[T]) => void,
    ): void {
        super.addEventListener(type, callback);
    }
}

export enum EventCurveEditorState {
    select,
    selecting,
    edit,
    flowing,
    selectScope,
    selectingScope,
}

const lengthOf = (range: readonly [number, number]) => range[1] - range[0];
const medianOf = (range: readonly [number, number]) =>
    (range[0] + range[1]) / 2;
const percentileOf = (range: readonly [number, number], percent: number) =>
    range[0] + lengthOf(range) * percent;
/**
 * 对于一个值，在一系列可吸附值上寻找最接近的值
 * @param sortedAttachable
 * @param value
 * @returns
 */
const computeAttach = (sortedAttachable: number[], value: number) => {
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
    if (value > sortedAttachable[len - 1]) {
        return sortedAttachable[len - 1];
    }
};
/**
 * 生成可吸附值
 * @param linear 一次函数的两个系数
 * @param range 显示范围
 */
function generateAttachable(
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

function divideOrMul(gridSpan: number, maximum: number) {
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

export abstract class EventSequenceEditorBase extends EventTarget {
    targetLine: JudgeLine;

    innerHeight: number;
    innerWidth: number;

    readonly context: CanvasRenderingContext2D;
    timeRatio: number;

    timeSpan: number;
    timeGridInterval: number;
    /** [-0.5, 0.5] */
    timeBasis: number = 0;

    timeGridColor = "rgb(120, 255, 170)";

    padding: number;

    active = false;

    constructor(
        public readonly type: EventType | 255,

        public readonly canvas: HTMLCanvasElement,
        public clippingRect: LTWH,
        public readonly operationList: O.OperationList,
        public readonly parentEditorSet: EventSequenceEditors,
    ) {
        super();

        this.selectionManager = new SelectionManager();

        this.padding = 14;
        this.innerHeight = clippingRect[3] - this.padding * 2;
        this.innerWidth = clippingRect[2] - this.padding * 2;

        this.elementMatrix = identity.scale(
            this.canvas.clientWidth / this.canvas.width,
            this.canvas.clientHeight / this.canvas.height,
        );
        this.elementMatrixInverted = this.elementMatrix.invert();

        const resizeObserver = new ResizeObserver(() => {
            this.elementMatrix = identity.scale(
                this.canvas.clientWidth / this.canvas.width,
                this.canvas.clientHeight / this.canvas.height,
            );
            this.elementMatrixInverted = this.elementMatrix.invert();
        });
        resizeObserver.observe(this.canvas);

        this.context = this.canvas.getContext("2d");
        this.context.font = "30px Phigros";

        this.timeSpan = 4;
        this.timeRatio = this.innerHeight / this.timeSpan;
        this.timeGridInterval = 1;
        this.initContext();

        // 下面有一堆监听器
        // #region

        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        // #endregion
    }
    override addEventListener<T extends keyof KPANodeEventMap>(
        type: T,
        listener: (event: KPANodeEventMap[T]) => void,
        options?: EventListenerOptions,
    ): void {
        super.addEventListener(type, listener, options);
    }

    updateMatrix() {
        this.canvasMatrix = Matrix33.fromDOMMatrix(this.context.getTransform());
        this.canvasMatrixInverted = this.canvasMatrix.invert();
    }
    abstract moveHandler(event: MouseEvent | TouchEvent): void;
    abstract downHandler(event: MouseEvent | TouchEvent): void;
    abstract upHandler(event: MouseEvent | TouchEvent): void;

    initContext() {
        const centerX = this.clippingRect[0] + this.clippingRect[2] / 2;
        const centerY = this.clippingRect[1] + this.clippingRect[3] / 2;
        this.context.setTransform(1, 0, 0, 1, centerX, centerY);
        // a c e
        // b d f
        this.context.strokeStyle = "#EEE";
        this.context.fillStyle = "#333";
        this.context.lineWidth = 2;
    }
    drawCoordination(beats: number) {
        const [boundLeft, boundTop, boundWidth, boundHeight] =
            this.clippingRect;
        const { innerHeight, innerWidth } = this;
        const {
            timeGridInterval: timeGridSpan,
            timeRatio,
            context,
            timeBasis,
        } = this;

        const timeDivisor = this.parentEditorSet.timeDivisor;
        context.clearRect(
            -boundWidth / 2,
            -boundHeight / 2,
            boundWidth,
            boundHeight,
        );
        context.fillStyle = "#333d";
        context.fillRect(
            -boundWidth / 2,
            -boundHeight / 2,
            boundWidth,
            boundHeight,
        );
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        // const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        // 画布上的状态文字（State / Beats / Selected …）已移到工具栏按钮里
        context.save();
        context.strokeStyle = this.timeGridColor;
        context.fillStyle = this.timeGridColor;

        context.lineWidth = 3;

        const yZero = innerHeight * timeBasis;
        const stopBeats =
            Math.ceil(
                (beats + this.timeSpan * (0.5 + timeBasis)) / timeGridSpan,
            ) * timeGridSpan;
        const startBeats =
            Math.ceil(
                (beats + this.timeSpan * (-0.5 + timeBasis)) / timeGridSpan - 1,
            ) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats) * timeRatio - yZero;
            drawLine(
                context,
                innerWidth / 2,
                -positionY,
                -innerWidth / 2,
                -positionY,
            );
            context.fillText(time + "", -innerWidth / 2 + 10, -positionY);

            context.save();
            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosY =
                    (time + i / timeDivisor - beats) * timeRatio - yZero;
                drawLine(
                    context,
                    innerWidth / 2,
                    -minorPosY,
                    -innerWidth / 2,
                    -minorPosY,
                );
            }
            context.restore();
        }
        context.restore();
        context.lineWidth = 3;
        drawLine(context, innerWidth / 2, yZero, -innerWidth / 2, yZero);
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        const { context, selectionManager } = this;
        selectionManager.refresh();
        this.drawCoordination(beats);

        this.lastBeats = beats;
    }

    protected notify(message: string) {
        this.parentEditorSet.notify(message);
    }
    // begin 以下朝生夕死，不配置不可读的状态。如果你觉得哪个应该是可读的，请提issue拷打杨哲思
    protected selectionManager: SelectionManager<any>;
    protected canvasPoint: Coordinate;
    // private pointedValue: number; 这个不能用，在子类里面才声明它

    /** 从f64（TC.toBeats(time)）到TimeT的映射 ECE暂时没这东西，NE才有
    private timeMap: Map<number, TimeT> = new Map();*/
    protected pointedTime: TimeT;
    protected drawn: boolean;

    protected canvasMatrix: Matrix33;
    protected canvasMatrixInverted: Matrix33;
    // end 朝生夕死

    // begin 这些也是内部使用，但是活得久（可能）
    /** 上次渲染时的拍数 */
    public lastBeats: number;
    protected mouseIn: boolean;

    /** 画布坐标系到元素坐标系的映射，大小改变自动更新 */
    protected elementMatrix: Matrix33;
    /** 元素坐标系到画布坐标系的映射，大小改变自动更新 */
    protected elementMatrixInverted: Matrix33;
    // end
}

export class GeneralEventSequencesEditor extends EventSequenceEditorBase {
    layer: "0" | "1" | "2" | "3" | "ex" | "glb" | "eff" = "0";
    layerButtons: Path2D[] = [];
    /** `eff` 层右侧那排「看第几 line」的按钮（窗口最多 5 个） */
    effectLineButtons: Path2D[] = [];
    /** 上面那排下面的「+」，加一条新的特效序列 */
    effectAddButton: Path2D | null = null;
    /** 当前看的是 `chart.effects` 里的第几条 */
    effectLine = 0;

    /** 右侧一屏放几个 line 按钮 */
    static readonly EFFECT_LINE_SLOTS = 5;
    /** 两个特效段的时间差小于这个拍数就算「紧邻」，变量要错开列 */
    static readonly EFFECT_ADJACENT_BEATS = 1;

    constructor(
        canvas: HTMLCanvasElement,
        clippingRect: LTWH,
        operationList: O.OperationList,
        parent: EventSequenceEditors,
    ) {
        super(255, canvas, clippingRect, operationList, parent);
        this.targetLine = operationList.chart.judgeLines[0];
        const button = (x: number, y: number) => {
            const path = new Path2D();
            path.roundRect(x, y, 40, 40, 5);

            return path;
        };
        const left = -0.475 * this.innerWidth;
        // 0 / 1 / 2 / 3 / ex / glb / eff
        for (let i = 0; i < 7; i++) {
            this.layerButtons.push(button(left, -0.475 * this.innerHeight + 45 * i));
        }
        // 右侧和左下第一个按钮同一行起，纵向一列
        const right = 0.475 * this.innerWidth - 40;
        for (let i = 0; i < GeneralEventSequencesEditor.EFFECT_LINE_SLOTS; i++) {
            this.effectLineButtons.push(button(right, -0.475 * this.innerHeight + 45 * i));
        }
        this.effectAddButton = button(
            right,
            -0.475 * this.innerHeight + 45 * GeneralEventSequencesEditor.EFFECT_LINE_SLOTS,
        );
    }
    override draw(beats: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        const { context, selectionManager, innerWidth, innerHeight } = this;
        selectionManager.refresh();
        this.drawCoordination(beats);
        context.save();
        context.textAlign = "center";
        context.font = "20px Phigros";
        const startBeats = beats - this.timeSpan * (0.5 + this.timeBasis);
        const endBeats = beats + this.timeSpan * (0.5 + this.timeBasis);

        const unit = this.innerWidth / 7;
        const layer = this.layer;

        if (layer === "eff") {
            this.drawEffectVars(beats, startBeats, endBeats);
        } else if (layer === "ex") {
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "scaleX",
                this.targetLine.extendedLayer.scaleX,
                -2 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "scaleY",
                this.targetLine.extendedLayer.scaleY,
                -1 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "color",
                this.targetLine.extendedLayer.color,
                0 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "text",
                this.targetLine.extendedLayer.text,
                1 * unit,
            );
        } else if (layer == "glb") {
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "bpm",
                this.operationList.chart.timeCalculator.bpmSequence,
                -2 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "video",
                this.operationList.chart.video.name,
                0 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "videoAlpha",
                this.operationList.chart.video.alpha,
                1 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "videoDim",
                this.operationList.chart.video.dim,
                2 * unit,
            );
        } else {
            if (!this.targetLine.eventLayers[layer]) {
                return;
            }
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "moveX",
                this.targetLine.eventLayers[layer].moveX,
                -2 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "moveY",
                this.targetLine.eventLayers[layer].moveY,
                -1 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "rotate",
                this.targetLine.eventLayers[layer].rotate,
                0 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "alpha",
                this.targetLine.eventLayers[layer].alpha,
                1 * unit,
            );
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                "speed",
                this.targetLine.speedSequence,
                3 * unit,
            );
        }

        const createButton = (i: number, text: string) => {
            const path = this.layerButtons[i];
            context.fillStyle = text === this.layer ? "#DDD" : "#DDD7";
            context.fill(path);
            context.fillStyle = "#222";
            // 基线必须显式给：上面画序列时留下的基线各不相同，
            // 漏了就会整排文字上下错位（eff 层没画序列时就会浮起来）
            context.textBaseline = "top";
            context.fillText(
                text,
                -0.475 * this.innerWidth + 20,
                -0.475 * this.innerHeight + 45 * i + 10,
            );
        };
        createButton(0, "0");
        createButton(1, "1");
        createButton(2, "2");
        createButton(3, "3");
        createButton(4, "ex");
        createButton(5, "glb");
        createButton(6, "eff");

        context.restore();
        this.lastBeats = beats;
    }
    /** 右侧 line 按钮这一屏要显示哪一段（当前项尽量居中，到两端贴边） */
    private effectLineWindow() {
        const total = this.operationList.chart.effects.length;
        const slots = GeneralEventSequencesEditor.EFFECT_LINE_SLOTS;
        const size = Math.min(slots, total);
        const first = Math.max(
            0,
            Math.min(this.effectLine - Math.floor(slots / 2), total - size),
        );

        return { first, size };
    }

    /**
     * `eff` 层：右侧选「看第几 line」，中间画这条序列用到的所有动画变量
     *
     * 概览里一律只读。
     */
    private drawEffectVars(
        beats: number,
        startBeats: number,
        endBeats: number,
    ) {
        const { context, innerWidth, innerHeight } = this;
        const chart = this.operationList.chart;
        const { first, size } = this.effectLineWindow();

        // 右侧那一列，坐标和左边那列镜像
        context.textAlign = "center";
        context.textBaseline = "top";
        context.font = "20px Phigros";
        for (let i = 0; i < size; i++) {
            const path = this.effectLineButtons[i];
            if (!path) continue;
            context.fillStyle =
                first + i === this.effectLine ? "#DDD" : "#DDD7";
            context.fill(path);
            context.fillStyle = "#222";
            context.textAlign = "center";
            context.font = "20px Phigros";
            context.fillText(
                `${first + i}`,
                0.475 * innerWidth - 20,
                -0.475 * innerHeight + 45 * i + 10,
            );
        }
        if (this.effectAddButton) {
            context.fillStyle = "#DDD7";
            context.fill(this.effectAddButton);
            context.fillStyle = "#222";
            context.textAlign = "center";
            context.font = "20px Phigros";
            context.fillText(
                "+",
                0.475 * innerWidth - 20,
                -0.475 * innerHeight + 45 * size + 10,
            );
        }

        const sequence = chart.effects[this.effectLine];
        if (!sequence) return;

        // 只画视口内的段：视口外的段落连名字都会挤到顶上
        const inView = (start: number, end: number) =>
            end >= startBeats && start <= endBeats;

        // 这条 line 里所有特效段的 uniform：名字 + 段的起止 + 子序列
        const entries: {
            name: string;
            start: number;
            end: number;
            sequence: EventNodeSequence<EventValueESType>;
        }[] = [];
        for (const node of sequence.effects()) {
            const start = TC.toBeats(node.time);
            const endNode = node.next;
            const end =
                endNode.type === NodeType.TAIL
                    ? Infinity
                    : TC.toBeats(endNode.time);
            if (!inView(start, end)) continue;
            for (const [name, sub] of node.vars) {
                entries.push({ name, start, end, sequence: sub });
            }
        }
        entries.sort((a, b) => a.start - b.start);

        // 分列：一列能被不同时间复用，但时间上紧邻的要错开
        const columnEnds: number[] = [];
        const placed: { entry: (typeof entries)[number]; column: number }[] = [];
        for (const entry of entries) {
            let column = columnEnds.findIndex(
                (end) =>
                    end + GeneralEventSequencesEditor.EFFECT_ADJACENT_BEATS <=
                    entry.start,
            );
            if (column < 0) {
                column = columnEnds.length;
                columnEnds.push(entry.end);
            } else {
                columnEnds[column] = entry.end;
            }
            placed.push({ entry, column });
        }

        // 列数跟着实际需要走：最左一列是特效序列本身，右边依次是各变量
        const columns = columnEnds.length;
        const left = -0.475 * innerWidth + 52;
        const right = 0.475 * innerWidth - 52;
        const slot = (right - left) / (columns + 1);
        const width = Math.max(slot - this.padding, 6);

        // 点条带进详情：特效序列走文本编辑器，uniform 变量走数值编辑器
        this.drawSequence(
            beats,
            startBeats,
            endBeats,
            "fx",
            sequence,
            left + slot / 2,
            {
                width,
                onSelect: () =>
                    this.parentEditorSet.changeEffectActively(sequence, "shader"),
            },
        );

        for (const { entry, column } of placed) {
            this.drawSequence(
                beats,
                startBeats,
                endBeats,
                entry.name,
                entry.sequence,
                left + slot * (column + 1.5),
                {
                    width,
                    clip: [entry.start, entry.end],
                    labelAt: entry.end,
                    onSelect: () =>
                        this.parentEditorSet.changeEffectActively(
                            entry.sequence,
                            "var",
                        ),
                },
            );
        }
    }

    /** 加一条新的空特效序列（右侧那个「+」） */
    private addEffectSequence() {
        const chart = this.operationList.chart;
        const sequence = EffectNodeSequence.newEffectSeq(
            chart.effectiveBeats,
            chart.effects.length,
        );
        this.effectLine = chart.addEffectSequence(sequence);
        this.draw(this.lastBeats);
    }

    /**
     * 画一条事件序列的概览条
     *
     * `startBeats` / `endBeats` 是**可视窗口**（时间编辑器现在显示的那一段）。
     * `options.clip` 是这条序列**自己的时间范围**（比如某个特效段），超出的部分不画 ——
     * 两回事：窗口决定画布怎么映射时间，clip 决定这条序列在时间上占哪一段。
     */
    drawSequence(
        beats: number,
        startBeats: number,
        endBeats: number,
        type: string,
        sequence: EventNodeSequence<any>,
        offset: number,
        options: {
            /** 这条序列自己的时间范围，超出的不画 */
            clip?: [number, number];
            /** 名字画在哪个拍数处；落在窗口外则照旧画在顶上 */
            labelAt?: number;
            /** 条带宽度，缺省是 `innerWidth / 7 - padding` */
            width?: number;
            /** 要不要登记成可点选的条带（点了会切到对应编辑器），默认要 */
            selectable?: boolean;
            /** 点了做什么。给了就用它，否则按类型名切到对应编辑器 */
            onSelect?: () => void;
        } = {},
    ) {
        const sequenceWidth = options.width ?? this.innerWidth / 7 - this.padding;
        const context = this.context;
        const timeRatio = this.timeRatio;
        const yZero = this.innerHeight * this.timeBasis;
        const selectionManager = this.selectionManager;
        // 可视窗口 ∩ 序列自己的范围
        const from = Math.max(startBeats, options.clip?.[0] ?? -Infinity);
        const to = Math.min(endBeats, options.clip?.[1] ?? Infinity);

        const eq = (a: EventValueESType, b: EventValueESType) => {
            if (Array.isArray(a)) {
                return (
                    Array.isArray(b) &&
                    a.length === b.length &&
                    a.every((v, i) => v === b[i])
                );
            } else {
                return a === b;
            }
        };
        const display = (v: EventValueESType) => {
            if (Array.isArray(v)) {
                return (
                    "#" + rgb2hex(v).toString(16).toUpperCase().padStart(6, "0")
                );
            } else {
                return v.toString();
            }
        };

        if (sequence && from <= to) {
            // 从「窗口和序列范围」的交集里开始找
            let startNode = sequence.getNodeAt(from);
            while (true) {
                const endNode = startNode.next;
                const nodeBeats = TC.toBeats(startNode.time);
                if (nodeBeats > to) {
                    break;
                }

                // 段的时间范围 = 节点区间 ∩ 序列范围
                const segStart = Math.max(nodeBeats, from);
                const segEnd =
                    endNode.type === NodeType.TAIL
                        ? to
                        : Math.min(TC.toBeats(endNode.time), to);
                const startY = (segStart - beats) * timeRatio - yZero;
                const endY = (segEnd - beats) * timeRatio - yZero;

                if (endNode.type === NodeType.TAIL) {
                    context.fillStyle = "#3467";
                    context.fillRect(
                        offset - sequenceWidth / 2,
                        -endY,
                        sequenceWidth,
                        Math.max(endY - startY, 0),
                    );
                    context.fillStyle = "#DDD";
                    context.textBaseline = "bottom";
                    context.fillText(display(startNode.value), offset, -startY);
                    break;
                }

                if (eq(startNode.value, endNode.value)) {
                    context.fillStyle = "#34A7";
                } else {
                    const gradient = context.createLinearGradient(
                        0,
                        -startY,
                        0,
                        -endY,
                    );
                    gradient.addColorStop(1, "#F427");
                    gradient.addColorStop(0, "#6CF7");
                    context.fillStyle = gradient;
                }
                context.fillRect(
                    offset - sequenceWidth / 2,
                    -endY,
                    sequenceWidth,
                    endY - startY,
                );

                context.fillStyle = "#DDD";
                context.textBaseline = "bottom";
                context.fillText(display(startNode.value), offset, -startY);
                context.textBaseline = "top";
                context.fillText(display(endNode.value), offset, -endY);
                startNode = endNode.next;
            }
        }
        // 名字：默认在顶上；给了 labelAt 且落在窗口里，就画在那个时间点（特效结束点）
        const labelInside =
            options.labelAt !== undefined &&
            options.labelAt >= from &&
            options.labelAt <= to;
        const labelY = labelInside
            ? -((options.labelAt! - beats) * timeRatio - yZero)
            : -this.innerHeight / 2;

        context.fillStyle = "#DDD";
        context.textBaseline = "top";
        context.fillText(type, offset, labelY);
        if (options.selectable !== false) {
            selectionManager.add({
                target: options.onSelect ?? type,
                left: offset - sequenceWidth / 2,
                top: -this.innerHeight / 2,
                width: sequenceWidth,
                height: innerHeight,
                priority: 0,
            });
        }
    }
    override moveHandler(event: MouseEvent | TouchEvent) {
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
    }
    override upHandler(event: MouseEvent | TouchEvent): void {}
    override downHandler(event: MouseEvent | TouchEvent): void {
        const context = this.context;
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        const selectionManager = this.selectionManager;
        const selection = selectionManager.click(canvasCoord.x, canvasCoord.y);
        if (selection) {
            // eff 层登记的是回调，别的层登记的是类型名
            if (typeof selection.target === "function") selection.target();
            else this.parentEditorSet.changeTypeActively(selection.target);
        }
        const layerMapping = [
            "0",
            "1",
            "2",
            "3",
            "ex",
            "glb",
            "eff",
        ] as const;
        context.save();
        context.resetTransform();
        for (let i = 0; i < layerMapping.length; i++) {
            const path = this.layerButtons[i];
            if (context.isPointInPath(path, canvasCoord.x, canvasCoord.y)) {
                const layer = layerMapping[i];
                if (layer !== this.layer) {
                    this.parentEditorSet.changeLayerActively(layer);
                }
            }
        }
        if (this.layer === "eff") {
            const { first, size } = this.effectLineWindow();
            for (let i = 0; i < size; i++) {
                const path = this.effectLineButtons[i];
                if (!path) continue;
                if (context.isPointInPath(path, canvasCoord.x, canvasCoord.y)) {
                    this.effectLine = first + i;
                    this.draw(this.lastBeats);
                }
            }
            if (
                this.effectAddButton &&
                context.isPointInPath(
                    this.effectAddButton,
                    canvasCoord.x,
                    canvasCoord.y,
                )
            ) {
                this.addEffectSequence();
            }
        }
        context.restore();
    }
    override updateMatrix(): void {
        super.updateMatrix();
        this.timeRatio = this.innerHeight / this.timeSpan;
    }
}

/**
 * 事件序列编辑器基类。
 *
 * 简单介绍三个矩阵：
 * - `matrix`: 用于事件实际值到编辑器坐标转换（仅`NumericEventCurveEditor`使用）
 * - `canvasMatrix`：用于编辑器坐标到Canvas坐标转换，该矩阵等价于`context.getTransform()`
 * - `elementMatrix`：用于元素`offsetX`/`offsetY`到Canvas坐标的转换。（即，有时候Canvas的`width`和`height`不为物理大小）
 *
 *
 */
export abstract class EventSequenceEditor<
    VT extends EventValueESType,
> extends EventSequenceEditorBase {
    readonly valueType: EventValueTypeOfType<VT>;
    /**
     * `declare` 而不是 `override readonly type: EventType;`
     *
     * 带 `override` 但**没有初始化器**的字段声明，在 `useDefineForClassFields`
     * （target ES2022 的默认值）下会被发射成自有属性，把基类构造函数
     * （`public readonly type` 参数属性）赋好的值覆盖成 undefined。
     * `this.type` 是这个编辑器判断 bpm / easing / speed 分支的依据，
     * 被覆盖后 `EventType[this.type]` 全是 undefined。
     *
     * 与 kipphi 侧 `EventNodeLike.parentSeq` 是同一类问题。
     */
    declare readonly type: EventType;

    target: EventNodeSequence<VT>;
    targetEasing?: TemplateEasing;

    nodeHeight = 30;
    nodeWidth = 30;

    /** 用于范围选取框的颜色 */
    scopingColor = "#FAA";

    state: EventCurveEditorState;

    _selectedNode: WeakRef<EventStartNode | EventEndNode>;

    newNodeState: NewNodeState = NewNodeState.controlsBoth;
    selectState: SelectState;
    lastSelectState: SelectState = SelectState.extend;

    selectedNode: EventStartNode<VT> | EventEndNode<VT> = null;

    autoRangeEnabled: boolean = true;

    clipboard: Set<EventStartNode<VT>> = new Set();
    nodesSelection: Set<EventStartNode<VT>> = new Set();

    constructor(
        type: EventType,
        canvas: HTMLCanvasElement,
        clippingRect: LTWH,
        operationList: O.OperationList,
        parentEditorSet: EventSequenceEditors,
    ) {
        super(type, canvas, clippingRect, operationList, parentEditorSet);
        if (type === EventType.alpha) {
            this.autoRangeEnabled = false;
        }
        this.state = EventCurveEditorState.select;

        this.selectionManager = new SelectionManager();

        // 下面有一堆监听器
        // #region
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            // 踩坑：Canvas不能获得焦点
            if (!this.mouseIn || !this.active) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            if (e.key === "Shift") {
                if (
                    this.state === EventCurveEditorState.selectScope ||
                    this.state === EventCurveEditorState.selectingScope
                ) {
                    return;
                }
                this.state = EventCurveEditorState.selectScope;
                this.selectState = this.lastSelectState;
                this.draw();
                return;
            }
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste(false, e.ctrlKey);
                    break;
                case "c":
                    this.copy();
                    break;
                case "x":
                    this.paste(true, e.ctrlKey);
                    break;
                case "r":
                    if (e.ctrlKey) {
                        return;
                    }
                    this.placeNode(
                        this instanceof NumericEventCurveEditor
                            ? (this.pointedValue as VT)
                            : null,
                    );
            }
        });
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (!this.active) {
                return;
            }
            if (e.key === "Shift") {
                if (
                    this.state === EventCurveEditorState.selectScope ||
                    this.state === EventCurveEditorState.selectingScope
                ) {
                    this.state = EventCurveEditorState.select;
                    this.selectState = SelectState.none;
                    this.draw();
                }
            }
        });
        // #endregion
    }
    override addEventListener<T extends keyof KPANodeEventMap>(
        type: T,
        listener: (event: KPANodeEventMap[T]) => void,
        options?: EventListenerOptions,
    ): void {
        super.addEventListener(type, listener, options);
    }

    placeNode(value: VT) {
        const time: TimeT = this.pointedTime;
        const prev = this.target.getNodeAt(TC.toBeats(time));
        if (TC.eq(prev.time, time)) {
            return;
        }
        value = value ?? prev.value;
        let node: EventStartNode<VT>, endNode: EventEndNode<VT>;
        if (this.type === EventType.bpm) {
            (node as any as BPMStartNode) = new BPMStartNode(
                time,
                value as number,
            );
            (endNode as any as BPMEndNode) = new BPMEndNode(time);
        } else {
            endNode = new EventEndNode(
                time,
                this.newNodeState === NewNodeState.controlsStart
                    ? prev.value
                    : value,
            );
            node = new EventStartNode(
                time,
                this.newNodeState === NewNodeState.controlsEnd
                    ? prev.value
                    : value,
            );
        }
        node.evaluator = EasedEvaluator.getEvaluatorFromEasing<VT>(
            this.valueType,
            this.parentEditorSet.useEasing,
        ) as unknown as EasedEvaluator<VT>;
        EventNode.connect(endNode, node);
        // this.editor.chart.getComboInfoEntity(startTime).add(note)
        this.operationList.do(new O.EventNodePairInsertOperation(node, prev));
        if (this.type === EventType.bpm) {
            this.dispatchEvent(new KPABPMAffectedEvent());
        }
        this.selectedNode = node;
    }

    override drawCoordination(beats: number) {
        const [boundLeft, boundTop, boundWidth, boundHeight] =
            this.clippingRect;
        const { innerHeight, innerWidth } = this;
        const {
            timeGridInterval: timeGridSpan,
            timeRatio,
            context,
            timeBasis,
        } = this;

        const timeDivisor = this.parentEditorSet.timeDivisor;
        context.clearRect(
            -boundWidth / 2,
            -boundHeight / 2,
            boundWidth,
            boundHeight,
        );
        context.fillStyle = "#333d";
        context.fillRect(
            -boundWidth / 2,
            -boundHeight / 2,
            boundWidth,
            boundHeight,
        );
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        // const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        // 画布上的状态文字（State / Beats / Selected …）已移到工具栏按钮里
        context.save();
        context.strokeStyle = this.timeGridColor;
        context.fillStyle = this.timeGridColor;

        context.lineWidth = 3;

        const yZero = innerHeight * timeBasis;
        const stopBeats =
            Math.ceil(
                (beats + this.timeSpan * (0.5 + timeBasis)) / timeGridSpan,
            ) * timeGridSpan;
        const startBeats =
            Math.ceil(
                (beats + this.timeSpan * (-0.5 + timeBasis)) / timeGridSpan - 1,
            ) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats) * timeRatio - yZero;
            drawLine(
                context,
                innerWidth / 2,
                -positionY,
                -innerWidth / 2,
                -positionY,
            );
            context.fillText(time + "", -innerWidth / 2 + 10, -positionY);

            context.save();
            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosY =
                    (time + i / timeDivisor - beats) * timeRatio - yZero;
                drawLine(
                    context,
                    innerWidth / 2,
                    -minorPosY,
                    -innerWidth / 2,
                    -minorPosY,
                );
            }
            context.restore();
        }
        context.restore();
        context.lineWidth = 3;
        drawLine(context, innerWidth / 2, yZero, -innerWidth / 2, yZero);
        context.strokeStyle = "#EEE";
    }
    override draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        const { context, selectionManager } = this;
        selectionManager.refresh();
        if (!this.target) {
            const context = this.context;
            context.save();
            const clippingRect = this.clippingRect;
            context.clearRect(
                -clippingRect[2] / 2,
                -clippingRect[3] / 2,
                clippingRect[2],
                clippingRect[3],
            );
            context.fillStyle = "#EEE";
            context.textAlign = "center";
            context.fillText(
                this.type !== EventType.easing
                    ? messages.NO_TARGET(
                          this.parentEditorSet.selectedLayer,
                          EventType[this.type],
                      )
                    : messages.NO_TARGET_EASING(),
                0,
                0,
            );
            context.restore();
            this.putReturnButton();
            return;
        }
        this.drawCoordination(beats);
        const startBeats = beats - this.timeSpan * (0.5 + this.timeBasis);
        const endBeats = beats + this.timeSpan * (0.5 + this.timeBasis);
        // 该数组用于自动调整网格
        // const valueArray = [];

        const line = this.targetLine;
        let len: number;
        if (
            line &&
            [
                EventType.moveX,
                EventType.moveY,
                EventType.alpha,
                EventType.rotate,
                EventType.speed,
                EventType.scaleX,
                EventType.scaleY,
                EventType.color,
                EventType.text,
            ].includes(this.type) &&
            !line.group.isDefault()
        ) {
            const group = line.group;
            const parent = this.parentEditorSet;
            context.save();
            context.font = "25px Phigros";
            len = group.judgeLines.length;
            for (let i = 0; i < len; i++) {
                const judgeLine = group.judgeLines[i]!;
                if (judgeLine === line) {
                    // 跳过本判定线，因为它在最后绘制
                    continue;
                }
                const sequence =
                    this.type === EventType.speed
                        ? judgeLine.speedSequence
                        : parent.selectedLayer === "ex"
                          ? judgeLine.extendedLayer[EventType[this.type]]
                          : judgeLine.eventLayers[parent.selectedLayer][
                                EventType[this.type]
                            ];
                if (!sequence) {
                    continue;
                }
                context.strokeStyle =
                    context.fillStyle = `hsl(${(i / len) * 360}, 80%, 75%)`;
                context.globalAlpha = 1;
                context.fillText(`${judgeLine.id}`, i * 14, 60);
                context.globalAlpha = 0.5;
                this.drawSequence(
                    sequence,
                    beats,
                    startBeats,
                    endBeats,
                    i,
                    len,
                );
            }
            context.restore();
        }

        // 抬高真正的目标序列之优先级
        selectionManager.setBasePriority(1);
        this.drawSequence(
            this.target,
            beats,
            startBeats,
            endBeats,
            len ? len - 1 : 0,
            len ?? 1,
        );
        selectionManager.setBasePriority(0);

        this.putReturnButton();

        if (this.state === EventCurveEditorState.selectingScope) {
            const { startingCanvasPoint, canvasPoint } = this;
            context.save();
            context.lineWidth = 3;
            context.strokeStyle = this.scopingColor;
            context.strokeRect(
                startingCanvasPoint.x,
                startingCanvasPoint.y,
                canvasPoint.x - startingCanvasPoint.x,
                canvasPoint.y - startingCanvasPoint.y,
            );
            context.restore();
        }
        this.lastBeats = beats;
    }
    putReturnButton() {
        const { context, selectionManager } = this;
        context.save();
        context.fillStyle = "#DDD7";
        context.fillRect(
            -this.innerWidth / 2,
            -this.innerHeight / 2,
            this.innerWidth / 4,
            this.innerHeight / 20,
        );
        context.fillStyle = "#111";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(
            "←general",
            -this.innerWidth * 0.375,
            -this.innerHeight / 2 + 4,
        );
        context.restore();

        selectionManager.add({
            left: -this.innerWidth / 2,
            top: -this.innerHeight / 2,
            width: this.innerWidth / 4,
            height: this.innerHeight / 20,
            target: "return",
            priority: 10,
        });
    }
    drawSequence(
        sequence: EventNodeSequence<VT>,
        beats: number,
        startBeats: number,
        endBeats: number,
        index: number,
        total: number,
    ): void {
        const { selectionManager, context } = this;
        const NODE_HEIGHT = this.nodeHeight;
        const NODE_WIDTH = this.nodeWidth;
        const START_NODE_IMG = Images.START_NODE;
        const END_NODE_IMG = Images.END_NODE;

        let previousEndNode:
            EventEndNode<VT> | EventNodeLike<NodeType.HEAD, VT> =
            sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous ||
            sequence.head; // 有点奇怪的操作

        const yZero = this.innerHeight * this.timeBasis;

        // 我很少用do while循环。这里确实不需要检查第一次，肯定至少画出一根
        do {
            const startNode = previousEndNode.next!;
            const endNode = startNode.next;
            if (endNode.type === NodeType.TAIL) {
                break;
            }
            const startXY = this.calculatePos(beats, startNode, index, total);
            const endXY = this.calculatePos(beats, endNode, index, total);
            const [startX, startY] = startXY;
            const [endX, endY] = endXY;
            const topY = startY;
            const topEndY = endY;

            const sheight =
                this.selectedNode === startNode
                    ? NODE_HEIGHT * 1.5
                    : NODE_HEIGHT;
            const swidth =
                this.selectedNode === startNode ? NODE_WIDTH * 1.5 : NODE_WIDTH;
            const eheight =
                this.selectedNode === endNode ? NODE_HEIGHT * 1.5 : NODE_HEIGHT;
            const ewidth =
                this.selectedNode === endNode ? NODE_WIDTH * 1.5 : NODE_WIDTH;

            const leftX = startX - swidth / 2;
            const leftEndX = endX - ewidth / 2;

            selectionManager.add({
                target: startNode,
                left: leftX,
                top: topY - sheight,
                width: swidth,
                height: sheight,
                priority: 1,
            });
            selectionManager.add({
                target: endNode,
                left: leftEndX,
                top: topEndY,
                width: ewidth,
                height: eheight,
                priority: 1,
            });

            const selected = this.nodesSelection.has(startNode);

            if (selected) {
                context.save();
                context.strokeStyle = "cyan";
            }

            this.strokeCurve(
                context,
                startNode as NonLastStartNode<VT>,
                endNode,
                startXY,
                endXY,
                beats,
            );
            if (selected) {
                context.restore();
            }
            context.drawImage(
                START_NODE_IMG,
                leftX,
                topY - sheight,
                swidth,
                sheight,
            );
            context.drawImage(END_NODE_IMG, leftEndX, topEndY, ewidth, eheight);
            // console.log(this.type, EventType.speed)
            if (this.type === EventType.speed) {
                // console.log(startNode)
                // console.log(startNode.easing)
                context.lineWidth = 1;
                context.fillText(startNode.floorPosition.toFixed(4), startX, 0);
                context.lineWidth = 3;
            }
            previousEndNode = endNode;
        } while (
            TC.toBeats((previousEndNode as EventEndNode<VT>).time) < endBeats
        );
        if (previousEndNode.next!.next.type === NodeType.TAIL) {
            const lastStart = previousEndNode.next!;
            const startXY = this.calculatePos(beats, lastStart, index, total);
            const [startX, startY] = startXY;
            const topY = startY - NODE_HEIGHT;
            const selected = this.nodesSelection.has(lastStart);
            if (selected) {
                context.save();
                context.strokeStyle = "cyan";
            }
            this.strokeLastLineSegment(context, lastStart, startXY);
            if (selected) {
                context.restore();
            }
            context.drawImage(
                START_NODE_IMG,
                startX - NODE_WIDTH / 2,
                startY - NODE_HEIGHT,
                NODE_WIDTH,
                NODE_HEIGHT,
            );
            selectionManager.add({
                target: lastStart,
                left: startX - NODE_WIDTH / 2,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1,
            });
        }
    }

    /**
     *
     * @param beats
     * @param node
     * @param seqIndex
     * @returns 节点参考点的虚拟坐标
     */
    abstract calculatePos(
        beats: number,
        node: EventStartNode<VT> | EventEndNode<VT>,
        seqIndex: number,
        total: number,
    ): [number, number];
    abstract strokeCurve(
        context: CanvasRenderingContext2D,
        startNode: NonLastStartNode<VT>,
        endNode: EventEndNode<VT>,
        startXY: [number, number],
        endXY: [number, number],
        beats: number,
    ): void;
    abstract strokeLastLineSegment(
        context: CanvasRenderingContext2D,
        startNode: EventStartNode<VT>,
        startXY: [number, number],
    ): void;

    paste(deletesOriginal = false, keepOriginalSeq = false) {
        if (!this.active) {
            return;
        }
        const { lastBeats } = this;
        const clipboard = this.clipboard;
        const timeDivisor = this.parentEditorSet.timeDivisor;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        for (let ele of clipboard) {
            if (typeof ele.value === "number") {
                break;
            } else {
                return;
            }
        }
        if (!lastBeats) {
            this.notify("Have not rendered a frame");
        }
        const dest: TimeT = this.pointedTime;

        const [originalArr, newNodes] = EventNode.setToNewOrderedArray(
            dest,
            clipboard,
        );

        const returnComplex = () =>
            !keepOriginalSeq
                ? deletesOriginal
                    ? new O.ComplexOperation(
                          new O.MultiNodeAddOperation(newNodes, this.target),
                          new O.MultiNodeDeleteOperation(originalArr),
                      )
                    : new O.MultiNodeAddOperation(newNodes, this.target)
                : deletesOriginal
                  ? new O.ComplexOperation(
                        new O.ComplexOperation(
                            ...newNodes.map((n, i) => {
                                return O.EventNodePairAutoInsertOperation.lazy(
                                    n as any,
                                    originalArr[i]!.parentSeq,
                                );
                            }),
                        ),
                        new O.MultiNodeDeleteOperation(originalArr),
                    )
                  : new O.ComplexOperation(
                        ...newNodes.map((n, i) => {
                            return O.EventNodePairAutoInsertOperation.lazy(
                                n as any,
                                originalArr[i]!.parentSeq,
                            );
                        }),
                    );

        this.operationList.tryDo(returnComplex);

        this.nodesSelection = new Set<EventStartNode<VT>>(newNodes);
        this.dispatchEvent(new KPANodeScopeselectedEvent(this.nodesSelection));
    }
    copy(): void {
        if (!this.active) {
            return;
        }
        this.clipboard = this.nodesSelection;
        this.nodesSelection = new Set<EventStartNode<VT>>();
    }

    /**
     *
     * @param this bpm和easing不允许创建
     */
    createTarget(this: EventSequenceEditor<VT>) {
        const line = this.targetLine;
        if (this.type === EventType.speed) {
            const seq = this.operationList.chart.createEventNodeSequence(
                this.type,
                `#${line.id}.speed`,
            );
            this.targetLine.speedSequence = seq as SpeedENS;
            // @ts-expect-error
            this.target = seq;
        } else if (this.type < EventType.speed) {
            // 前四个种类（如果枚举顺序变了可能出问题，但肯定不会变的（
            if (this.parentEditorSet.selectedLayer === "ex") {
                return;
            }
            const seq = this.operationList.chart.createEventNodeSequence(
                this.type,
                `#${line.id}.${this.parentEditorSet.selectedLayer}.${EventType[this.type]}`,
            );
            this.operationList.do(
                new O.JudgeLineENSChangeOperation(
                    line,
                    parseInt(this.parentEditorSet.selectedLayer),
                    // @ts-expect-error
                    EventType[this.type],
                    seq,
                ),
            );
            // @ts-expect-error
            this.target = seq;
        } else {
            if (this.parentEditorSet.selectedLayer !== "ex") {
                return;
            }
            const seq = this.operationList.chart.createEventNodeSequence(
                this.type,
                `#${line.id}.ex.${EventType[this.type]}`,
            );
            this.operationList.do(
                new O.JudgeLineExtendENSChangeOperation(
                    line,
                    // @ts-expect-error
                    EventType[this.type],
                    seq as EventNodeSequence<string>,
                ),
            );
            // @ts-expect-error
            this.target = seq;
        }
    }

    // begin 以下朝生夕死，不配置不可读的状态。如果你觉得哪个应该是可读的，请提issue拷打杨哲思
    /**
     * 同样要 `declare`：基类构造函数里 `this.selectionManager = new SelectionManager()`，
     * 子类这条**没有初始化器**的声明会在之后把自有属性覆盖成 undefined
     * （`useDefineForClassFields`，target ES2022 的默认值），选中状态直接失效。
     */
    declare protected selectionManager: SelectionManager<
        EventStartNode<VT> | EventEndNode<VT> | "return"
    >;
    protected startingPoint: Coordinate;
    protected startingCanvasPoint: Coordinate;
    protected wasEditing: boolean;
    // private pointedValue: number; 这个不能用，在子类里面才声明它
}

const isReturn = (e: { target: any }) => e && e.target === "return";

export class NumericEventCurveEditor extends EventSequenceEditor<number> {
    override readonly valueType = EventValueType.numeric;

    public pointedValue: number;

    attachableValues: number[] = [];

    valueRatio: number;
    valueGridColor = "rgb(255, 170, 120)";
    valueRange: readonly [number, number];

    valueGridInterval: number | undefined;

    constructor(
        type: Exclude<EventType, EventType.text | EventType.color>,

        canvas: HTMLCanvasElement,
        clippingRect: LTWH,
        operationList: O.OperationList,
        parentEditorSet: EventSequenceEditors,
    ) {
        super(type, canvas, clippingRect, operationList, parentEditorSet);

        const config = eventTypeMap[type];
        this.valueRange = config.valueRange;
        this.valueRatio = this.innerWidth / lengthOf(this.valueRange);
        this.attachableValues = generateAttachable(
            [config.valueGridSpan, 0],
            this.valueRange,
        );

        this.updateMatrix();
    }

    override updateMatrix(): void {
        super.updateMatrix();
        // 扩展：值维度
        this.valueRatio = this.innerWidth / lengthOf(this.valueRange);
        this.timeRatio = this.innerHeight / this.timeSpan;
        const { valueRange, timeRatio, valueRatio } = this;
        this.matrix = identity
            .scale(valueRatio, -timeRatio)
            .translate(-medianOf(valueRange), -this.timeSpan * this.timeBasis);
        this.matrixInverted = this.matrix.invert();
    }
    override drawCoordination(beats: number): void {
        super.drawCoordination(beats);
        // 扩展：吸附线
        const { context, attachableValues } = this;
        context.save();
        context.fillStyle = "#EEE";
        context.font = "16px phigros";

        context.textAlign = "center";
        context.strokeStyle = this.valueGridColor;
        context.lineWidth = 1;
        const height = this.clippingRect[3];
        const top = -height / 2;
        const bottom = height / 2;
        const textPosY = top + this.padding;
        context.fillStyle = this.valueGridColor;

        const len = attachableValues.length;
        const useDifferentPos = len > 12;
        const median = medianOf(this.valueRange);
        for (let i = 0; i < len; i++) {
            const value = attachableValues[i];
            const positionX = this.matrix.xmul(value, 0);
            drawLine(context, positionX, top, positionX, bottom);
            const posY =
                useDifferentPos && i % 2 == 1 ? textPosY + 16 : textPosY;
            context.fillText(value + "", positionX, posY);
        }
        context.restore();
    }

    moveHandler(event: MouseEvent | TouchEvent) {
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));

        const parentEditorSet = this.parentEditorSet;
        const timeDivisor = parentEditorSet.timeDivisor;

        const { x: value, y: beats } = canvasCoord.mul(this.matrixInverted);
        this.pointedValue = computeAttach(this.attachableValues, value);

        const accurateBeats = beats + this.lastBeats;
        let pointedBeats = Math.floor(accurateBeats);
        let beatFraction = Math.round(
            (accurateBeats - pointedBeats) * timeDivisor,
        );
        if (beatFraction === timeDivisor) {
            pointedBeats += 1;
            beatFraction = 0;
        }
        this.pointedTime = [pointedBeats, beatFraction, timeDivisor];

        switch (this.state) {
            case EventCurveEditorState.selecting:
                // console.log("det")
                this.operationList.do(
                    new O.EventNodeValueChangeOperation(
                        this.selectedNode,
                        this.pointedValue,
                    ),
                );
                this.operationList.do(
                    new O.EventNodeTimeChangeOperation(
                        this.selectedNode,
                        this.pointedTime,
                    ),
                );
        }
    }
    downHandler(event: MouseEvent | TouchEvent) {
        // 所有的数值性事件，包括X/Y缩放，都一定存在
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));

        const coord = canvasCoord.mul(this.matrixInverted);
        if (isReturn(this.selectionManager.click(canvasCoord))) {
            this.parentEditorSet.returnToGeneralActively();
            return;
        } else if (!this.target) {
            this.createTarget();
        }
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord);
                this.state = !snode
                    ? EventCurveEditorState.select
                    : EventCurveEditorState.selecting;
                if (snode && snode.target instanceof EventNode) {
                    this.selectedNode = snode.target;
                    this.dispatchEvent(
                        new KPANodeSelectedEvent(this.selectedNode),
                    );
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                this.placeNode(this.pointedValue);
                this.state = EventCurveEditorState.selecting;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: MouseEvent | TouchEvent) {
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [
                    this.startingCanvasPoint.x,
                    canvasCoord.x,
                ].sort((a, b) => a - b);
                const [sy, ey] = [
                    this.startingCanvasPoint.y,
                    canvasCoord.y,
                ].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array
                    .map((x) => x.target)
                    .filter((x) => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.nodesSelection = this.nodesSelection.union(
                            new Set(nodes),
                        );
                        break;
                    case SelectState.replace:
                        this.nodesSelection = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.nodesSelection = this.nodesSelection.difference(
                            new Set(nodes),
                        );
                        break;
                }
                this.nodesSelection = new Set(
                    [...this.nodesSelection].filter(
                        (note: EventStartNode<any>) => !!note.parentSeq,
                    ),
                );
                // console.log("bp")
                if (this.nodesSelection.size !== 0) {
                    this.dispatchEvent(
                        new KPANodeScopeselectedEvent(this.nodesSelection),
                    );
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }
    calculatePos(
        beats: number,
        node: EventStartNode<number> | EventEndNode<number>,
        seqIndex: number,
    ): [number, number] {
        const pos = new Coordinate(
            node.value,
            TC.toBeats(node.time) - beats,
        ).mul(this.matrix);
        this.valuesInFrame.push(node.value);
        return [pos.x, pos.y];
    }
    /**
     *
     * @param context
     * @param startNode
     * @param endNode
     * @param startXY Canvas坐标
     * @param endXY Canvas坐标
     * @returns
     */
    strokeCurve(
        context: CanvasRenderingContext2D,
        startNode: NonLastStartNode<number>,
        endNode: EventEndNode<number>,
        startXY: [number, number],
        endXY: [number, number],
        beats: number,
    ): void {
        const evaluator = startNode.evaluator;
        if (evaluator instanceof EasedEvaluator) {
            const easing = evaluator.easing;
            if (easing instanceof NormalEasing) {
                if (easing === linearEasing) {
                    // 这个横竖都一样
                    drawLine(
                        context,
                        startXY[0],
                        startXY[1],
                        endXY[0],
                        endXY[1],
                    );
                    return;
                } else if (easing === fixedEasing) {
                    // 这里的话，如果要用回KPA1的横版，可能需要修改代码
                    this.strokeForFixedEasing(context, startXY, endXY);
                    return;
                }
            } else if (easing instanceof BezierEasing) {
                drawBezierCurve(
                    context,
                    startXY,
                    endXY,
                    [easing.cp1[1], easing.cp1[0]],
                    [easing.cp2[1], easing.cp2[0]],
                );
                return;
            }
        }
        // 以上选项都不行的话只能插值了
        this.strokeGeneralCurve(
            context,
            startNode,
            endNode,
            startXY,
            endXY,
            beats,
        );
    }
    strokeForFixedEasing(
        context: CanvasRenderingContext2D,
        startXY: [number, number],
        endXY: [number, number],
    ): void {
        drawLine(context, startXY[0], startXY[1], startXY[0], endXY[1]);
    }
    strokeGeneralCurve(
        context: CanvasRenderingContext2D,
        startNode: EventStartNode<number>,
        endNode: EventEndNode<number>,
        startXY: [number, number],
        endXY: [number, number],
        beats: number,
    ): void {
        const INTERPOLATION_STEP = 0.0125;
        const startBeats = TC.toBeats(startNode.time);
        const endBeats = TC.toBeats(endNode.time);
        const [startX, startY] = startXY;
        const [endX, endY] = endXY;
        /** endXY之前的点的个数 */
        const pointCount = Math.ceil(
            (endBeats - startBeats) / INTERPOLATION_STEP,
        );
        context.beginPath();
        context.moveTo(startX, startY);
        for (let i = 1; i < pointCount; i++) {
            const curBeats = startBeats + i * INTERPOLATION_STEP;
            const { x, y } = new Coordinate(
                startNode.getValueAt(curBeats),
                curBeats - beats,
            ).mul(this.matrix);
            context.lineTo(x, y);
        }
        context.lineTo(endX, endY);
        context.stroke();
    }
    override strokeLastLineSegment(
        context: CanvasRenderingContext2D,
        startNode: EventStartNode<number>,
        startXY: [number, number],
    ): void {
        drawLine(
            context,
            startXY[0],
            startXY[1],
            startXY[0],
            -this.canvas.height,
        );
    }
    override draw(beats?: number): void {
        this.valuesInFrame = []; // 重置
        if (this.valueGridInterval) {
            this.attachableValues = generateAttachable(
                [this.valueGridInterval, 0],
                this.valueRange,
            );
        }
        super.draw(beats);
        this.adjust(this.valuesInFrame);
    }

    adjust(values: number[]): void {
        if (this.state !== EventCurveEditorState.select) {
            return;
        }
        const valueRange = this.valueRange;
        const distinctValueCount = new Set(values).size;
        if (
            distinctValueCount < 2 &&
            valueRange[0] < values[0] &&
            values[0] < valueRange[1]
        ) {
            return;
        }
        if (this.autoRangeEnabled) {
            const sorted = values.sort((a, b) => a - b);
            const lengthOfValue = lengthOf(valueRange);
            // 如果上四分位数超出了valueRange，则扩大valueRange右边界valueRange长度的一半。
            // 如果上四分位数不及valueRange的2/3处位置，则缩小valueRange右边界valueRange长度的一半。
            // 下四分位数同理
            const upper = getPercentile(sorted, 0.95);
            const lower = getPercentile(sorted, 0.05);
            const pos1Third = percentileOf(valueRange, 0.34);
            const pos2Third = percentileOf(valueRange, 0.66);
            const range: [number, number] = [...this.valueRange];
            if (upper > valueRange[1]) {
                range[1] = valueRange[1] + lengthOfValue / 2;
            } else if (upper < pos2Third) {
                range[1] = valueRange[1] - lengthOfValue / 3;
            }
            if (lower < valueRange[0]) {
                range[0] = valueRange[0] - lengthOfValue / 2;
            } else if (lower > pos1Third) {
                range[0] = valueRange[0] + lengthOfValue / 3;
            }
            this.valueRange = range;
        }

        // 计算合适的valueGridSpan
        // 根据这个值能够整除多少个值。

        let valueGridSpan = eventTypeMap[this.type]!.valueGridSpan;
        if (this.valueGridInterval) {
            valueGridSpan = this.valueGridInterval;
        } else {
            let priority = 0;
            const len = values.length;
            for (let i = 0; i < len; i++) {
                const v = values[i];
                if (v === 0) {
                    continue;
                }
                const p = values.reduce((acc, cur) => {
                    return cur % v === 0 ? acc + 1 : acc;
                });
                if (p > priority * 1.2) {
                    priority = p;
                    valueGridSpan = v;
                }
            }
            valueGridSpan = divideOrMul(
                valueGridSpan,
                10 / (lengthOf(this.valueRange) / valueGridSpan),
            );
        }
        if (distinctValueCount > 10) {
            this.attachableValues = generateAttachable(
                [valueGridSpan, 0],
                this.valueRange,
            );
        } else {
            this.attachableValues = Array.from(
                new Set([
                    ...generateAttachable([valueGridSpan, 0], this.valueRange),
                    ...values,
                ]),
            ).sort((a, b) => a - b);
        }
    }

    protected valuesInFrame: number[];

    /** [value, time] -> [x, y] */
    protected matrix: Matrix33;
    /** [x, y] -> [value, time] */
    protected matrixInverted: Matrix33;
}

export class TextEventSequenceEditor extends EventSequenceEditor<string> {
    override readonly valueType = EventValueType.text;
    constructor(
        type: EventType.text | EventType.video,
        canvas: HTMLCanvasElement,
        clippingRect: LTWH,
        operationList: O.OperationList,
        parentEditorSet: EventSequenceEditors,
    ) {
        super(type, canvas, clippingRect, operationList, parentEditorSet);
        this.updateMatrix();
    }
    override moveHandler(event: MouseEvent | TouchEvent): void {
        const coord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));

        const timeDivisor = this.parentEditorSet.timeDivisor;

        const offsetBeats =
            (this.innerHeight * this.timeBasis - coord.y) /
            (this.timeGridInterval * this.timeRatio); // 颜色事件编辑器没有第三层矩阵，因为没有值维度

        const accurateBeats = offsetBeats + this.lastBeats;
        let pointedBeats = Math.floor(accurateBeats);
        let beatFraction = Math.round(
            (accurateBeats - pointedBeats) * timeDivisor,
        );
        if (beatFraction === timeDivisor) {
            pointedBeats += 1;
            beatFraction = 0;
        }
        this.pointedTime = [
            pointedBeats,
            beatFraction,
            this.parentEditorSet.timeDivisor,
        ];

        switch (this.state) {
            case EventCurveEditorState.selecting:
                // console.log("det")
                this.operationList.do(
                    new O.EventNodeTimeChangeOperation(
                        this.selectedNode,
                        this.pointedTime,
                    ),
                );
        }
    }

    downHandler(event: MouseEvent | TouchEvent) {
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        if (isReturn(this.selectionManager.click(canvasCoord))) {
            this.parentEditorSet.returnToGeneralActively();
            return;
        }
        if (!this.target) {
            this.createTarget();
            return;
        }
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord);
                this.state = !snode
                    ? EventCurveEditorState.select
                    : EventCurveEditorState.selecting;
                if (snode && snode.target instanceof EventNode) {
                    this.selectedNode = snode.target;
                    this.dispatchEvent(
                        new KPANodeSelectedEvent(this.selectedNode),
                    );
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                this.placeNode(null);
                this.state = EventCurveEditorState.selecting;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }

    upHandler(event: MouseEvent | TouchEvent) {
        // 这个方法和上面那个数值事件编辑器其实是一样的
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [
                    this.startingCanvasPoint.x,
                    canvasCoord.x,
                ].sort((a, b) => a - b);
                const [sy, ey] = [
                    this.startingCanvasPoint.y,
                    canvasCoord.y,
                ].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array
                    .map((x) => x.target)
                    .filter((x) => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.nodesSelection = this.nodesSelection.union(
                            new Set(nodes),
                        );
                        break;
                    case SelectState.replace:
                        this.nodesSelection = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.nodesSelection = this.nodesSelection.difference(
                            new Set(nodes),
                        );
                        break;
                }
                this.nodesSelection = new Set(
                    [...this.nodesSelection].filter(
                        (note: EventStartNode<any>) => !!note.parentSeq,
                    ),
                );
                // console.log("bp")
                if (this.nodesSelection.size !== 0) {
                    this.dispatchEvent(
                        new KPANodeScopeselectedEvent(this.nodesSelection),
                    );
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    override calculatePos(
        beats: number,
        node: EventStartNode<string> | EventEndNode<string>,
        seqIndex: number,
        total: number,
    ): [number, number] {
        const x = ((seqIndex + 0.5) / total - 0.5) * this.innerWidth;
        return [
            x,
            -(TC.toBeats(node.time) - beats) * this.timeRatio +
                this.innerHeight * this.timeBasis,
        ];
    }

    override strokeCurve(
        context: CanvasRenderingContext2D,
        startNode: NonLastStartNode<string>,
        endNode: EventEndNode<string>,
        startXY: [number, number],
        endXY: [number, number],
        beats: number,
    ): void {
        drawLine(context, startXY[0], startXY[1], endXY[0], endXY[1]);
        context.fillStyle = "#DDD";
        context.fillText(startNode.value, startXY[0], startXY[1]);
    }

    override strokeLastLineSegment(
        context: CanvasRenderingContext2D,
        startNode: EventStartNode<string>,
        startXY: [number, number],
    ): void {
        drawLine(
            context,
            startXY[0],
            startXY[1],
            startXY[0],
            -this.clippingRect[3] / 2,
        );
        context.fillStyle = "#DDD";
        context.fillText(startNode.value, startXY[0], startXY[1]);
    }
}

export class ColorEventSequenceEditor extends EventSequenceEditor<RGB> {
    override readonly valueType = EventValueType.color;
    constructor(
        type: EventType.color,
        canvas: HTMLCanvasElement,
        clippingRect: LTWH,
        operationList: O.OperationList,
        parentEditorSet: EventSequenceEditors,
    ) {
        super(type, canvas, clippingRect, operationList, parentEditorSet);
        this.updateMatrix();
    }
    override moveHandler(event: MouseEvent | TouchEvent): void {
        const coord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));

        const timeDivisor = this.parentEditorSet.timeDivisor;

        const offsetBeats =
            (this.timeBasis * this.innerHeight - coord.y) /
            (this.timeGridInterval * this.timeRatio); // 文本事件编辑器没有第三层矩阵，因为没有值维度

        const accurateBeats = offsetBeats + this.lastBeats;
        let pointedBeats = Math.floor(accurateBeats);
        let beatFraction = Math.round(
            (accurateBeats - pointedBeats) * timeDivisor,
        );
        if (beatFraction === timeDivisor) {
            pointedBeats += 1;
            beatFraction = 0;
        }
        this.pointedTime = [
            pointedBeats,
            beatFraction,
            this.parentEditorSet.timeDivisor,
        ];

        switch (this.state) {
            case EventCurveEditorState.selecting:
                // console.log("det")
                this.operationList.do(
                    new O.EventNodeTimeChangeOperation(
                        this.selectedNode,
                        this.pointedTime,
                    ),
                );
        }
    }

    downHandler(event: MouseEvent | TouchEvent) {
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        if (isReturn(this.selectionManager.click(canvasCoord))) {
            this.parentEditorSet.returnToGeneralActively();
            return;
        }
        if (!this.target) {
            this.createTarget();
            return;
        }
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord);
                this.state = !snode
                    ? EventCurveEditorState.select
                    : EventCurveEditorState.selecting;
                if (snode && snode.target instanceof EventNode) {
                    this.selectedNode = snode.target;
                    this.dispatchEvent(
                        new KPANodeSelectedEvent(this.selectedNode),
                    );
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                this.placeNode(null);
                this.state = EventCurveEditorState.selecting;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }

    upHandler(event: MouseEvent | TouchEvent) {
        // 这个方法和上面那个数值事件编辑器其实是一样的
        const canvasCoord = (this.canvasPoint = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        ));
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [
                    this.startingCanvasPoint.x,
                    canvasCoord.x,
                ].sort((a, b) => a - b);
                const [sy, ey] = [
                    this.startingCanvasPoint.y,
                    canvasCoord.y,
                ].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array
                    .map((x) => x.target)
                    .filter((x) => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.nodesSelection = this.nodesSelection.union(
                            new Set(nodes),
                        );
                        break;
                    case SelectState.replace:
                        this.nodesSelection = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.nodesSelection = this.nodesSelection.difference(
                            new Set(nodes),
                        );
                        break;
                }
                this.nodesSelection = new Set(
                    [...this.nodesSelection].filter(
                        (note: EventStartNode<any>) => !!note.parentSeq,
                    ),
                );
                // console.log("bp")
                if (this.nodesSelection.size !== 0) {
                    this.dispatchEvent(
                        new KPANodeScopeselectedEvent(this.nodesSelection),
                    );
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    override calculatePos(
        beats: number,
        node: EventStartNode<RGB> | EventEndNode<RGB>,
        seqIndex: number,
        total: number,
    ): [number, number] {
        const x = ((seqIndex + 0.5) / total - 0.5) * this.innerWidth;
        return [
            x,
            -(TC.toBeats(node.time) - beats) * this.timeRatio +
                this.innerHeight * this.timeBasis,
        ];
    }

    override strokeCurve(
        context: CanvasRenderingContext2D,
        startNode: NonLastStartNode<RGB>,
        endNode: EventEndNode<RGB>,
        startXY: [number, number],
        endXY: [number, number],
        beats: number,
    ): void {
        if (this.nodesSelection.has(startNode)) {
            // 在外面已经设定了strokeStyle，因此这里不需要
            drawLine(context, startXY[0], startXY[1], endXY[0], endXY[1]);
            return;
        }
        const gradient = context.createLinearGradient(
            startXY[0],
            startXY[1],
            endXY[0],
            endXY[1],
        );
        const startValue = startNode.value;
        const endValue = endNode.value;

        gradient.addColorStop(0, rgb(...startValue));
        gradient.addColorStop(1, rgb(...endValue));
        const evaluator = startNode.evaluator;
        if (
            !(evaluator instanceof EasedEvaluator) ||
            evaluator.easing !== linearEasing
        ) {
            for (let i = 1; i < COLOR_INTERPOLATION_MAX_STOPS; i++) {
                const pos = COLOR_INTERPOLATION_STEP * i;
                const val: RGB =
                    evaluator instanceof ColorEasedEvaluator
                        ? evaluator.convert(startValue, endValue, pos)
                        : evaluator instanceof ExpressionEvaluator
                          ? evaluator.func(pos)
                          : evaluator instanceof MacroEvaluator
                            ? evaluator.consumers.get(startNode)?.func(pos)
                            : evaluator.eval(
                                  startNode,
                                  TC.toBeats(startNode.time) +
                                      pos *
                                          (TC.toBeats(endNode.time) -
                                              TC.toBeats(startNode.time)),
                              );
                // UNREACHABLE, theoretically
                gradient.addColorStop(pos, rgb(...val));
            }
        }
        context.strokeStyle = gradient;
        drawLine(context, startXY[0], startXY[1], endXY[0], endXY[1]);
    }

    override strokeLastLineSegment(
        context: CanvasRenderingContext2D,
        startNode: EventStartNode<RGB>,
        startXY: [number, number],
    ): void {
        context.strokeStyle = rgb(...startNode.value);
        drawLine(
            context,
            startXY[0],
            startXY[1],
            startXY[0],
            -this.clippingRect[3] / 2,
        );
    }
}
