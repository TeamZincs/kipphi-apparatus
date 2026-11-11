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
/** 事件节点颜色：开始蓝、结束红、同值联动组紫 */
const NODE_START_COLOR = "#4c8dff";
const NODE_END_COLOR = "#f2545b";
const NODE_LINKED_COLOR = "#a855f7";

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
            const editor = this.activatedEditor;

            // 正在轴向拖动：只平移，不转发给编辑器的 moveHandler
            if (this.pan) {
                this.panBy(event);
                this.draw();

                return;
            }

            editor.moveHandler(event);

            /*
             * 指针第一次进画布才起预览：
             *   · 从「笔」按钮拖出来 → 放一个节点
             *   · 从「粘贴」按钮拖出来 → 整串节点跟着指针
             */
            if ((this.dragPlaceMode || this.pendingPaste) && !editor.previewPoint) {
                if (this.pendingPaste) {
                    (editor as unknown as { pastePreviewMode: boolean }).pastePreviewMode = true;
                }

                editor.beginPreview();
            } else {
                editor.movePreview();
            }

            this.draw();
        });
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            // 按钮优先：命中就吃掉这次事件，不走编辑器的选中逻辑
            const point = this.pointerInBitmap(event);

            if (
                (this.modesVisible && this.modeButtons.press(point.x, point.y)) ||
                this.navButtons.press(point.x, point.y) ||
                // 总览里框选按钮不画，也不能被点中
                (this.modesVisible && this.scopeButtons.press(point.x, point.y)) ||
                this.zoomButtons.press(point.x, point.y)
            ) {
                // 记住这次按下属于按钮：松手时**不能**再交给编辑器，
                // 否则它的 upHandler 会把刚切好的模式又改回去（表现为"切了没用"）
                this.buttonPressed = true;
                this.draw();

                return;
            }

            // 待粘贴：这一下只用来定位，松手才真的粘（和"放节点"同一套手感）
            if (this.pendingPaste) {
                const pasteEditor = this.activatedEditor as unknown as {
                    pastePreviewMode: boolean;
                };

                // 预览要画整串节点，而不是一个
                pasteEditor.pastePreviewMode = true;

                // 先把指针位置交给编辑器（它会更新 pointedTime / pointedValue）
                this.activatedEditor.moveHandler(event);
                this.activatedEditor.beginPreview();
                this.pasting = true;
                this.draw();

                return;
            }

            this.buttonPressed = false;
            this.activatedEditor.downHandler(event);

            // 点空白处（选完之后仍是 select）= 开始轴向拖动
            if (this.activatedEditor.state === EventCurveEditorState.select) {
                const anyEditor = this.activatedEditor as unknown as {
                    valueRange?: [number, number];
                    autoRangeEnabled?: boolean;
                    xPanning?: boolean;
                };

                this.pan = {
                    x: point.x,
                    y: point.y,
                    range: anyEditor.valueRange
                        ? [...anyEditor.valueRange]
                        : [0, 0],
                    autoRange: anyEditor.autoRangeEnabled ?? false,
                };

                /*
                 * 横向拖动期间关掉 autoRange —— 否则每帧的 `adjust()` 都会
                 * 按"当前帧内的节点值"把视野拽回去，手指怎么拖都不动。
                 * 松手时（mouseup）恢复成按下前的值。
                 */
                if (this.panAxis === "x" && anyEditor.autoRangeEnabled) {
                    anyEditor.autoRangeEnabled = false;
                    anyEditor.xPanning = true;
                }
            }

            this.draw();
        });
        on(["mouseup", "touchend"], this.canvas, (event) => {
            // onClick 是在 release 里触发的，必须先交给按钮
            const point = this.pointerInBitmap(event);

            this.modeButtons.release(point.x, point.y);
            this.navButtons.release(point.x, point.y);
            this.scopeButtons.release(point.x, point.y);
            this.zoomButtons.release(point.x, point.y);

            if (this.buttonPressed) {
                this.buttonPressed = false;
                this.draw();

                return;
            }

            // 轴向拖动结束：把 autoRange 还回去（alpha 之类的类型本来是关着的）
            if (this.pan) {
                const anyEditor = this.activatedEditor as unknown as {
                    autoRangeEnabled?: boolean;
                    xPanning?: boolean;
                };

                anyEditor.autoRangeEnabled = this.pan.autoRange;
                anyEditor.xPanning = false;
            }

            this.pan = null;

            // 粘贴定位的松手：在 pointer 处落子
            if (this.pasting) {
                this.pasting = false;
                this.pendingPaste = false;
                (this.activatedEditor as unknown as { pastePreviewMode: boolean })
                    .pastePreviewMode = false;
                this.activatedEditor.clearPreview();
                // `paste` 同样只在泛型子类上
                (
                    this.activatedEditor as unknown as {
                        paste: (deletesOriginal?: boolean, keepOriginalSeq?: boolean) => void;
                    }
                ).paste(false, false);
                this.draw();

                return;
            }

            // 画布上按下起的预览：松手就在这里落子
            if (this.activatedEditor.previewPoint) {
                this.activatedEditor.commitPreview();
                // 从「笔」按钮进来的就回到原模式，手动在 edit 里点的留在 edit
                this.finishPlacement();
                this.draw();

                return;
            }

            this.activatedEditor.upHandler(event);

            // 松手：放大镜回到 1x（选中状态保留）
            this.activatedEditor.resetMagnifier();

            this.draw();
        });
        /**
         * 滚轮只转发给**当前激活**的编辑器。
         *
         * 三个子编辑器（总览 / 曲线 / 特效）共用同一张画布，如果各自在构造函数里挂
         * wheel，一次滚动会触发 3 次（`stopPropagation` 挡不住同元素上的其它监听器），
         * 于是时间跳三倍，还会让没激活的那个也去绘制、报「序列不存在」。
         */
        // 同理挂在父容器上：canvas 被浮层盖住时收不到 wheel
        (this.canvas.parentElement ?? this.canvas).addEventListener(
            "wheel",
            (event) => this.wheelHandler(event),
            { passive: false },
        );
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
    /**
     * 桌面端有个全局设置 `KPASettings.useRpeWheel`（滚轮方向反过来）。
     * 由页面把它透传到这里，编辑器自己不去读设置。
     */
    wheelReversed = false;

    /** 轴向锁定（时间 / 横轴），和音符编辑器同一套语义 */
    panAxis: "time" | "x" = "time";

    /**
     * 第一排：三个状态按钮。
     *
     * **靠右排**：左边是总览的层级按钮、曲线视图的"返回总览"，放左边会挡住。
     */
    readonly modeButtons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        gap: 6,
        align: "right"
    });

    /** 第二排：判定线切换 + 轴向锁定 + 详细信息（同样靠右） */
    readonly navButtons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        y: 14 + 40 + 6,
        gap: 6,
        align: "right"
    });

    /** 第三排：三种框选模式 */
    readonly scopeButtons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        y: 14 + (40 + 6) * 2,
        gap: 6,
        align: "right"
    });

    /**
     * 放大镜档位：**纵向**一列，贴左上角。
     *
     * 右上角被三排工具栏占着，塞进去会挤成一长条；纵向排也符合
     * "逐级放大"的语义。
     */
    readonly zoomButtons = new ButtonManager("screen", {
        kind: "column",
        x: 14,
        y: 14,
        size: 40,
        step: 46
    });

    /** 模式按钮当前是否可见（总览里不显示） */
    private modesVisible = false;

    /** 这次按下落在按钮上（松手时不要转发给子编辑器） */
    private buttonPressed = false;

    /** 按住"编辑"按钮拖到画布上放节点 */
    private dragPlaceMode = false;

    /** 点了"粘贴"按钮，等着在曲线上点目标位置 */
    private pendingPaste = false;

    /** 按住"粘贴"按钮拖出来放的（松手在画布上就粘） */
    private dragPasteMode = false;

    /** 这一次按下是为了定位粘贴（松手才真的粘） */
    private pasting = false;

    /**
     * 通过「笔」按钮进入 edit 之前的模式。
     *
     * 从按钮进来的"放一个节点"是一次性的，放完应该回到原来的模式；
     * 直接在 edit 模式里连点的则留在 edit。
     */
    private modeBeforeEdit: EventCurveEditorState | null = null;

    /**
     * 轴向拖动（select 模式下点空白处按住拖）。
     *
     * 拖什么看 `panAxis`：`"time"` 竖向拖时间（走 `timescroll` → 页面 seek），
     * `"x"` 横向平移值的窗口（改子编辑器的 `valueRange`，只是视图，不写谱面）。
     */
    private pan: {
        x: number;
        y: number;
        range: [number, number];
        /** 按下时子编辑器的 `autoRangeEnabled`，松手要还回去 */
        autoRange: boolean;
    } | null = null;

    private panBy(event: MouseEvent | TouchEvent): void {
        const pan = this.pan;

        if (!pan) return;

        const point = this.pointerInBitmap(event);
        const dx = point.x - pan.x;
        const dy = point.y - pan.y;

        if (this.panAxis === "time") {
            const timeRatio = this.activatedEditor.timeRatio;

            if (!timeRatio) return;

            // 事件画布的时间轴是向上递增的（`matrix` 里 `-timeRatio`），
            // 所以往下拖 = 时间前进，符号和音符画布相反
            const deltaBeats = dy / timeRatio;

            pan.y = point.y;

            if (Math.abs(deltaBeats) > 1e-6) this.scrollTimeBy(deltaBeats);

            return;
        }

        const anyEditor = this.activatedEditor as unknown as {
            valueRange?: [number, number];
            valueRatio?: number;
        };

        if (!anyEditor.valueRange || !anyEditor.valueRatio) return;

        const deltaValue = -dx / anyEditor.valueRatio;

        anyEditor.valueRange = [
            pan.range[0] + deltaValue,
            pan.range[1] + deltaValue,
        ];
    }

    /** 当前激活的编辑器自己的状态 */
    private modeButtonList(): CanvasButton[] {
        const state = this.activatedEditor.state;
        const selecting = state === EventCurveEditorState.selecting;
        const scoping =
            state === EventCurveEditorState.selectScope ||
            state === EventCurveEditorState.selectingScope;

        return [
            {
                id: "select",
                icon: (selecting ? "selecting" : "select") as IconName,
                active: state === EventCurveEditorState.select || selecting,
                onClick: () => this.setMode("select")
            },
            {
                id: "scope",
                icon: (state === EventCurveEditorState.selectingScope
                    ? "selectingScope"
                    : "selectScope") as IconName,
                active: scoping,
                onClick: () => this.setMode("scope")
            },
            {
                id: "edit",
                icon: "edit" as IconName,
                active: state === EventCurveEditorState.edit,
                // 按下"笔"之后可以拖到画布上放节点
                onPress: () => {
                    const editor = this.activatedEditor;
                    const previous = editor.state;

                    this.setMode("edit");
                    this.dragPlaceMode = true;
                    // 记住进来之前的模式：放完要回到它
                    this.modeBeforeEdit =
                        previous === EventCurveEditorState.edit
                            ? null
                            : previous;
                },
                onRelease: (inside: boolean) => {
                    const placing = this.dragPlaceMode;

                    this.dragPlaceMode = false;

                    // 松手还在按钮上 = 普通点击（只切模式）
                    if (inside || !placing) {
                        this.activatedEditor.clearPreview();
                        this.draw();

                        return;
                    }

                    this.activatedEditor.commitPreview();
                    // 放完回到进"笔"之前的模式
                    this.finishPlacement();
                    this.draw();
                }
            }
        ];
    }

    /** 一律落在基础态（不是 selecting / selectingScope） */
    private setMode(mode: "select" | "scope" | "edit"): void {
        const editor = this.activatedEditor;

        // 手动切模式就不再有"放完回原模式"这回事（笔按钮会在 setMode 之后另行设置）
        this.modeBeforeEdit = null;

        editor.state =
            mode === "edit"
                ? EventCurveEditorState.edit
                : mode === "scope"
                  ? EventCurveEditorState.selectScope
                  : EventCurveEditorState.select;

        // 进范围选择必须带上合并方式，否则松手时 `switch (selectState)` 一个都不命中
        if (mode === "scope") editor.selectState = editor.lastSelectState;

        this.draw();
    }

    /** 落子之后：如果是从「笔」按钮进来的，就回到原来的模式 */
    private finishPlacement(): void {
        const previous = this.modeBeforeEdit;

        this.modeBeforeEdit = null;

        if (previous !== null) this.activatedEditor.state = previous;
    }

    /** 切范围选择的合并方式，并进入 selectScope */
    private setSelectState(state: SelectState): void {
        const editor = this.activatedEditor;

        editor.lastSelectState = state;
        editor.selectState = state;
        editor.state = EventCurveEditorState.selectScope;
        this.draw();
    }

    private navButtonList(): CanvasButton[] {
        const buttons: CanvasButton[] = [
            { id: "prev-line", icon: "previousLine", onClick: () => this.stepLine(-1) },
            { id: "current-line", label: `#${this.targetLine?.id ?? "-"}` },
            { id: "next-line", icon: "nextLine", onClick: () => this.stepLine(1) }
        ];

        /*
         * 总览（`general`）只负责"选层 / 进序列"，下面这两样在那里没有意义：
         *   · 轴向锁定 —— 总览不拖动时间轴
         *   · 详细信息 —— 总览里没有"选中节点"
         * 所以只在具体序列的编辑器里追加。
         */
        if (!this.modesVisible) return buttons;

        /*
         * 剪贴板相关的成员只存在于泛型子类 `EventSequenceEditor<VT>` 上，
         * 这里拿到的 `activatedEditor` 是基类类型，收窄一次比给基类加空实现干净。
         */
        const editor = this.activatedEditor as unknown as {
            nodesSelection: Set<unknown>;
            clipboard: Set<unknown> | null;
            copy: () => void;
        };

        buttons.push(
            {
                // 方向箭头直白表示"现在能往哪边拖"
                id: "axis-lock",
                icon: (this.panAxis === "x"
                    ? "axisX"
                    : "axisTime") as IconName,
                onClick: () => {
                    this.panAxis = this.panAxis === "time" ? "x" : "time";
                    this.draw();
                }
            },
            {
                /*
                 * 同值联动：连续同值的节点变紫，拖其中一个整组一起动。
                 * 只有数值事件有"同值"语义（文本 / 颜色没有），基类的判断
                 * 默认返回 false，所以这里不需要按类型分支。
                 *
                 * 图标是手画的：绑定 = 实心圆，未绑定 = 空心圆 + 中间一条实线。
                 */
                id: "same-value",
                // 靠图标区分状态就够了（active 会让底色变蓝，和实心圆叠在一起太花）
                paint: (context, x, y, size, color) => {
                    const radius = size / 2;
                    const lineWidth = Math.max(1.5, size * 0.09);

                    context.save();
                    context.strokeStyle = color;
                    context.fillStyle = color;
                    context.lineWidth = lineWidth;

                    if (this.activatedEditor.sameValueLinked) {
                        context.beginPath();
                        context.arc(x, y, radius, 0, Math.PI * 2);
                        context.fill();
                    } else {
                        context.beginPath();
                        context.arc(
                            x,
                            y,
                            radius - lineWidth / 2,
                            0,
                            Math.PI * 2
                        );
                        context.stroke();

                        context.beginPath();
                        context.moveTo(x - radius, y);
                        context.lineTo(x + radius, y);
                        context.stroke();
                    }

                    context.restore();
                },
                onClick: () => {
                    this.activatedEditor.sameValueLinked =
                        !this.activatedEditor.sameValueLinked;
                    this.draw();
                }
            },
            {
                // 复制当前选中的节点（粘到别处）
                id: "copy",
                icon: "copy" as IconName,
                disabled: editor.nodesSelection.size === 0,
                onClick: () => {
                    editor.copy();
                    this.draw();
                }
            },
            {
                /*
                 * 两种用法：
                 *   · 点一下 → 进入"待粘贴"，再在曲线上点目标位置（松手才粘）
                 *   · 按住拖到画布上 → 松手就在那里粘
                 */
                id: "paste",
                icon: "paste" as IconName,
                disabled: (editor.clipboard?.size ?? 0) === 0,
                onPress: () => {
                    this.pendingPaste = true;
                    this.dragPasteMode = true;
                },
                onRelease: (inside: boolean) => {
                    const dragging = this.dragPasteMode;

                    this.dragPasteMode = false;

                    if (inside) {
                        // 松手还在按钮上 = 普通点击，留着待粘贴等下一次点画布
                        this.draw();

                        return;
                    }

                    const pasteEditor = this.activatedEditor as unknown as {
                        paste: (d?: boolean, k?: boolean) => void;
                        pastePreviewMode: boolean;
                        previewPoint: unknown;
                    };

                    if (dragging && pasteEditor.previewPoint) {
                        this.activatedEditor.clearPreview();
                        pasteEditor.paste(false, false);
                    }

                    pasteEditor.pastePreviewMode = false;
                    this.pendingPaste = false;
                    this.draw();
                }
            },
            {
                // 详细信息：交给页面弹底部面板
                id: "inspect",
                icon: "info" as IconName,
                disabled: !this.activatedEditor.selectedNode,
                onClick: () => this.dispatchEvent(new Event("inspect"))
            }
        );

        return buttons;
    }

    /** 第三排：三种范围选择方式（点一下就进 selectScope） */
    private scopeButtonList(): CanvasButton[] {
        return (
            [
                ["scope-replace", SelectState.replace, "scopeReplace"],
                ["scope-add", SelectState.extend, "scopeAdd"],
                ["scope-sub", SelectState.exclude, "scopeSub"],
            ] as const
        ).map(([id, state, icon]) => ({
            id,
            icon: icon as IconName,
            active:
                this.activatedEditor.state ===
                    EventCurveEditorState.selectScope &&
                this.activatedEditor.selectState === state,
            onClick: () => this.setSelectState(state)
        }));
    }

    /** 换判定线：改自己的 target，再发事件让页面回灌 `selectedLineId` */
    private stepLine(delta: number): void {
        const chart = this.operationList?.chart;

        if (!chart) return;

        const lines = [...chart.judgeLines].sort((a, b) => a.id - b.id);
        const index = lines.findIndex((line) => line === this.targetLine);

        if (index < 0) return;

        const next = lines[(index + delta + lines.length) % lines.length];

        if (!next || next === this.targetLine) return;

        this.changeTarget({ judgeLine: next });
        this.dispatchEvent(
            Object.assign(new Event("targetchange"), { judgeLine: next })
        );
        this.draw();
    }

    private drawToolbars(): void {
        // 外层自己**没有** `context` 字段（那是子编辑器的），从 canvas 现取
        const context = this.canvas.getContext("2d");

        if (!context) return;

        this.modeButtons.setViewportWidth(this.canvas.width);
        this.navButtons.setViewportWidth(this.canvas.width);

        // 总览里模式没用（只能选层 / 进序列），把换线那排顶到第一行
        this.modesVisible = this.activatedEditor !== this.general;
        this.navButtons.setLayout({
            kind: "toolbar",
            size: 40,
            margin: 14,
            y: this.modesVisible ? 14 + 40 + 6 : 14,
            gap: 6,
            align: "right"
        });

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);

        if (this.modesVisible) {
            this.modeButtons.draw(context, this.modeButtonList());
        }

        this.navButtons.draw(context, this.navButtonList());

        // 框选在总览里也没意义：那里选的是"层"，不是节点
        if (this.modesVisible) {
            this.scopeButtons.draw(context, this.scopeButtonList());
        }

        this.zoomButtons.draw(
            context,
            this.activatedEditor.magnifierButtons()
        );

        context.restore();
    }

    /** 事件坐标 -> 位图像素坐标（按钮是屏幕空间画的） */
    private pointerInBitmap(event: MouseEvent | TouchEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const source =
            "touches" in event
                ? (event.touches[0] ?? event.changedTouches[0])
                : (event as MouseEvent);
        const scaleX = rect.width ? this.canvas.width / rect.width : 1;
        const scaleY = rect.height ? this.canvas.height / rect.height : 1;

        return {
            x: (source.clientX - rect.left) * scaleX,
            y: (source.clientY - rect.top) * scaleY
        };
    }

    /**
     * 滚轮滑时间。
     *
     * delta 从**外层**派发：三个子编辑器是各自独立的 `EventTarget`，
     * 它们派的事件到不了页面（页面监听的是外层这个实例）。
     */
    wheelHandler(event: WheelEvent): boolean {
        if (event.ctrlKey) return false;

        event.preventDefault();
        event.stopPropagation();

        const editor = this.activatedEditor;

        if (this.panAxis === "x") return true;

        const sign = this.wheelReversed ? -1 : 1;
        const deltaBeats = (event.deltaY / 100) * (editor.timeSpan / 10) * sign;

        this.scrollTimeBy(deltaBeats);

        return true;
    }

    /**
     * 滑时间：**自己先重画**，再把事件抛给页面去 seek。
     *
     * 只派事件是不够的 —— 页面 seek 之后要靠播放器的 `drawn` 回来重绘，
     * 而 `drawn` 在暂停时不一定触发（还有 `showingGrid` 之类的开关），
     * 结果就是"进度动了、画布没动"。
     */
    scrollTimeBy(deltaBeats: number): void {
        this.lastBeats = (this.lastBeats ?? 0) + deltaBeats;

        this.dispatchEvent(Object.assign(new Event("timescroll"), { deltaBeats }));

        this.draw(this.lastBeats);
    }

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

        /*
         * 放大镜：只推进 0.4s 动画。缩放围绕"按住的那一点"由子编辑器的
         * `updateMatrix` 完成，这里不再改 `timeBasis` —— 画面不会跳。
         */
        const editor = this.activatedEditor;

        editor.magnifier.tick();

        if (editor === this.easing) {
            this.easing.draw(this.easingBeats);
        } else {
            editor.draw(beats);
        }

        // 预览准星画在节点之上（子编辑器的 draw 用完自己的变换后会还原）
        editor.drawPreviewMarker();

        // 局部视图盖在内容上、按钮下面
        editor.drawMagnifier();

        // 按钮画在**屏幕坐标**上（子编辑器的 draw 里是相机变换），所以放在最后、单独复位
        this.drawToolbars();
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
/**
 * 去掉浮点误差的尾巴：保留 6 位小数。
 *
 * `1.1 * 3` 会得到 `3.3000000000000003`，一路带到网格标签、节点值、导出的
 * 谱面里都非常难看。所有"算出来的值"落盘 / 落屏之前都过一遍这里。
 */
export function roundValue(value: number): number {
    if (!Number.isFinite(value)) return value;

    return Math.round(value * 1e6) / 1e6;
}

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
        // 累加出来的值每次都过一遍 `roundValue`，别让误差滚雪球
        const val = roundValue(k * i + b);
        attachable.push(val);
        if (val > right) break;
    }
    return attachable;
}

/** 值网格线太少就补密（放大后只剩两三根线没参考意义） */
export const GRID_MIN_LINES = 5;
/** 超过这个条数说明 1x 的密度本身就不合理，放弃加密 */
export const GRID_MAX_LINES = 50;

/**
 * 放大时该用多细的值网格。
 *
 * 规则（按需求定的）：
 *   · 加密后总条数 **超过 50** → 认为 1x 时设的密度本来就不合理，**不加密**；
 *   · 不到 **5 条** → 继续试 3 / 4 / 5 倍，别让画面空荡荡；
 *   · 步长优先保持**整数**：`baseSpan` 能被倍数整除才用，否则退到 3 倍、5 倍；
 *   · `baseSpan === 1` 是例外，此时允许小数（0.5 / 0.25…）。
 *
 * 抽成纯函数是为了能直接测（编辑器实例要 canvas / operationList，太重）。
 *
 * @param baseSpan    1x 时的值网格间隔
 * @param zoom        当前放大倍数（<= 1 表示没放大）
 * @param rangeLength 值域长度，用来估算条数
 */
export function chooseGridStep(
    baseSpan: number,
    zoom: number,
    rangeLength: number,
): number {
    if (!(zoom > 1) || !(baseSpan > 0) || !(rangeLength > 0)) return baseSpan;

    const lines = (step: number) => rangeLength / step;
    const tooMany = (step: number) => lines(step) > GRID_MAX_LINES;

    /*
     * 候选倍数：
     *   · `baseSpan === 1` → 只可能靠小数加密；
     *   · 其它情况优先挑能**整除** `baseSpan` 的倍数，网格才落在整数上。
     */
    const candidates: number[] = [];

    if (baseSpan === 1) {
        for (let m = 2; m <= 64; m *= 2) candidates.push(m);
    } else {
        for (const m of [2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 50]) {
            if (baseSpan % m === 0) candidates.push(m);
        }

        // 谁都不整除（比如 7）→ 允许步长带小数
        if (candidates.length === 0) {
            for (let m = 2; m <= 32; m *= 2) candidates.push(m);
        }
    }

    let chosen = baseSpan;

    for (const m of candidates) {
        if (m < zoom) continue; // 还没到当前放大倍数

        const step = baseSpan / m;

        // 再细就过密：说明 1x 的密度本来就不合理，整体放弃
        if (tooMany(step)) break;

        chosen = step;

        // 条数够了就收（不到 5 条就继续升倍）
        if (lines(step) >= GRID_MIN_LINES) break;
    }

    return chosen;
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

/**
 * 从当前帧内的节点值里挑一个"能整除最多值"的网格步长。
 *
 * **负值必须先取绝对值**：`anything % -1 === 0` 恒成立，往左拖把节点拖成
 * 负数之后，`-1` 会以"整除所有值"的身份被选中，再经 `divideOrMul` 变成 1
 * —— 网格立刻密铺满整个画布（往右拖不会触发，因为正数取模不恒为零）。
 *
 * @param values      当前帧内的节点值（可能含负数）
 * @param baseSpan    该事件类型的默认步长
 * @param rangeLength 值域长度，用来估算"画面里放几条线合适"
 */
export function pickValueGridSpan(
    values: number[],
    baseSpan: number,
    rangeLength: number,
): number {
    let span = baseSpan;
    let priority = 0;

    for (const raw of values) {
        /*
         * 节点值本身可能带误差（拖到 5.5 实际是 5.500000000000001），先规整再
         * 参与整除判断 —— 否则会挑出 `1.1000000000000003` 这种步长。
         */
        const candidate = roundValue(Math.abs(raw));

        if (!(candidate > 0)) continue;

        const hits = values.reduce(
            (acc, cur) => (cur % candidate === 0 ? acc + 1 : acc),
            0,
        );

        if (hits > priority * 1.2) {
            priority = hits;
            span = candidate;
        }
    }

    span = roundValue(divideOrMul(span, 10 / (rangeLength / span)));

    // 兜底：负 / NaN / 0 一律退回类型默认步长
    return span > 0 && Number.isFinite(span) ? span : baseSpan;
}

export abstract class EventSequenceEditorBase extends EventTarget {
    targetLine: JudgeLine;

    innerHeight: number;
    innerWidth: number;

    readonly context: CanvasRenderingContext2D;
    timeRatio: number;

    timeSpan: number;

    /**
     * 轴向锁定（和音符编辑器同一套语义）：
     *   · `"time"` —— 滚轮/拖动滑时间；
     *   · `"x"`    —— 时间锁住，只允许横向平移。
     */
    panAxis: "time" | "x" = "time";

    /**
     * 同值联动：开启后，**连续同值**的节点视为一组 —— 拖任意一个就整组
     * 一起改值，这些段也画成紫色。
     *
     * 放在基类是因为按钮栏（`EventSequenceEditors`）只能拿到基类类型；
     * 「是不是一组」的判断在数值子类里（`isSameValueLinked`）。
     */
    sameValueLinked = false;

    /** 放大镜：按住节点时放大主视图 + 侧边局部视图（和音符画布同一套） */
    readonly magnifier = new Magnifier();

    /**
     * 主视图放大时的缩放中心（按下那一刻）。
     *
     * 局部视图用 `magnifier.anchor` 跟手，主视图必须用这个固定值 ——
     * 否则拖动时视野会跟着节点一起跑（自激）。
     *
     * 缩放本身由 `updateMatrix` 围绕"按住的那一点"完成，不再改 `timeBasis`。
     */
    protected zoomAnchor: { x: number; y: number } | null = null;

    /**
     * 拖动开始那一刻的矩阵逆。
     *
     * 输入映射（指针 → 世界坐标）用它在整个拖动期间保持**固定**，而视野
     * （`matrix`）跟着节点走 —— 两者解耦才不会自激。
     */
    protected dragMatrixInverted: Matrix33 | null = null;

    /**
     * 缩放中心在画布上的**屏幕位置**（按下那一刻，锁死）。
     *
     * 不能用 `magnifier.pointer`：那个拖动时每帧更新（局部视图靠它选角落），
     * 拿它当缩放中心会让画面跟着鼠标一起跑 —— 表现为"元素飞到对侧"。
     */
    protected zoomPointer: { x: number; y: number } | null = null;

    /** 松手 / 取消选中：收起放大镜 */
    resetMagnifier(): void {
        this.zoomAnchor = null;
        this.zoomPointer = null;
        this.magnifier.reset();
        this.dragMatrixInverted = null;
    }

    /** 侧边局部放大视图（按住节点时才有） */
    drawMagnifier(): void {
        if (!this.magnifier.active) return;

        const rect = insetRect(
            this.innerWidth,
            this.innerHeight,
            10,
            this.magnifier.pointer
        );
        const { context } = this;

        // 工具栏和局部视图都画在**屏幕坐标**上（子编辑器 draw 里是相机变换）
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);

        this.magnifier.drawInset(context, rect, (inner, scale, anchor) =>
            this.paintMagnified(inner, scale, anchor, rect[2])
        );

        context.restore();
    }

    /**
     * 局部视图的内容。
     *
     * 调用时原点已在框中心、`scale` 是相对主视图的倍率。
     * 基类只标一个中心点，数值子类补网格和节点。
     */
    protected paintMagnified(
        context: CanvasRenderingContext2D,
        _scale: number,
        _anchor: { x: number; y: number },
        _size: number
    ): void {
        context.fillStyle = "#4c8dff";
        context.beginPath();
        context.arc(0, 0, 5, 0, Math.PI * 2);
        context.fill();
    }

    /** 档位切换的 0.4s 动画：逐帧重绘直到插值结束 */
    protected animateZoom(): void {
        if (!this.magnifier.animatingNow) return;
        if (typeof requestAnimationFrame !== "function") return;

        requestAnimationFrame(() => {
            if (!this.magnifier.animatingNow) return;

            this.parentEditorSet.draw(this.lastBeats);
            this.animateZoom();
        });
    }

    /**
     * 放大镜的排形按钮：按住节点时才出现，当前 N 档就列出 2x…N×2 的下一档。
     */
    magnifierButtons(): CanvasButton[] {
        if (!this.magnifier.anchor) return [];

        const buttons: CanvasButton[] = [];

        for (let level = 1; level <= this.magnifier.levelIndex + 1; level += 1) {
            if (level >= ZOOM_LEVELS.length) break;

            buttons.push({
                id: `zoom-${ZOOM_LEVELS[level]}x`,
                label: `${ZOOM_LEVELS[level]}x`,
                active: this.magnifier.levelIndex === level,
                onClick: () => {
                    // 只有往更高档跳才重新锚定；降档沿用放大时的中心
                    if (level > this.magnifier.levelIndex) {
                    }

                    this.magnifier.setIndex(level);
                    this.dragMatrixInverted = null;
                    this.animateZoom();
                    this.parentEditorSet.draw(this.lastBeats);
                },
            });
        }

        return buttons;
    }



    //#region 放置预览（和音符画布同一套：对象还不存在，只画准星）
    /**
     * 预览位置（画布坐标）。松手才真正 `placeNode()`。
     *
     * 为什么不是"先建一个再拖"：建完再拖等于每个位置都留下一个节点，
     * 用户既看不到落点也没法取消。
     */
    previewPoint: { x: number; y: number } | null = null;

    beginPreview(): void {
        if (!this.canvasPoint) return;

        this.previewPoint = { x: this.canvasPoint.x, y: this.canvasPoint.y };
    }

    movePreview(): void {
        if (!this.previewPoint || !this.canvasPoint) return;

        this.previewPoint = { x: this.canvasPoint.x, y: this.canvasPoint.y };
    }

    clearPreview(): void {
        this.previewPoint = null;
    }

    /**
     * 松手落子。基类只清预览（总览里没有"落子"的概念），
     * 曲线编辑器在 `EventSequenceEditor<VT>` 里覆盖成真的 `placeNode()`。
     */
    commitPreview(): void {
        this.clearPreview();
    }

    /** 画准星（十字 + 圆圈），提示"节点会落在这里" */
    drawPreviewMarker(): void {
        if (!this.previewPoint) return;

        const { context } = this;
        const { x, y } = this.previewPoint;

        context.save();
        context.globalAlpha = 0.85;
        context.strokeStyle = "#6CF";
        context.lineWidth = 2;

        context.beginPath();
        context.arc(x, y, 7, 0, Math.PI * 2);
        context.stroke();

        context.beginPath();
        context.moveTo(x - 14, y);
        context.lineTo(x + 14, y);
        context.moveTo(x, y - 14);
        context.lineTo(x, y + 14);
        context.stroke();

        context.restore();
    }
    //#endregion

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
        this.context.font = `${scaleFont(30, this.canvas.width)}px Phigros`;

        this.timeSpan = 4;
        this.timeRatio = this.innerHeight / this.timeSpan;
        this.timeGridInterval = 1;
        this.initContext();

        // 滚轮监听**不在这里**：三个子编辑器共用同一张画布，各自挂一个会同时响应
        // （`stopPropagation` 拦不住同一元素上的其它监听器），于是滚一下跳好几倍、
        // 还会让没激活的那个也去 draw，报「序列不存在」。统一挂在外层，转发给激活的。

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

    /**
     * 相对拍数 → 屏幕 y（相对 context 原点，向下为正）。
     *
     * 基类（含总览）只有时间维度、也没有放大镜，手算就够；需要缩放的数值子类
     * 会用矩阵覆盖这个方法 —— 网格才会跟着缩放和偏移走。
     */
    protected beatToY(relativeBeats: number): number {
        return -(
            relativeBeats * this.timeRatio -
            this.timeSpan * this.timeBasis * this.timeRatio
        );
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
    /**
     * 滚轮 = 滑动时间（不是缩放）。一格约走可视范围的 1/10。
     *
     * 实际由外层 `EventSequenceEditors` 调用 —— 事件也从外层派发，
     * 否则子编辑器派的事件到不了页面（它们是各自独立的 EventTarget）。
     */
    wheelHandler(event: WheelEvent): boolean {
        if (event.ctrlKey) return false;

        event.preventDefault();
        event.stopPropagation();

        return true;
    }

    /**
     * 把视图时间推一段（负数 = 往前），并通知页面去 seek。
     *
     * 这里**不自己 draw**：外层 `EventSequenceEditors` 只画激活的那个编辑器，
     * 自己画会让没激活的分支也跑一遍（它可能还没有 target / sequence）。
     */
    scrollTimeBy(deltaBeats: number): void {
        this.dispatchEvent(Object.assign(new Event("timescroll"), { deltaBeats }));
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

        /*
         * 清屏 / 铺底色走**屏幕坐标**：放大时 context 原点被平移了
         * （见 `updateMatrix`），还按 `-boundWidth/2` 算会留下一圈残影。
         */
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.fillStyle = "#333d";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        // const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        // 画布上的状态文字（State / Beats / Selected …）已移到工具栏按钮里
        context.save();
        context.strokeStyle = this.timeGridColor;
        context.fillStyle = this.timeGridColor;

        context.lineWidth = 3;

        /*
         * 网格的纵向位置一律**过 `matrix`**，和节点同一套换算 —— 放大时
         * `matrix` 里带着缩放和偏移，网格跟着走就不会错位。
         */
        const anchor = this.magnifier?.zooming ? this.zoomAnchor : null;
        const center = anchor ? anchor.y : beats;

        /*
         * 遍历范围以 `center` 为**对称中心**取 `±timeSpan`。
         *
         * 之前按 `timeBasis` 偏（`(-0.5 + timeBasis)`）—— 那道偏移是给"未放大
         * 时 `beats` 在底部"用的；放大后 `center` 是视野正中，再套一层就只剩
         * 上半屏，表现为"下面缺几根时间线"。
         *
         * 非放大时 `center = beats`，多画半屏落在画布外，无害。
         */
        const stopBeats =
            Math.ceil((center + this.timeSpan) / timeGridSpan) * timeGridSpan;
        const startBeats =
            Math.ceil(
                (center - this.timeSpan) / timeGridSpan - 1,
            ) * timeGridSpan;

        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const y = this.beatToY(time - beats);

            // 横线铺满整块画布（`±innerWidth/2` 就是屏幕左右边缘）
            drawLine(context, innerWidth / 2, y, -innerWidth / 2, y);
            context.fillText(time + "", -innerWidth / 2 + 10, y);

            context.save();
            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorY = this.beatToY(time + i / timeDivisor - beats);

                drawLine(
                    context,
                    innerWidth / 2,
                    minorY,
                    -innerWidth / 2,
                    minorY,
                );
            }
            context.restore();
        }
        context.restore();
        context.lineWidth = 3;

        // 基线：`beats` 那一拍所在的位置
        const baselineY = this.beatToY(0);

        drawLine(
            context,
            innerWidth / 2,
            baselineY,
            -innerWidth / 2,
            baselineY,
        );
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;

        /*
         * 先写 `lastBeats` 再算矩阵：`updateMatrix` 的放大平移用的就是
         * `anchor.y - lastBeats`，晚一帧更新会让网格和节点差一帧。
         */
        this.lastBeats = beats;
        this.updateMatrix();

        const { context, selectionManager } = this;
        selectionManager.refresh();
        this.drawCoordination(beats);
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

import {
    DEFAULT_PALETTE,
    drawButton,
    roundRectPath,
    scaleFont,
    type ButtonPalette,
    type IconName,
} from "./ui";
import { ButtonManager, type CanvasButton } from "./buttonManager";
import {
    drawBeatLabel,
    formatGridValue,
    insetRect,
    Magnifier,
    splitBeats,
    ZOOM_LEVELS,
} from "./magnifier";

/** 总览里的层级 / line 按钮：沿用新样式，但选中态用**白底深字**而不是蓝底 */
const OVERVIEW_PALETTE: ButtonPalette = {
    ...DEFAULT_PALETTE,
    activeBackground: "#FFFFFF",
    activeForeground: "#111318",
};

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
        context.font = `${scaleFont(20, this.canvas.width)}px Phigros`;
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
            // 命中仍走原来的 Path2D（isPointInPath），这里只换外观
            const x = -0.475 * this.innerWidth;
            const y = -0.475 * this.innerHeight + 45 * i;

            drawButton(
                context,
                {
                    id: text,
                    spec: { id: text, label: text, active: text === this.layer },
                    x,
                    y,
                    width: 40,
                    height: 40,
                },
                OVERVIEW_PALETTE,
                { radius: 6, fontSize: 16 },
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
        context.font = `${scaleFont(20, this.canvas.width)}px Phigros`;
        for (let i = 0; i < size; i++) {
            const path = this.effectLineButtons[i];
            if (!path) continue;

            const label = `${first + i}`;

            drawButton(
                context,
                {
                    id: label,
                    spec: { id: label, label, active: first + i === this.effectLine },
                    x: 0.475 * innerWidth - 40,
                    y: -0.475 * innerHeight + 45 * i,
                    width: 40,
                    height: 40,
                },
                OVERVIEW_PALETTE,
                { radius: 6, fontSize: 16 },
            );
        }
        if (this.effectAddButton) {
            drawButton(
                context,
                {
                    id: "add",
                    spec: { id: "add", label: "+" },
                    x: 0.475 * innerWidth - 40,
                    y: -0.475 * innerHeight + 45 * size,
                    width: 40,
                    height: 40,
                },
                OVERVIEW_PALETTE,
                { radius: 6, fontSize: 16 },
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

        // 往下让半行：`labelY` 正好压在"事件末尾值"那一行的基线上，两串数字会叠一起
        const labelDrop = Math.round(scaleFont(20, this.canvas.width) * 0.9);

        context.fillText(type, offset, labelY + labelDrop);
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
    /** 范围选择方式：默认并集（原来只有 Shift 入口会设，按钮入口会是 undefined） */
    selectState: SelectState = SelectState.extend;
    lastSelectState: SelectState = SelectState.extend;

    selectedNode: EventStartNode<VT> | EventEndNode<VT> = null;

    autoRangeEnabled: boolean = true;

    clipboard: Set<EventStartNode<VT>> = new Set();

    /**
     * 该节点是否有「背靠背」的同值伙伴（交界处的 `end` 与下一个 `start`）。
     *
     * 基类不做判断；{@linkcode NumericEventCurveEditor} 按 `value` 实现。
     */
    protected isSameValueLinked(
        _node: EventStartNode<VT> | EventEndNode<VT>,
    ): boolean {
        return false;
    }

    /** 桌面 D / A：放大 / 缩小一级（没有按住时用当前选中的节点） */
    stepZoom(delta: number): void {
        if (!this.magnifier.anchor && this.selectedNode) {
            this.focusMagnifier();
        }

        if (!this.magnifier.anchor) return;

        // 只有放大才重新锚定；降档沿用放大到该级时的中心

        this.magnifier.step(delta);
        // 档位变了，输入映射的快照作废
        this.dragMatrixInverted = null;
        this.animateZoom();
        this.parentEditorSet.draw(this.lastBeats);
    }

    /** 按住节点 → 定住放大镜中心 */
    protected focusMagnifier(): void {
        const node = this.selectedNode;

        if (!node) {
            this.zoomAnchor = null;
            this.zoomPointer = null;
            this.magnifier.reset();

            return;
        }

        const anchor = {
            x: (node as EventStartNode<VT>).value as number,
            y: TC.toBeats(node.time),
        };

        // 主视图中心 / 缩放中心都锁在这里；拖动时只有 `magnifier.anchor` 跟手
        this.zoomAnchor = anchor;
        this.zoomPointer = this.canvasPoint
            ? { x: this.canvasPoint.x, y: this.canvasPoint.y }
            : null;

        this.magnifier.focus(
            anchor,
            // 手指位置决定局部视图放哪一角（别被挡住）
            this.canvasPoint
        );
    }
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
            // 桌面端：D 放大一级、A 缩小一级（焦点不在画布时上面已经 return 了）
            if (e.key.toLowerCase() === "d") {
                this.stepZoom(1);

                return;
            }

            if (e.key.toLowerCase() === "a") {
                this.stepZoom(-1);

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

    /**
     * 预览位置用**吸附后**的 value / time 算，和真节点同一套坐标
     *（`calculatePos()` 也是 `new Coordinate(value, beats - beats0).mul(matrix)`）。
     */
    private syncPreviewPoint(): void {
        if (!this.pointedTime || this.pointedValue === undefined) return;

        const offset = TC.toBeats(this.pointedTime) - (this.lastBeats ?? 0);
        const pos = new Coordinate(
            this.pointedValue as unknown as number,
            offset,
        ).mul(this.matrix);

        this.previewPoint = { x: pos.x, y: pos.y };
    }

    /** 外层进入"待粘贴"时置 true：预览要画**整串**节点 */
    pastePreviewMode = false;

    /**
     * 粘贴预览：剪贴板里每个节点的落点。
     *
     * 对齐规则照抄 `paste()`：最早的那个对齐到指针时间，其余整体平移
     *（`EventNode.setToNewOrderedArray` 就是这么排的）。
     */
    pasteGhosts: { value: number; time: TimeT }[] = [];

    private syncPasteGhosts(): void {
        const clipboard = this.clipboard;

        if (!clipboard || clipboard.size === 0 || !this.pointedTime) {
            this.pasteGhosts = [];

            return;
        }

        const nodes = [...clipboard] as unknown as {
            time: TimeT;
            value: unknown;
        }[];

        nodes.sort((a, b) => (TC.gt(a.time, b.time) ? 1 : -1));

        const offset = TC.sub(this.pointedTime, nodes[0]!.time);

        this.pasteGhosts = nodes.map((node) => ({
            value: node.value as number,
            time: TC.add(node.time, offset),
        }));
    }

    override clearPreview(): void {
        super.clearPreview();
        this.pasteGhosts = [];
    }

    override beginPreview(): void {
        this.syncPreviewPoint();

        if (this.pastePreviewMode) this.syncPasteGhosts();
    }

    override movePreview(): void {
        // 没有预览就别建 —— 否则任何模式下一移动指针都会冒出个幽灵节点
        if (!this.previewPoint) return;

        this.syncPreviewPoint();

        if (this.pastePreviewMode) this.syncPasteGhosts();
    }

    /**
     * 预览画**真节点的贴图**（North / South 那两张），半透明。
     *
     * 位置和 `drawSequence` 里一致：start 节点在曲线点**上方**、
     * end 节点在**下方**，这样预览一看就知道落点长什么样。
     */
    override drawPreviewMarker(): void {
        // 粘贴：整串一起画（只画一个看不出排列，也看不出会在哪几个位置落子）
        if (this.pasteGhosts.length > 0) {
            const { context } = this;
            const width = this.nodeWidth;
            const height = this.nodeHeight;
            const beats = this.lastBeats ?? 0;
            // `matrix` 在基类类型里没有声明，收窄一次（形状交给 Coordinate.mul 自己认）
            const matrix = (this as unknown as Record<string, never>)["matrix"];

            context.save();
            context.globalAlpha = 0.6;

            for (const ghost of this.pasteGhosts) {
                const pos = new Coordinate(
                    ghost.value,
                    TC.toBeats(ghost.time) - beats,
                ).mul(matrix);

                context.drawImage(
                    Images.START_NODE,
                    pos.x - width / 2,
                    pos.y - height,
                    width,
                    height,
                );
                context.drawImage(
                    Images.END_NODE,
                    pos.x - width / 2,
                    pos.y,
                    width,
                    height,
                );
            }

            context.restore();

            return;
        }

        if (!this.previewPoint) return;

        const { context } = this;
        const width = this.nodeWidth;
        const height = this.nodeHeight;
        const { x, y } = this.previewPoint;

        context.save();
        context.globalAlpha = 0.6;

        context.drawImage(
            Images.START_NODE,
            x - width / 2,
            y - height,
            width,
            height,
        );
        context.drawImage(Images.END_NODE, x - width / 2, y, width, height);

        context.restore();
    }

    /** 松手才真的建节点（预览阶段什么都没建） */
    override commitPreview(): void {
        if (!this.previewPoint) return;

        this.clearPreview();
        this.placeNode(this.pointedValue);
        // 留在 edit：可以接着放
        this.wasEditing = true;
        this.state = EventCurveEditorState.edit;
        this.draw(this.lastBeats);
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

        /*
         * 清屏 / 铺底色走**屏幕坐标**：放大时 context 原点被平移了
         * （见 `updateMatrix`），还按 `-boundWidth/2` 算会留下一圈残影。
         */
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.fillStyle = "#333d";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        // const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        // 画布上的状态文字（State / Beats / Selected …）已移到工具栏按钮里
        context.save();
        context.strokeStyle = this.timeGridColor;
        context.fillStyle = this.timeGridColor;

        context.lineWidth = 3;

        /*
         * 网格的纵向位置一律**过 `matrix`**，和节点同一套换算 —— 放大时
         * `matrix` 里带着缩放和偏移，网格跟着走就不会错位。
         */
        const anchor = this.magnifier?.zooming ? this.zoomAnchor : null;
        const center = anchor ? anchor.y : beats;

        /*
         * 遍历范围以 `center` 为**对称中心**取 `±timeSpan`。
         *
         * 之前按 `timeBasis` 偏（`(-0.5 + timeBasis)`）—— 那道偏移是给"未放大
         * 时 `beats` 在底部"用的；放大后 `center` 是视野正中，再套一层就只剩
         * 上半屏，表现为"下面缺几根时间线"。
         *
         * 非放大时 `center = beats`，多画半屏落在画布外，无害。
         */
        const stopBeats =
            Math.ceil((center + this.timeSpan) / timeGridSpan) * timeGridSpan;
        const startBeats =
            Math.ceil(
                (center - this.timeSpan) / timeGridSpan - 1,
            ) * timeGridSpan;

        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const y = this.beatToY(time - beats);

            // 横线铺满整块画布（`±innerWidth/2` 就是屏幕左右边缘）
            drawLine(context, innerWidth / 2, y, -innerWidth / 2, y);
            context.fillText(time + "", -innerWidth / 2 + 10, y);

            context.save();
            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorY = this.beatToY(time + i / timeDivisor - beats);

                drawLine(
                    context,
                    innerWidth / 2,
                    minorY,
                    -innerWidth / 2,
                    minorY,
                );
            }
            context.restore();
        }
        context.restore();
        context.lineWidth = 3;

        // 基线：`beats` 那一拍所在的位置
        const baselineY = this.beatToY(0);

        drawLine(
            context,
            innerWidth / 2,
            baselineY,
            -innerWidth / 2,
            baselineY,
        );
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
            context.textBaseline = "middle";

            // 提示文案里用 `\n` 分行：整句一行在窄屏上会超界（画布被裁掉一部分）
            const text =
                this.type !== EventType.easing
                    ? messages.NO_TARGET(
                          this.parentEditorSet.selectedLayer,
                          EventType[this.type],
                      )
                    : messages.NO_TARGET_EASING();
            const fontSize = scaleFont(24, this.canvas.width);
            const lines = text.split("\n");
            const lineHeight = Math.round(fontSize * 1.35);
            // 多行时整体居中：第一行往上抬
            const firstY = -((lines.length - 1) * lineHeight) / 2;

            context.font = `${fontSize}px Phigros`;

            lines.forEach((line, index) => {
                context.fillText(line, 0, firstY + index * lineHeight);
            });
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
            context.font = `${scaleFont(25, this.canvas.width)}px Phigros`;
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
        const width = this.innerWidth / 4;
        const height = this.innerHeight / 20;

        // 圆角矩形按钮，和其它按钮同一套样式（不是裸的矩形 + 文字）
        drawButton(
            context,
            {
                id: "return",
                spec: { id: "return", label: "← general" },
                x: -this.innerWidth / 2,
                y: -this.innerHeight / 2,
                width,
                height,
            },
            OVERVIEW_PALETTE,
            { radius: 6, fontSize: Math.max(12, Math.round(height * 0.5)) },
        );

        selectionManager.add({
            left: -this.innerWidth / 2,
            top: -this.innerHeight / 2,
            width: this.innerWidth / 4,
            height: this.innerHeight / 20,
            target: "return",
            priority: 10,
        });
    }
    /**
     * 画一个节点方块。
     *
     * 用 canvas 直接画（圆角矩形），不再用贴图 —— 贴图没法按状态换色，
     * 而"同值联动"需要把整组节点染紫。
     */
    protected paintNode(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
    ): void {
        context.save();
        roundRectPath(
            context,
            x,
            y,
            width,
            height,
            Math.min(width, height) * 0.28,
        );
        context.fillStyle = color;
        context.fill();
        context.restore();
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
            /*
             * 背靠背联动：**交界处**成对的那两个才变紫，线本身保持原色。
             *
             * 一段内部的 `start → end` 隔着整段时间（面对面），各自判断；
             * 序列第一个 start 左边没有 end，天然配不上对，也就不会紫。
             */
            const linkedStart =
                this.sameValueLinked && this.isSameValueLinked(startNode);
            const linkedEnd =
                this.sameValueLinked && this.isSameValueLinked(endNode);

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

            // 节点用 canvas 直接画（不再用贴图）：开始蓝、结束红、成对的紫
            this.paintNode(
                context,
                leftX,
                topY - sheight,
                swidth,
                sheight,
                linkedStart ? NODE_LINKED_COLOR : NODE_START_COLOR,
            );
            this.paintNode(
                context,
                leftEndX,
                topEndY,
                ewidth,
                eheight,
                linkedEnd ? NODE_LINKED_COLOR : NODE_END_COLOR,
            );
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
            // 末段起点同样只看左边的交界处（第一个 start 天然没有伙伴）
            const linked =
                this.sameValueLinked && this.isSameValueLinked(lastStart);

            if (selected) {
                context.save();
                context.strokeStyle = "cyan";
            }
            this.strokeLastLineSegment(context, lastStart, startXY);
            if (selected) {
                context.restore();
            }
            this.paintNode(
                context,
                startX - NODE_WIDTH / 2,
                startY - NODE_HEIGHT,
                NODE_WIDTH,
                NODE_HEIGHT,
                linked ? NODE_LINKED_COLOR : NODE_START_COLOR,
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

/**
 * 与 `node` **背靠背**的那个节点。
 *
 * 链是 `start₁ → end₁ → start₂ → end₂ …`：
 *   · 一段内部 `startₖ → endₖ` 之间隔着一整段时间，是"面对面"，**不绑**；
 *   · **交界处**的 `endₖ` 和 `startₖ₊₁` 同一时刻贴身站着，才是"背靠背"。
 *
 * 两者值相同就是一对同值绑定 —— 一起变紫、一起拖。
 * 序列第一个 `start` 左边没有 `end`，配不上对，所以它永远不紫。
 *
 * 单独抽出来是为了能直接测（编辑器实例要 canvas / operationList，太重）。
 */
export function sameValuePartner(
    node: EventStartNode<number> | EventEndNode<number>,
): EventStartNode<number> | EventEndNode<number> | null {
    // 起点看左边、终点看右边：交界处的那一个
    const partner =
        node instanceof EventStartNode ? node.previous : node.next;

    if (!partner) return null;
    // HEAD / TAIL 是哨兵，不是真节点
    if (partner.type === NodeType.HEAD || partner.type === NodeType.TAIL) {
        return null;
    }
    if ((partner as EventStartNode<number>).value !== node.value) return null;

    return partner as EventStartNode<number> | EventEndNode<number>;
}

export class NumericEventCurveEditor extends EventSequenceEditor<number> {
    override readonly valueType = EventValueType.numeric;

    public pointedValue: number;

    /**
     * 按下时锁定的「这次拖动是否成对联动」。
     *
     * 不能在拖动过程中重算：值会被改成同一个数，原本不同值的邻居也会
     * 变成"同值"，把不该动的一起卷进来。
     */
    private linkedDrag = false;

    protected override isSameValueLinked(
        node: EventStartNode<number> | EventEndNode<number>,
    ): boolean {
        return sameValuePartner(node) !== null;
    }

    /** 局部视图：值网格 + 时间网格（密度跟着倍率走） */
    protected override paintMagnified(
        context: CanvasRenderingContext2D,
        scale: number,
        anchor: { x: number; y: number },
        size: number
    ): void {
        const half = size / 2;

        // `valueRatio` / `timeRatio` 已经含主视图的倍率，这里只要相对主视图
        // 再放大的那部分（局部恒比主视图高一档）
        const factor = scale / Math.max(1, this.magnifier.zoom);
        const unitX = this.valueRatio * factor;
        const unitT = this.timeRatio * factor;

        // 这个小窗口能装下的世界范围 = 下一步放大后主视图看到的范围
        const halfValue = unitX > 0 ? half / unitX : 0;
        const halfBeats = unitT > 0 ? half / unitT : 0;

        context.save();
        context.font = `${Math.max(9, Math.round(size * 0.075))}px system-ui, sans-serif`;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.lineWidth = 1;

        /*
         * 局部视图 = 主视图的**下一档**，所以网格也按同一套 `chooseGridStep`
         * 往前推一档 —— 不另造十进步长，那样和主视图对不上。
         */
        const stepFactor =
            this.magnifier.localZoom / Math.max(1, this.magnifier.zoom);

        // ---------- 值网格（竖线，每根都标数值）----------
        const valueStep = chooseGridStep(
            this.currentValueGridStep > 0 ? this.currentValueGridStep : 1,
            stepFactor,
            lengthOf(this.valueRange),
        );
        const startValue =
            Math.ceil((anchor.x - halfValue) / valueStep) * valueStep;

        for (let value = startValue; value <= anchor.x + halfValue; value += valueStep) {
            const x = (value - anchor.x) * unitX;

            context.strokeStyle = "rgba(255, 170, 120, 0.35)";
            context.beginPath();
            context.moveTo(x, -half);
            context.lineTo(x, half);
            context.stroke();

            context.fillStyle = "rgba(255, 190, 140, 0.95)";
            context.fillText(
                formatGridValue(value, valueStep),
                Math.min(x + 2, half - 2),
                -half + 2
            );
        }

        // ---------- 时间网格（横线，每根都标数值）----------
        /*
         * 和主视图同一条公式：主视图一拍里有 `timeDivisor` 个小格，
         * 小窗是下一档（再细一倍）。漏掉 `timeDivisor` 的话密度会比
         * 主视图稀一大截，看起来"没跟上"。
         */
        const timeDivisor = this.parentEditorSet.timeDivisor;
        const timeStep =
            (this.timeGridInterval > 0 ? this.timeGridInterval : 1) /
            (timeDivisor * stepFactor);
        const startBeat =
            Math.ceil((anchor.y - halfBeats) / timeStep) * timeStep;

        for (let beat = startBeat; beat <= anchor.y + halfBeats; beat += timeStep) {
            // 和主画布同一个方向：拍数越大越靠上
            const y = -(beat - anchor.y) * unitT;

            context.strokeStyle = "rgba(140, 200, 255, 0.28)";
            context.beginPath();
            context.moveTo(-half, y);
            context.lineTo(half, y);
            context.stroke();

            // 拍数用带分数写：`2 1/4` 画成上下两行 + 一条横线
            const { whole, numerator, denominator } = splitBeats(
                beat,
                timeStep
            );

            context.fillStyle = "rgba(160, 210, 255, 0.95)";
            drawBeatLabel(
                context,
                -half + 2,
                Math.max(-half + 6, y),
                whole,
                numerator,
                denominator,
                Math.max(9, Math.round(size * 0.075))
            );
        }

        // ---------- 附近的节点 ----------
        /*
         * 这里**不**看"周边节点用过的值"（`adjust()` 里的那套并集），
         * 只用均匀网格 —— 局部视图是"看位置"，不是"看吸附点"。
         */
        const seq = this.selectedNode?.parentSeq;

        if (seq) {
            let node: any = seq.getNodeAt(anchor.y - halfBeats);

            for (let guard = 0; node && guard < 512; guard += 1) {
                const beats = TC.toBeats(node.time);

                if (beats > anchor.y + halfBeats) break;

                if (Math.abs(node.value - anchor.x) <= halfValue) {
                    const x = (node.value - anchor.x) * unitX;
                    const y = -(beats - anchor.y) * unitT;

                    // 和主视图同一个 `paintNode`：同形状、同尺寸、同配色
                    this.paintNode(
                        context,
                        x - this.nodeWidth / 2,
                        y - this.nodeHeight / 2,
                        this.nodeWidth,
                        this.nodeHeight,
                        node instanceof EventStartNode
                            ? NODE_START_COLOR
                            : NODE_END_COLOR,
                    );
                }

                node = node.next;
            }
        }

        context.restore();

        /*
         * 指针位置：画成**绿色半透明小球**，不要长得像节点 ——
         * 否则会和"被按住的节点"混淆。半径跟小窗尺寸走（两个编辑器一致）。
         */
        context.fillStyle = "rgba(80, 220, 140, 0.45)";
        context.beginPath();
        context.arc(0, 0, Math.max(5, size * 0.05), 0, Math.PI * 2);
        context.fill();
    }

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
        this.baseValueGridStep = config.valueGridSpan;

        this.updateMatrix();
    }

    /**
     * 相对拍数 → 屏幕 y。
     *
     * 数值曲线有放大镜，网格必须和节点走同一个矩阵；基类（含总览）用不到。
     */
    protected override beatToY(relativeBeats: number): number {
        return new Coordinate(0, relativeBeats).mul(this.matrix).y;
    }

    override updateMatrix(): void {
        super.updateMatrix();

        // 放大镜：只临时乘倍率，不改用户设置的 timeSpan / valueRange
        const zoom = this.magnifier.zooming ? this.magnifier.zoom : 1;

        // 扩展：值维度
        this.valueRatio = (this.innerWidth * zoom) / lengthOf(this.valueRange);
        this.timeRatio = (this.innerHeight * zoom) / this.timeSpan;

        /*
         * 缩放中心是**按下那一刻**的锚点（`zoomAnchor`），不是
         * `magnifier.anchor` —— 后者拖动时每帧跟着节点走（局部视图靠它
         * 刷新），拿它算会自激。
         */
        /*
         * 缩放中心用**实时**的 `magnifier.anchor`：拖动时节点位置变了，
         * 锚点必须跟着走，否则节点会离开指针。
         *
         * 不会自激 —— `moveHandler` 用拖动开始时的矩阵快照
         * （`dragMatrixInverted`），输入映射固定，只有视野跟着节点跑。
         */
        const anchor = this.magnifier.zooming ? this.magnifier.anchor : null;

        /*
         * **context 只 translate 到原点**（`initContext` 已设好，这里不再动）。
         * 缩放偏移全部进 `matrix` —— 这样网格和节点共用同一个换算入口，
         * 不会出现"网格铺在原点、节点被搬走"的错位。
         */
        if (anchor) {
            /*
             * 缩放中心用**按下时锁定**的 `zoomPointer`（相对原点的像素），
             * 不是实时的 `magnifier.pointer` —— 后者拖动时每帧都变，
             * 拿它当偏移会让画面跟着鼠标跑。
             */
            const pointer = this.zoomPointer ?? { x: 0, y: 0 };

            this.matrix = identity
                .translate(pointer.x, pointer.y)
                .scale(this.valueRatio, -this.timeRatio)
                .translate(-anchor.x, -(anchor.y - this.lastBeats));
        } else {
            this.matrix = identity
                .scale(this.valueRatio, -this.timeRatio)
                .translate(
                    -medianOf(this.valueRange),
                    -this.timeSpan * this.timeBasis,
                );
        }

        this.matrixInverted = this.matrix.invert();
    }
    override drawCoordination(beats: number): void {
        super.drawCoordination(beats);
        // 扩展：吸附线
        const { context, attachableValues } = this;
        context.save();
        context.fillStyle = "#EEE";
        context.font = `${scaleFont(16, this.canvas.width)}px phigros`;

        context.textAlign = "center";
        context.strokeStyle = this.valueGridColor;
        context.lineWidth = 1;
        /*
         * 竖线贯穿整屏：context 原点就在内容区中心，`±height/2` 就是屏幕上下
         * 边缘。放大偏移只在 `matrix` 里（影响横坐标），纵向不受影响。
         */
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
            // 标签也过一遍 `roundValue`：`5.500000000000001` 直接写出来太丑
            context.fillText(roundValue(value) + "", positionX, posY);
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

        /*
         * 输入映射用**拖动开始时的矩阵快照**：视野（`matrix`）在放大时跟着
         * 节点走，这里若用实时逆会形成反馈（节点动 → 视野动 → 世界坐标变
         * → 节点又动），表现为拖不住。
         */
        this.dragMatrixInverted ??= this.matrixInverted;

        const { x: value, y: beats } = canvasCoord.mul(this.dragMatrixInverted);
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

        /*
         * 局部视图跟着指针走：不刷新的话，拖走以后小窗口还停在原位，
         * 看到的是一块空白。`track` 只更新锚点，不动档位 / 动画。
         *
         * 传**原始**值而不是 `pointedValue`：后者已经吸附到最近的网格上，
         * 小窗里的绿球会被横向拽到吸附线上，看起来只有纵向自由。
         */
        this.magnifier.track({ x: value, y: accurateBeats }, this.canvasPoint);

        switch (this.state) {
            case EventCurveEditorState.selecting: {
                /*
                 * 背靠背联动：按下时锁定的那一对一起改**值和时刻**。
                 *
                 * 只改值不改时刻的话，交界处的两个节点会被拉开，"背靠背"
                 * 当场就散了，所以两个都要跟。
                 */
                if (this.linkedDrag) {
                    // 只传选中的那个，另一个由操作自己 `getEndStart` 取；
                    // 事务性交给 `ComplexOperation`（无效子操作会被跳过）
                    this.operationList.do(
                        new O.EventNodePairChangeOperation(
                            this.selectedNode,
                            this.pointedValue,
                            this.pointedTime,
                        )
                    );
                } else {
                    this.operationList.do(
                        new O.EventNodeValueChangeOperation(
                            this.selectedNode,
                            this.pointedValue
                        )
                    );
                    this.operationList.do(
                        new O.EventNodePairTimeChangeOperation(
                            this.selectedNode,
                            this.pointedTime
                        )
                    );
                }
            }
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
                // 每次按下都重新算，避免上一次的联动状态残留
                this.linkedDrag = false;

                if (snode && snode.target instanceof EventNode) {
                    this.selectedNode = snode.target;
                    /*
                     * 背靠背联动：在这里就把"这次拖要不要带伙伴"定下来。
                     *
                     * 只有交界处那一个（`end` ↔ 下一个 `start`）才算 —— 一段
                     * 内部的 `start → end` 之间隔着一整段时间，那是"面对面"。
                     * 拖动过程中值会变，每帧重算会把新同值的节点也卷进来。
                     *
                     * 具体带哪个节点由操作自己 `getEndStart` 取，这里只判断
                     * 有没有。
                     */
                    this.linkedDrag =
                        this.sameValueLinked &&
                        sameValuePartner(
                            this.selectedNode as
                                | EventStartNode<number>
                                | EventEndNode<number>
                        ) !== null;
                    // 放大镜以这个节点为中心（松手才收起）
                    this.focusMagnifier();
                    // 按住不动也要把局部视图画出来，不等下一次 move
                    this.parentEditorSet.draw(this.lastBeats);
                    this.dispatchEvent(
                        new KPANodeSelectedEvent(this.selectedNode),
                    );
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                // 按下只起预览，松手才落子（和音符画布一致）
                this.beginPreview();
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

    /**
     * 当前生效的值网格步长。
     *
     * 局部视图要用它标每根线的数值 —— 它可能已经被放大镜细分过，
     * 和 `eventTypeMap[type].valueGridSpan` 不是一回事。
     */
    protected currentValueGridStep = 1;

    /**
     * **1x 时**的值网格步长。
     *
     * 拖动 / 放大期间保持不变（`adjust` 里 `liveView` 分支跳过重算），
     * 免得网格跟着手指一跳一跳；`currentValueGridStep` 是它按倍率细分后的
     * 实际显示值。
     */
    protected baseValueGridStep = 1;

    /**
     * 正在轴向横向拖动（外层 `panBy` 设置）。
     *
     * 这时视野每帧都在变，`attachableValues` 必须无条件重算。
     */
    xPanning = false;

    adjust(values: number[]): void {
        /*
         * 放大 / 横向拖动时视野每帧都在变，必须**无条件**重算 attachable。
         *
         * 注意 `state` 那条早退也要让路：按住节点时 `state` 是 `selecting`
         * （不是 `select`），排在前面的 `return` 会让这里永远跑不到 ——
         * `currentValueGridStep` 就停在初始值 1，局部视图于是一片密线。
         */
        const liveView = this.magnifier.active || this.xPanning;

        if (this.state !== EventCurveEditorState.select && !liveView) {
            return;
        }

        const valueRange = this.valueRange;
        const distinctValueCount = new Set(values).size;

        if (
            !liveView &&
            distinctValueCount < 2 &&
            valueRange[0] < values[0] &&
            values[0] < valueRange[1]
        ) {
            return;
        }
        // 放大 / 横向拖动期间关掉 autoRange，否则视野会被"数据"拽回去
        if (this.autoRangeEnabled && !liveView) {
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

        const baseGridSpan = eventTypeMap[this.type]!.valueGridSpan;

        /*
         * 拖动 / 放大期间**不重新分配**步长。
         *
         * 拖动过程中节点值每帧都变（6 → 5.5 → 5.3…），跟着它重算会挑出
         * 1.1、0.7333… 这种诡异的间隔，网格线一帧一变。用户在拖的时候关心的
         * 是"落在哪根线上"，不是"网格该多密"，所以沿用静止时的步长。
         */
        if (!liveView) {
            this.baseValueGridStep = this.valueGridInterval
                ? this.valueGridInterval
                : pickValueGridSpan(
                      values,
                      baseGridSpan,
                      lengthOf(this.valueRange),
                  );
        }

        const valueGridSpan = this.baseValueGridStep;
        /*
         * 放大时按倍率细分（`chooseGridStep` 里有条数上下限和整数约束）。
         * 只在 1x 算出来的步长基础上细分，不叠加 —— 否则松手再放大两份，
         * 会越分越细。
         */
        const step = this.magnifier.active
            ? chooseGridStep(
                  valueGridSpan,
                  this.magnifier.zoom,
                  lengthOf(this.valueRange),
              )
            : valueGridSpan;

        this.currentValueGridStep = step;

        if (distinctValueCount > 10) {
            this.attachableValues = generateAttachable(
                [step, 0],
                this.valueRange,
            );
        } else {
            this.attachableValues = Array.from(
                new Set([
                    ...generateAttachable([step, 0], this.valueRange),
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
                    new O.EventNodePairTimeChangeOperation(
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
                    new O.EventNodePairTimeChangeOperation(
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
