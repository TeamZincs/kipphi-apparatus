import {
    HNList,
    JudgeLine,
    NNList,
    NNNList,
    NodeType,
    Note,
    NoteType,
    TC,
    TimeCalculator,
    type NNNOrTail,
    type NNOrTail,
    type NoteDataKPA,
    Op as O,
    type RGB,
    type TimeT,
    VERSION,
    NNNode,
    NoteNode,
} from "kipphi";
import {
    Coordinate,
    drawLine,
    identity,
    Images,
    Matrix33,
    Respack,
    rgb,
} from "kipphi-player";
import { SelectionManager } from "./selectionManager";
import {
    computeAttach,
    getCanvasCoordFromEvent,
    getOffsetCoordFromEvent,
    on,
} from "./util";
import { ButtonManager, type CanvasButton } from "./buttonManager";
import { scaleFont } from "./ui";

const DRAWS_NN = true;
const COLOR_1 = "#66ccff";
const COLOR_2 = "#ffcc66";
const OFFSCREEN_HINT_OFFSET = 50;

export class KPAEvent extends Event {
    constructor(type: string) {
        super(type);
    }
}

class KPANoteSelectedEvent extends KPAEvent {
    constructor(public note: Note) {
        super("noteselected");
    }
}
class KPANoteScopselectedEvent extends KPAEvent {
    constructor(public notes: Set<Note>) {
        super("notescopeselected");
    }
}

interface KPANoteEventMap {
    noteselected: KPANoteSelectedEvent;
    notescopeselected: KPANoteScopselectedEvent;
}

export enum NotesEditorState {
    /** 漫游 */
    select,
    /** 已选中 */
    selecting,
    /** 添加Note */
    edit,
    /** 正要范围选取 */
    selectScope,
    /** 已选取范围 */
    selectingScope,
    /** 拖拽（？） */
    flowing,
    placingHold,
}

class HoldTail {
    constructor(public note: Note) {}
}

/** 将一个拍数三元组转换为i:n/d */
const timeToString = (time: TimeT) => {
    return `${time[0]}:${time[1]}/${time[2]}`;
};

export enum SelectState {
    none,
    extend,
    replace,
    exclude,
}

export type LTWH = [l: number, t: number, w: number, h: number];

const key2NoteMap = {
    q: NoteType.tap,
    w: NoteType.drag,
    e: NoteType.flick,
    r: NoteType.hold,
};

export class NotesEditor extends EventTarget {
    context: CanvasRenderingContext2D;
    target: JudgeLine;
    targetNNList?: NNList;

    // begin 网格参数，可配置
    /** PosX=0的实际横坐标 */
    positionBasis: number;
    positionRatio: number;
    positionGridSpan: number;
    positionSpan: number;
    timeRatio: number;
    timeGridSpan: number;
    timeSpan: number = 4;

    /**
     * 轴向锁定：
     *   · `"time"` —— 允许滑动时间（滚轮/拖动改时间），横向锁住；
     *   · `"x"`    —— 时间锁住，只允许横向平移。
     */
    panAxis: "time" | "x" = "time";
    padding: number;
    // end

    timeGridColor = "rgb(120, 255, 170)";
    positionGridColor = "rgb(255, 170, 120)";
    /** 用于范围选取框的颜色 */
    scopingColor = "#FAA";
    noteWidth: number = 54;
    noteHeight: number = 10;

    state: NotesEditorState;
    lastSelectState: SelectState = SelectState.extend;
    selectState: SelectState;

    noteType: NoteType;
    noteAbove: boolean = true;

    // begin 可以访问的接口，但是基本上不配置
    /** 多选选中的Note */
    notesSelection: Set<Note>;
    /** 剪切板 */
    clipboard: Set<Note>;
    /** 当前选中的Note */
    selectedNote: Note = null; // 取消弱引用的使用
    // end

    showsNNNListAttachable: boolean = true;
    timeDivisor: number = 4;

    /** 默认的Note配置，一般暴露给音符编辑器 */
    defaultNoteConfig = {
        alpha: 255,
        isFake: 0,
        size: 1.0,
        speed: 1.0,
        absoluteYOffset: 0,
        visibleBeats: undefined as number,
        tintHitEffects: undefined as RGB,
        tint: undefined as RGB,
        judgeSize: 1.0,
        isAbove: 0 | 1,
    };

    // 私有属性我全给写后边了，请翻到最末尾
    // 你问我为啥？我也不知道（

    constructor(
        public canvas: HTMLCanvasElement,
        public clippingRect: LTWH,
        public operationList: O.OperationList,
        public respack: Respack,
    ) {
        super();
        this.selectionManager = new SelectionManager();
        this.notesSelection = new Set();
        this.padding = 10;
        this.targetNNList = null;
        this.state = NotesEditorState.select;
        this.wasEditing = false;
        this.positionBasis = 0;
        this.positionGridSpan = 135;
        this.positionSpan = 1350;
        this.timeGridSpan = 1;
        this.noteType = NoteType.tap;

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
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event);
        });
        on(["mouseup", "touchend"], this.canvas, (event) =>
            this.upHandler(event),
        );
        on(["mousemove", "touchmove"], this.canvas, (event) => {
            this.moveHandler(event);
        });
        on(
            ["mousedown", "mousemove", "touchstart", "touchmove"],
            this.canvas,
            (event) => {
                if (this.drawn) {
                    return;
                }
                this.draw();
            },
        );

        // 滚轮缩放时间轴：**编辑器自己处理**，页面不用再管（播放器的滚轮除外）。
        // `ctrlKey` 留给页面切换判定线，这里直接放行。
        this.canvas.addEventListener(
            "wheel",
            (event) => this.wheelHandler(event),
            { passive: false },
        );

        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            // 踩坑：Canvas不能获得焦点
            this.keyDownHandler(e);
        });
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                if (
                    this.state === NotesEditorState.selectScope ||
                    this.state === NotesEditorState.selectingScope
                ) {
                    this.state = NotesEditorState.select;
                    this.selectState = SelectState.none;
                    this.draw();
                }
            } else if (e.key === "r") {
                this.state = NotesEditorState.select;
                this.selectState = SelectState.none;
                this.draw();
            }
        });

        this.updateMatrix();
    }
    override addEventListener<T extends keyof KPANoteEventMap>(
        type: T,
        listener: (event: KPANoteEventMap[T]) => void,
        options?: EventListenerOptions,
    ): void {
        super.addEventListener(type, listener, options);
    }
    keyDownHandler(e: KeyboardEvent) {
        console.log("Key down:", e.key);
        if (!this.mouseIn) {
            return;
        }
        if (document.activeElement !== document.body) {
            return;
        }
        e.preventDefault();

        if (e.key === "Shift") {
            if (
                this.state === NotesEditorState.selectScope ||
                this.state === NotesEditorState.selectingScope
            ) {
                return;
            }
            this.state = NotesEditorState.selectScope;
            this.selectState = this.lastSelectState;
            this.draw();
            return;
        }
        switch (e.key.toLowerCase()) {
            case "v":
                this.paste(false, e.ctrlKey);
                break;
            case "x":
                this.paste(true, e.ctrlKey);
                break;
            case "c":
                this.copy();
                break;
            case "q":
            case "w":
            case "e":
                if (e.ctrlKey) {
                    return;
                }
                const noteType = key2NoteMap[e.key.toLowerCase()];

                const startTime: TimeT = this.pointedTime;
                const endTime: TimeT =
                    noteType === NoteType.hold
                        ? [startTime[0] + 1, 0, 1]
                        : [...startTime];

                const createOptions: NoteDataKPA = {
                    ...this.defaultNoteConfig,
                    endTime: endTime,
                    startTime: startTime,
                    positionX: this.pointedPositionX,
                    above: this.noteAbove ? 1 : 0,
                    speed: this.targetNNList?.speed || undefined,
                    type: noteType,
                } as NoteDataKPA;
                const note = Note.fromKPAJSON(
                    createOptions,
                    this.operationList.chart,
                    "",
                ); // 这里只能用visibleBeats创建，因此不需要tc
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                this.operationList.tryDo(
                    () =>
                        new O.NoteAddOperation(
                            note,
                            this.target.getNode(note, true),
                        ),
                );
                break;
            case "r":
                if (
                    this.state !== NotesEditorState.select &&
                    this.state !== NotesEditorState.edit
                ) {
                    return;
                }
                this.state = NotesEditorState.placingHold;
                break;
        }
        this.draw();
    }
    moveHandler(event: TouchEvent | MouseEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = (this.canvasPoint = new Coordinate(offsetX, offsetY)
            .mul(this.elementMatrixInverted)
            .mul(this.canvasMatrixInverted));

        const { x, y } = canvasCoord.mul(this.matrixInverted);
        // const {width, height} = this.canvas
        // const {padding} = this;
        this.pointedPositionX =
            Math.round(x / this.positionGridSpan) * this.positionGridSpan;
        const accurateBeats = y + this.lastBeats;
        const attached = computeAttach(this.attachableTimes, accurateBeats);
        const timeT: TimeT = this.timeMap.get(attached);
        this.pointedTime = timeT;

        switch (this.state) {
            case NotesEditorState.selecting:
                console.log("det");
                console.log(this.selectedNote);
                if (!this.selectedNote) {
                    console.warn(
                        "Unexpected error: selected note does not exist",
                    );
                    break;
                }
                this.operationList.tryDo(
                    () =>
                        new O.NotePropChangeOperation(
                            this.selectedNote,
                            "positionX",
                            this.pointedPositionX,
                        ),
                );
                if (this.selectingTail) {
                    this.operationList.tryDo(
                        () =>
                            new O.HoldEndTimeChangeOperation(
                                this.selectedNote,
                                timeT,
                            ),
                    );
                } else {
                    this.operationList.tryDo(
                        () =>
                            new O.NoteTimeChangeOperation(
                                this.selectedNote,
                                this.selectedNote.parentNode.parentSeq.getNodeOf(
                                    timeT,
                                ),
                            ),
                    );
                }
        }
    }
    /** 左上角的模式按钮（select / selectScope / edit） */
    /**
     * 左上角的按钮条（模式 + 音符类型）。
     *
     * 尺寸对齐事件总览的层级按钮：40×40；边距比默认的 8px 再大一点，
     * 免得贴着画布上沿、被上面那层工具栏挡住。
     */
    readonly buttons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        gap: 6
    });

    /** 把当前模式映射成按钮表（监听器挂在按钮上，管理器不认业务） */
    private toolbarButtons(): CanvasButton[] {
        const state = this.state;
        const selecting = state === NotesEditorState.selecting;
        const scoping =
            state === NotesEditorState.selectScope ||
            state === NotesEditorState.selectingScope;

        return [
            {
                id: "select",
                icon: selecting ? ("selecting" as const) : ("select" as const),
                active: state === NotesEditorState.select || selecting,
                onClick: () => this.setMode("select"),
            },
            {
                id: "scope",
                icon:
                    state === NotesEditorState.selectingScope
                        ? ("selectingScope" as const)
                        : ("selectScope" as const),
                active: scoping,
                onClick: () => this.setMode("scope"),
            },
            {
                id: "edit",
                icon: "edit" as const,
                active: state === NotesEditorState.edit,
                onClick: () => this.setMode("edit"),
            },
            // 四种音符：按下 = 进 edit 模式 + 把待放音符设成这个类型
            ...(
                [
                    ["tap", NoteType.tap, "TAP"],
                    ["drag", NoteType.drag, "DRG"],
                    ["flick", NoteType.flick, "FLK"],
                    ["hold", NoteType.hold, "HLD"],
                ] as const
            ).map(([id, type, label]) => ({
                id: `type-${id}`,
                label,
                active: state === NotesEditorState.edit && this.noteType === type,
                onClick: () => {
                    this.noteType = type;
                    this.setMode("edit");
                },
            })),
        ];
    }

    /** 按钮画在**屏幕坐标**上：编辑器内部有相机变换，这里要临时复位 */
    private drawToolbar(): void {
        if (!this.context) return;

        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.buttons.draw(this.context, this.toolbarButtons());
        this.context.restore();
    }

    /**
     * 事件坐标 -> **位图像素**坐标。
     *
     * 按钮是 setTransform(1,0,0,1,0,0) 之后画的，也就是位图像素空间；
     * 而 `downHandler` 里的 `canvasCoord` 是模型坐标（过了相机矩阵），
     * 两者不是一回事 —— 之前拿模型坐标去判命中，永远打不中。
     */
    private pointerInBitmap(event: TouchEvent | MouseEvent): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const source =
            "touches" in event
                ? (event.touches[0] ?? event.changedTouches[0])
                : (event as MouseEvent);

        const scaleX = rect.width ? this.canvas.width / rect.width : 1;
        const scaleY = rect.height ? this.canvas.height / rect.height : 1;

        return {
            x: (source.clientX - rect.left) * scaleX,
            y: (source.clientY - rect.top) * scaleY,
        };
    }

    /**
     * 切到基础模式。
     *
     * 一律落在 select / selectScope / edit 上 —— 不能停在 selecting /
     * selectingScope（那是"已选中"的中间态，没有选中物时是非法的）。
     */
    private setMode(mode: "select" | "scope" | "edit"): void {
        this.state =
            mode === "edit"
                ? NotesEditorState.edit
                : mode === "scope"
                  ? NotesEditorState.selectScope
                  : NotesEditorState.select;

        this.draw();
    }

    /** 点到了按钮就吃掉这次事件 */
    private handleToolbarDown(x: number, y: number): boolean {
        return this.buttons.press(x, y) !== null;
    }

    /**
     * 滚轮 = **滑动时间**（不是缩放）。
     *
     * 一格大约走可视范围的 1/10，和桌面端"滚轮 seek 时间"的语义一致。
     * 之所以放在编辑器里：滑动方向要受轴向锁定约束，而且不该和播放器的滚轮打架。
     */
    wheelHandler(event: WheelEvent): boolean {
        // ctrl + 滚轮是页面在切判定线，别抢
        if (event.ctrlKey) return false;

        event.preventDefault();
        // 桌面端的 `#inner` 上还挂着播放器的滚轮（seek），不拦住的话会跳两次进度
        event.stopPropagation();

        // 锁定的是"时间轴"时，滚轮不滑时间（改由轴向锁定按钮切到横轴）
        if (this.panAxis === "x") return true;

        const deltaBeats = (event.deltaY / 100) * (this.timeSpan / 10);

        this.scrollTimeBy(deltaBeats);

        return true;
    }

    /**
     * 把视图时间往前/后推一段（负数 = 往前）。
     *
     * 播放器在放的时候它自己会覆盖 `lastBeats`，所以真正生效要靠页面接
     * `timescroll` 事件去 seek；编辑器自己只负责在暂停时立刻反映出来。
     */
    scrollTimeBy(deltaBeats: number): void {
        this.lastBeats = (this.lastBeats ?? 0) + deltaBeats;

        this.dispatchEvent(
            Object.assign(new Event("timescroll"), { deltaBeats }),
        );

        this.draw(this.lastBeats);
    }

    downHandler(event: TouchEvent | MouseEvent) {
        const { width, height } = this.canvas;
        // console.log(width, height)
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);

        const canvasCoord = (this.canvasPoint = new Coordinate(offsetX, offsetY)
            .mul(this.elementMatrixInverted)
            .mul(this.canvasMatrixInverted));
        // 按钮优先于画布：命中就直接吃掉这次事件（按钮在位图像素空间）
        {
            const point = this.pointerInBitmap(event);

            if (this.handleToolbarDown(point.x, point.y)) return;
        }

        const coord = canvasCoord.mul(this.matrixInverted);
        const { x, y } = coord;
        // console.log("offset:", offsetX, offsetY)
        // console.log("Coord:", x, y);
        switch (this.state) {
            case NotesEditorState.select:
            case NotesEditorState.selecting:
                const snote = this.selectionManager.click(canvasCoord);
                this.state = !snote
                    ? NotesEditorState.select
                    : NotesEditorState.selecting;
                if (snote) {
                    const tar = snote.target;
                    const isTail = (this.selectingTail =
                        tar instanceof HoldTail);
                    this.selectedNote = isTail ? tar.note : tar;
                    this.dispatchEvent(
                        new KPANoteSelectedEvent(this.selectedNote),
                    );
                }
                console.log(NotesEditorState[this.state]);
                this.wasEditing = false;
                break;
            case NotesEditorState.edit:
            case NotesEditorState.placingHold:
                const startTime: TimeT = this.pointedTime;
                const endTime: TimeT =
                    this.noteType === NoteType.hold ||
                    this.state === NotesEditorState.placingHold
                        ? TC.validateIp([
                              startTime[0],
                              startTime[1] + 1,
                              startTime[2],
                          ])
                        : [...startTime];
                const createOptions: NoteDataKPA = {
                    ...this.defaultNoteConfig,
                    endTime: endTime,
                    startTime: startTime,
                    positionX: this.pointedPositionX,
                    above: this.noteAbove ? 1 : 0,
                    speed:
                        this.targetNNList?.speed ||
                        this.defaultNoteConfig.speed,
                    type:
                        this.state === NotesEditorState.placingHold
                            ? NoteType.hold
                            : this.noteType,
                } as NoteDataKPA;
                const note = Note.fromKPAJSON(
                    createOptions,
                    this.operationList.chart,
                    "",
                ); // 这里只能用visibleBeats创建，因此不需要tc
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                this.operationList.tryDo(
                    () =>
                        new O.NoteAddOperation(
                            note,
                            this.target.getNode(note, true),
                        ),
                );
                this.selectedNote = note;
                if (note.type === NoteType.hold) {
                    this.selectingTail = true;
                }
                this.wasEditing = this.state === NotesEditorState.edit;
                this.state = NotesEditorState.selecting;
                this.dispatchEvent(new KPANoteSelectedEvent(this.selectedNote));
                break;
            case NotesEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = NotesEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: TouchEvent | MouseEvent) {
        {
            // 松开要交给按钮管理器：onClick 是在 release 里触发的
            const point = this.pointerInBitmap(event);

            this.buttons.release(point.x, point.y);
        }

        const canvasCoord = getCanvasCoordFromEvent(
            event,
            this.canvas,
            this.elementMatrixInverted,
            this.canvasMatrixInverted,
        );
        const { x, y } = canvasCoord.mul(this.matrixInverted);
        switch (this.state) {
            case NotesEditorState.selecting:
                this.state = this.wasEditing
                    ? NotesEditorState.edit
                    : NotesEditorState.select;
                break;
            case NotesEditorState.selectingScope:
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
                const notes = array
                    .map((x) => x.target)
                    .filter((x) => x instanceof Note);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.notesSelection = this.notesSelection.union(
                            new Set(notes),
                        );
                        break;
                    case SelectState.replace:
                        this.notesSelection = new Set(notes);
                        break;
                    case SelectState.exclude:
                        this.notesSelection = this.notesSelection.difference(
                            new Set(notes),
                        );
                        break;
                }
                this.notesSelection = new Set(
                    [...this.notesSelection].filter(
                        (note: Note) => !!note.parentNode,
                    ),
                );
                // console.log("bp")
                if (this.notesSelection.size !== 0) {
                    this.dispatchEvent(
                        new KPANoteScopselectedEvent(this.notesSelection),
                    );
                }
                this.state = NotesEditorState.selectScope;
                break;
            case NotesEditorState.placingHold:
                this.state = NotesEditorState.select;
        }
    }
    updateMatrix() {
        const {
            // timeSpan,
            // positionSpan,
            timeRatio,
            positionRatio,
            clippingRect,
        } = this;
        const [left, top, width, height] = clippingRect;
        this.positionRatio = width / this.positionSpan;
        this.timeRatio = height / this.timeSpan;
        this.context.resetTransform();
        this.context.translate(left + width / 2, top + height - this.padding);
        this.matrix = identity
            .translate(this.positionBasis, 0)
            .scale(positionRatio, -timeRatio);
        this.matrixInverted = this.matrix.invert();
        this.canvasMatrix = Matrix33.fromDOMMatrix(this.context.getTransform());
        this.canvasMatrixInverted = this.canvasMatrix.invert();
    }
    drawCoordination(beats: number) {
        const { context, canvas } = this;
        const viewportWidth = this.clippingRect[2];
        const viewportHeight = this.clippingRect[3];
        // console.log(canvasWidth, canvasHeight)
        const {
            positionGridSpan,
            positionRatio,
            positionSpan: positionRange,
            positionBasis,

            timeGridSpan,
            timeSpan,
            timeRatio,

            padding,
        } = this;
        const width = viewportWidth - padding * 2;
        const height = viewportHeight - padding * 2;
        context.textAlign = "left";
        context.clearRect(
            -viewportWidth / 2,
            -viewportHeight,
            viewportWidth,
            viewportHeight,
        );
        context.fillStyle = "#333d";
        context.font = `${scaleFont(30, this.canvas.width)}px Phigros`;

        context.fillRect(
            -viewportWidth / 2,
            padding - viewportHeight,
            viewportWidth,
            viewportHeight,
        );

        context.save();
        context.lineWidth = 5;
        context.strokeStyle = "#EEE";
        const textPosX = -width / 2 + 10;
        // 基线
        drawLine(context, -viewportWidth / 2, 0, viewportWidth / 2, 0);

        context.fillStyle = "#EEE6";
        context.fillText(`Kipphi v${VERSION}`, textPosX, -70);
        context.fillText("by Zes-Minkey-Young", textPosX, -40);
        context.fillText("MIT Licensed", textPosX, -10);

        // 画布上的状态文字（State / Cursor / Selected …）已移到工具栏按钮里
        context.restore();

        // 绘制x坐标线
        // 计算上下界
        const upperEnd =
            Math.ceil(
                (width / 2 - positionBasis) / positionGridSpan / positionRatio,
            ) * positionGridSpan;
        const lowerEnd =
            Math.ceil(
                (-width / 2 - positionBasis) / positionGridSpan / positionRatio,
            ) * positionGridSpan;
        context.strokeStyle = context.fillStyle = this.positionGridColor;
        context.lineWidth = 1;
        context.textAlign = "center";
        let odd = true;
        for (
            let value = lowerEnd;
            value < upperEnd;
            value += positionGridSpan
        ) {
            const positionX = value * positionRatio + positionBasis;
            drawLine(context, positionX, -height + padding, positionX, 0);
            if (odd) {
                context.fillText(
                    Math.round(value) + "",
                    positionX,
                    -height + padding,
                );
            }
            odd = !odd;
            // debugger
        }
        context.textAlign = "right";

        context.strokeStyle = this.timeGridColor;
        // 绘制时间线
        const startBeats = Math.floor(beats);
        const stopBeats = Math.ceil(beats + timeSpan);
        context.lineWidth = 3;
        const attachableTimes = [];
        const map = new Map<number, TimeT>();
        const timeDivisor = this.timeDivisor;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats) * timeRatio;
            drawLine(context, -width / 2, -positionY, width / 2, -positionY);
            context.save();
            context.fillStyle = this.timeGridColor;
            context.fillText(time + "", +width / 2, -positionY - 4);

            attachableTimes.push(time);
            map.set(time, [time, 0, timeDivisor]);

            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorBeats = time + i / timeDivisor;
                const minorPosY = (minorBeats - beats) * timeRatio;
                map.set(minorBeats, [time, i, timeDivisor]);
                attachableTimes.push(minorBeats);
                drawLine(
                    context,
                    -width / 2,
                    -minorPosY,
                    width / 2,
                    -minorPosY,
                );
            }
            context.restore();
        }
        this.attachableTimes = attachableTimes;
        this.timeMap = map;

        if (this.showsNNNListAttachable) {
            const nnnList = this.operationList.chart.nnnList;
            this.lookList(nnnList, startBeats, stopBeats, beats);
        }
        //*/
    }
    lookList(
        nnnList: NNNList | NNList,
        startBeats: number,
        stopBeats: number,
        beats: number,
    ) {
        const startNode = nnnList.getNodeAt(startBeats);
        const endNode = nnnList.getNodeAt(stopBeats);
        const { attachableTimes, timeMap, context, timeRatio } = this;
        const width = this.clippingRect[2] - 2 * this.padding;
        context.save();
        context.setLineDash([10, 10]);
        context.lineWidth = 2;
        context.strokeStyle = "#5DF";
        for (
            let node: NNNOrTail | NNOrTail = startNode;
            node !== endNode;
            node = node.next
        ) {
            const time: TimeT = (node as NoteNode | NNNode).startTime;
            const nodeBeats = TC.toBeats(time);
            const posY = (nodeBeats - beats) * timeRatio;
            drawLine(context, -width / 2, -posY, width / 2, -posY);
            if (
                node instanceof NNNode &&
                node.noteNodes.length === 1 &&
                node.holdNodes.length === 0 &&
                node.noteNodes[0].notes.every(
                    (note) => note.type === NoteType.drag,
                )
            ) {
                continue;
            }
            if (timeMap.has(nodeBeats)) {
                continue;
            }
            timeMap.set(nodeBeats, time);
            attachableTimes.push(nodeBeats);
        }
        attachableTimes.sort((a, b) => a - b);
        context.restore();
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        this.selectionManager.refresh();
        const { context } = this;
        const {
            timeSpan: timeRange,
            timeRatio,

            padding,
        } = this;
        this.drawCoordination(beats);

        const width = this.clippingRect[2];

        const renderLine = (line: JudgeLine, showsFrom: boolean) => {
            // Hold first, so that drag/flicks can be seen
            for (const lists of [line.hnLists, line.nnLists]) {
                for (const [_, list] of lists) {
                    this.drawNNList(list, beats, showsFrom);
                }
            }
        };

        const line = this.target;
        const group = line.group;

        const rendersOtherLines = !this.targetNNList && !group.isDefault();

        if (rendersOtherLines) {
            context.save();
            context.font = `${scaleFont(16, this.canvas.width)}px Phigros`;
            context.globalAlpha = 0.5;
            const len = group.judgeLines.length;
            for (let i = 0; i < len; i++) {
                const judgeLine = group.judgeLines[i];
                if (judgeLine === line) {
                    continue;
                }
                renderLine(judgeLine, rendersOtherLines);
            }
            context.restore();
        }

        if (this.targetNNList) {
            this.drawNNList(this.targetNNList, beats);
        } else {
            this.selectionManager.setBasePriority(1);
            renderLine(this.target, false);
            this.selectionManager.setBasePriority(0);
        }
        // 绘制侧边音符节点标识
        if (DRAWS_NN && this.targetNNList) {
            context.save();
            context.lineWidth = 3;
            const jump = this.targetNNList.jump;
            const averageBeats = jump.averageBeats;
            const start = Math.floor(beats / averageBeats);
            const end = Math.ceil((beats + timeRange) / averageBeats);
            const array = jump.array;
            const array2 =
                this.targetNNList instanceof HNList
                    ? this.targetNNList.holdTailJump.array
                    : null;
            let lastNode = null;
            let color = COLOR_1;
            const MINOR_SCALE_COUNT = jump.MINOR_SCALE_COUNT;
            const minorAverageBeats =
                jump.averageBeats / jump.MINOR_SCALE_COUNT;
            const x = width / 2 - 10;
            const x2 = -width / 2 + 10;
            const switchColor = () =>
                (context.strokeStyle = color =
                    color === COLOR_1 ? COLOR_2 : COLOR_1);
            for (let i = start; i < end; i++) {
                const scale = array[i] as NNOrTail | NNOrTail[];
                if (!scale) {
                    continue;
                }
                const y = -(i * averageBeats - beats) * timeRatio;
                // console.log(i, y)
                if (Array.isArray(scale)) {
                    for (let j = 0; j < MINOR_SCALE_COUNT; j++) {
                        const node = scale[j];
                        if (node !== lastNode) {
                            switchColor();
                            lastNode = node;
                            context.fillText(
                                node.type === NodeType.TAIL
                                    ? "Tail"
                                    : node.id.toString(),
                                x - 30,
                                y - j * minorAverageBeats * timeRatio,
                            );
                        }
                        drawLine(
                            context,
                            x - 4,
                            y - j * minorAverageBeats * timeRatio,
                            x,
                            y - (j + 1) * minorAverageBeats * timeRatio + 5,
                        );
                    }
                } else {
                    if (scale !== lastNode) {
                        switchColor();
                        lastNode = scale;
                    }
                    context.fillText(
                        scale.type === NodeType.TAIL
                            ? "Tail"
                            : scale.id.toString(),
                        x - 30,
                        y,
                    );
                    drawLine(
                        context,
                        x - 10,
                        y,
                        x + 10,
                        y - averageBeats * timeRatio + 5,
                    );
                }
            }
            if (array2)
                for (let i = start; i < end; i++) {
                    const scale = array2[i] as NNOrTail | NNOrTail[];
                    if (!scale) {
                        continue;
                    }
                    const y = -(i * averageBeats - beats) * timeRatio;
                    // console.log(i, y)
                    if (Array.isArray(scale)) {
                        for (let j = 0; j < MINOR_SCALE_COUNT; j++) {
                            const node = scale[j];
                            if (node !== lastNode) {
                                switchColor();
                                lastNode = node;
                                context.fillText(
                                    node.type === NodeType.TAIL
                                        ? "Tail"
                                        : `${node.id} (${timeToString(node.startTime)}-${timeToString(node.endTime)})`,
                                    x2 + 10,
                                    y - j * minorAverageBeats * timeRatio,
                                );
                            }
                            drawLine(
                                context,
                                x2 - 4,
                                y - j * minorAverageBeats * timeRatio,
                                x2,
                                y - (j + 1) * minorAverageBeats * timeRatio + 5,
                            );
                        }
                    } else {
                        if (scale !== lastNode) {
                            switchColor();
                            lastNode = scale;
                        }
                        context.fillText(
                            scale.type === NodeType.TAIL
                                ? "Tail"
                                : `${scale.id} (${timeToString(scale.startTime)}-${timeToString(scale.endTime)})`,
                            x2 + 10,
                            y,
                        );
                        drawLine(
                            context,
                            x2 - 10,
                            y,
                            x2 + 10,
                            y - averageBeats * timeRatio + 5,
                        );
                    }
                }
            context.restore();
        }
        if (this.state === NotesEditorState.selectingScope) {
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

        this.drawn = false;
        this.lastBeats = beats;
        // 画在最后：编辑器自己的背景填充会把前面画的盖住
        this.drawToolbar();
    }
    /**
     *
     * @param tree
     * @param beats
     * @param showsFrom 指定是否展示Note来自于哪个NNList
     * @returns
     */
    drawNNList(tree: NNList, beats: number, showsFrom: boolean = false) {
        const timeRange = this.timeSpan;
        let noteNode = tree.getNodeAt(beats, true);
        if (noteNode.type === NodeType.TAIL) {
            return;
        }
        while (
            !(noteNode.type === NodeType.TAIL) &&
            TC.toBeats(noteNode.startTime) < beats + timeRange
        ) {
            const notes = noteNode.notes,
                length = notes.length;
            // 记录每个positionX处的Note数量
            const posMap = new Map<number, number>();
            for (let i = 0; i < length; i++) {
                const note = notes[i];
                const posX = note.positionX;
                const count = posMap.get(note.positionX) || 0;
                this.drawNote(beats, note, count, showsFrom);
                posMap.set(posX, count + 1);
            }
            noteNode = noteNode.next; // 这句之前忘了，卡死了，特此留念（
        }
    }
    drawNote(beats: number, note: Note, nth: number, showsFrom: boolean) {
        const context = this.context;
        const {
            timeRatio,

            padding,
            matrix,
            clippingRect,

            respack,
        } = this;
        const start = TC.toBeats(note.startTime) - beats;
        const end = TC.toBeats(note.endTime) - beats;
        const { x: posX, y: posY } = new Coordinate(note.positionX, start).mul(
            matrix,
        );
        const NOTE_WIDTH = this.noteWidth;
        const NOTE_HEIGHT = this.noteHeight;
        const posLeft = posX - NOTE_WIDTH / 2;
        const posRight = posX + NOTE_WIDTH / 2;
        const tooLeft = posRight < -clippingRect[2] / 2;
        const tooRight = posLeft > clippingRect[2] / 2;
        if (tooLeft || tooRight) {
            // 超出画布范围，写点字作为提醒
            context.save();
            context.fillStyle = "#ddd";
            context.font = `${scaleFont(50, this.canvas.width)}px phigros`;
            if (tooLeft) {
                context.fillText("←!!", -OFFSCREEN_HINT_OFFSET, posY);
            } else {
                context.fillText("!!→", +OFFSCREEN_HINT_OFFSET, posY);
            }
            context.restore();
            return;
        }
        const isHold = note.type === NoteType.hold;
        let rad: number;
        if (nth !== 0) {
            // 一尺之棰，日取其半，万世不竭
            rad = Math.PI * (1 - Math.pow(2, -nth));
            context.save();
            context.translate(posX, posY);
            context.rotate(rad);
            context.drawImage(
                respack.getNoteFromType(note.type),
                -NOTE_WIDTH / 2,
                -NOTE_HEIGHT / 2,
                NOTE_WIDTH,
                NOTE_HEIGHT,
            );

            if (this.notesSelection.has(note)) {
                context.save();
                context.fillStyle = "#3F38";
                context.fillRect(
                    -NOTE_WIDTH / 2,
                    -NOTE_HEIGHT / 2,
                    NOTE_WIDTH,
                    NOTE_HEIGHT,
                );
                context.restore();
            } else if (this.selectedNote === note) {
                context.drawImage(
                    Images.SELECT_NOTE,
                    -NOTE_WIDTH / 2,
                    -NOTE_HEIGHT / 2,
                    NOTE_WIDTH,
                    NOTE_HEIGHT,
                );
            }
            context.restore();
            this.selectionManager.add({
                target: note,
                centerX: posX,
                centerY: posY,
                width: NOTE_WIDTH,
                height: NOTE_HEIGHT,
                rad,
                priority: isHold ? 1 : 2,
            });
        } else {
            const posTop = posY - NOTE_HEIGHT / 2;
            context.drawImage(
                respack.getNoteFromType(note.type),
                posLeft,
                posTop,
                NOTE_WIDTH,
                NOTE_HEIGHT,
            );
            if (showsFrom)
                context.fillText(
                    note.parentNode.parentSeq.parentLine.id + "",
                    posLeft + NOTE_WIDTH / 2,
                    posTop + NOTE_HEIGHT + 20,
                );

            if (this.notesSelection.has(note)) {
                context.save();
                context.fillStyle = "#3F38";
                context.fillRect(posLeft, posTop, NOTE_WIDTH, NOTE_HEIGHT);
                context.restore();
            } else if (this.selectedNote === note) {
                if (this.selectingTail) {
                    context.drawImage(
                        Images.SELECT_NOTE,
                        posLeft,
                        -end * timeRatio,
                        NOTE_WIDTH,
                        NOTE_HEIGHT,
                    );
                } else {
                    context.drawImage(
                        Images.SELECT_NOTE,
                        posLeft,
                        posTop,
                        NOTE_WIDTH,
                        NOTE_HEIGHT,
                    );
                }
            }
            this.selectionManager.add({
                target: note,
                centerX: posX,
                centerY: posY,
                height: NOTE_HEIGHT,
                width: NOTE_WIDTH,
                priority: isHold ? 1 : 2,
            });
        }

        if (isHold) {
            context.drawImage(
                respack.HOLD_BODY,
                posLeft,
                -end * timeRatio,
                NOTE_WIDTH,
                (end - start) * timeRatio - NOTE_HEIGHT / 2,
            );
            this.selectionManager.add({
                target: new HoldTail(note),
                left: posLeft,
                top: -end * timeRatio,
                height: NOTE_HEIGHT,
                width: NOTE_WIDTH,
                priority: 1,
            });
            this.selectionManager.add({
                target: note,
                left: posLeft,
                top: -end * timeRatio,
                height: (end - start) * timeRatio,
                width: NOTE_WIDTH,
                priority: 0,
            });
        }
    }

    /**
     * 如果你觉得positionBasis难用，就用这个
     * @param positionX
     */
    setValueAsCenter(positionX: number) {
        this.positionBasis = -(positionX * this.positionRatio);
    }

    paste(deletesOriginal: boolean = false, keepOriginalList: boolean = false) {
        const { clipboard, lastBeats } = this;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        if (!lastBeats) {
            return;
        }
        const notes = [...clipboard];
        notes.sort((a: Note, b: Note) =>
            TC.gt(a.startTime, b.startTime) ? 1 : -1,
        );
        const startTime: TimeT = notes[0].startTime;
        // const portions: number = Math.round(timeDivisor * lastBeats);
        const dest: TimeT = this.pointedTime;
        const offset: TimeT = TC.sub(dest, startTime);

        const newNotes: Note[] = notes.map((n) => n.clone(offset));
        if (keepOriginalList) {
            if (notes.some((n) => !n.parentNode)) {
                return;
            }
            if (deletesOriginal) {
                this.operationList.tryDo(
                    () =>
                        new O.ComplexOperation(
                            new O.ComplexOperation(
                                ...newNotes.map((n, i) => {
                                    return new O.NoteAddOperation(
                                        n,
                                        notes[
                                            i
                                        ]!.parentNode.parentSeq.getNodeOf(
                                            n.startTime,
                                        ),
                                    );
                                }),
                            ),
                            new O.MultiNoteDeleteOperation(notes),
                        ),
                );
            } else {
                this.operationList.tryDo(
                    () =>
                        new O.ComplexOperation(
                            ...newNotes.map((n, i) => {
                                return new O.NoteAddOperation(
                                    n,
                                    notes[i]!.parentNode.parentSeq.getNodeOf(
                                        n.startTime,
                                    ),
                                );
                            }),
                        ),
                );
            }
        } else {
            if (deletesOriginal) {
                this.operationList.tryDo(
                    () =>
                        new O.ComplexOperation(
                            new O.MultiNoteAddOperation(newNotes, this.target),
                            new O.MultiNoteDeleteOperation(notes),
                        ),
                );
            } else {
                this.operationList.tryDo(
                    () => new O.MultiNoteAddOperation(newNotes, this.target),
                );
            }
        }
        this.notesSelection = new Set<Note>(newNotes);
        this.dispatchEvent(new KPANoteScopselectedEvent(this.notesSelection));
    }
    copy(): void {
        this.clipboard = this.notesSelection;
        this.notesSelection = new Set<Note>();
    }

    // begin 以下朝生夕死，不配置不可读的状态。如果你觉得哪个应该是可读的，请提issue拷打杨哲思
    private selectionManager: SelectionManager<Note | HoldTail>;
    private startingPoint: Coordinate;
    private startingCanvasPoint: Coordinate;
    private canvasPoint: Coordinate;
    private selectingTail: boolean;
    private wasEditing: boolean;
    private pointedPositionX: number;

    private attachableTimes: number[] = [];
    /** 从f64（TC.toBeats(time)）到TimeT的映射 */
    private timeMap: Map<number, TimeT> = new Map();
    private pointedTime: TimeT;
    private drawn: boolean;

    private elementMatrix: Matrix33;
    private elementMatrixInverted: Matrix33;
    private matrix: Matrix33;
    private matrixInverted: Matrix33;
    private canvasMatrix: Matrix33;
    private canvasMatrixInverted: Matrix33;
    // end 朝生夕死

    // start 这些也是内部使用，但是活得久（可能）
    private lastBeats: number;
    private mouseIn: boolean;
    // end
}
