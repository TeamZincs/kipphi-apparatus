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
import {
    drawBeatLabel,
    formatGridValue,
    insetRect,
    Magnifier,
    splitBeats,
    ZOOM_LEVELS,
} from "./magnifier";
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

    /**
     * 滚轮方向是否反过来（桌面端全局设置 `KPASettings.useRpeWheel`）。
     * 由页面透传，编辑器不自己读设置。
     */
    wheelReversed = false;

    /**
     * 轴向拖动（select 模式下点空白处按住拖）。
     *
     * 拖什么由 `panAxis` 决定：
     *   · `"time"` —— 竖向拖 = 时间前后（派发 `timescroll`，页面去 seek）
     *   · `"x"`    —— 横向拖 = 左右平移（改 `positionBasis`）
     */
    private pan: { startPixelX: number; lastY: number; basis: number } | null =
        null;

    private panBy(y: number, pixelX: number): void {
        const pan = this.pan;

        if (!pan) return;

        // 时间轴：`y` 是模型单位（拍数），直接加即可
        if (this.panAxis === "time") {
            const deltaBeats = -(y - pan.lastY);

            pan.lastY = y;

            if (Math.abs(deltaBeats) > 1e-6) this.scrollTimeBy(deltaBeats);

            return;
        }

        /*
         * 横轴必须用**位图像素**的位移。
         *
         * 用模型 x 会自激：`matrixInverted` 里含 `positionBasis` 的平移，
         * 拖动改了 basis → 同一个屏幕点解出来的 x 也变 → 下一次计算再改 basis
         * → 两个位置来回闪。
         */
        this.positionBasis = pan.basis + (pixelX - pan.startPixelX);
        this.draw(this.lastBeats);
    }

    /**
     * 按住音符类型按钮时记下类型：松手若已滑到画布上，就在那里放一个 note
     * （松手仍在按钮上则只是普通点击，见 `toolbarButtons()` 的 `onRelease`）。
     */
    private dragPlaceType: NoteType | null = null;

    /**
     * 通过**音符类型按钮**进入 edit 之前的模式。
     *
     * 这种"按一下按钮、放一个音符"是一次性的，放完应该回到原来的模式；
     * 直接在 edit 模式里连点的（没有经过按钮）则留在 edit，方便连着放。
     */
    private modeBeforeEdit: NotesEditorState | null = null;

    /** 松手时指针是否落在画布内（拖出即放只有在画布内才真的放） */
    private pointerInsideCanvas = false;

    /** 这次按下落在工具栏按钮上（松手时不再走画布逻辑） */
    private toolbarPressed = false;

    /** 点了"粘贴"按钮，等着在画布上点目标位置 */
    private pendingPaste = false;
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
    /**
     * 范围选择的合并方式。
     *
     * 原来只有"按住 Shift"这条入口会设它，按钮入口没设 → `undefined`，
     * 松手时 `switch (selectState)` 一个分支都不命中，"范围选择一直用不了"。
     */
    selectState: SelectState = SelectState.extend;

    noteType: NoteType;
    noteAbove: boolean = true;

    // begin 可以访问的接口，但是基本上不配置
    /** 多选选中的Note */
    notesSelection: Set<Note>;
    /** 剪切板 */
    clipboard: Set<Note>;
    /** 当前选中的Note */
    selectedNote: Note = null;

    /** 放大镜：按住音符时放大主视图 + 侧边局部视图 */
    readonly magnifier = new Magnifier();

    /**
     * 主视图放大时的缩放中心（按下那一刻的位置）。
     *
     * 局部视图用 `magnifier.anchor` 跟手，主视图必须用这个固定值 ——
     * 否则视野会跟着节点一起跑（自激）。
     */
    private zoomAnchor: { x: number; y: number } | null = null; // 取消弱引用的使用

    /**
     * 缩放中心在画布上的**屏幕位置**（按下那一刻，锁死）。
     *
     * 不能用 `magnifier.pointer`：那个拖动时每帧更新（局部视图靠它选角落），
     * 拿它当缩放中心会让画面跟着鼠标一起跑 —— 表现为"元素飞到对侧"。
     */
    private zoomPointer: { x: number; y: number } | null = null;

    /**
     * 当前放大偏移（相对未放大的 context 原点）。
     *
     * `canvasPoint` 是乘过 `canvasMatrixInverted` 的 —— 它已经相对**平移后**
     * 的原点，要还原成"绝对画布像素"就得把这个偏移加回去。
     */
    private zoomOffset = { x: 0, y: 0 };

    /**
     * 指针的**绝对画布像素**坐标（`pointerInBitmap` 的结果）。
     *
     * 不能用 `canvasPoint` 反推：那个乘过 `canvasMatrixInverted`，基准是"当时
     * （含放大偏移）的 context 原点"，而偏移每帧都在变 —— 用它算锚点会一次
     * 偏一点，`D`/`A` 来回按就累积成"节点越来越往右上跑"。
     */
    private pointerPixel: { x: number; y: number } | null = null;
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
            // 放置预览跟着指针走（下一行的 draw 监听器会把它画出来）
            this.movePreview();
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
        // 挂在父容器上而不是 canvas 本身：画布可能被同层的浮层盖住（播放器画布、
        // 视频层…），那样 canvas 永远收不到 wheel。挂在容器上，事件照旧冒泡上来。
        (this.canvas.parentElement ?? this.canvas).addEventListener(
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

        this.pointerPixel = this.pointerInBitmap(event);

        const { x, y } = canvasCoord.mul(this.matrixInverted);

        // 正在轴向拖动：只做平移，不做吸附/选中
        if (this.pan) {
            this.panBy(y, this.pointerInBitmap(event).x);

            return;
        }

        // const {width, height} = this.canvas
        // const {padding} = this;
        // 横向同理：放大后画出来的细分线也要能吸附
        const positionStep =
            this.positionGridSpan / this.gridSubdivision();

        this.pointedPositionX = Math.round(x / positionStep) * positionStep;
        const accurateBeats = y + this.lastBeats;
        const attached = computeAttach(this.attachableTimes, accurateBeats);
        const timeT: TimeT = this.timeMap.get(attached);
        this.pointedTime = timeT;

        /*
         * 局部视图要跟着指针走：不刷新的话，按住拖走以后小窗口还停在原地，
         * 看到的是一块空白。这里只更新锚点（`track` 不动档位 / 动画）。
         *
         * 传**原始**坐标而不是吸附后的 `pointedPositionX` / `attached`：
         * 否则小窗里的球会被拽到网格上，只有纵向自由。
         */
        this.magnifier.track({ x, y: accurateBeats }, this.canvasPoint);

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

    /** 第二排：判定线切换（‹ #id ›）+ 轴向锁定 + 复制 / 粘贴 */
    readonly navButtons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        y: 14 + 40 + 6,
        gap: 6
    });

    /** 第三排：三种框选模式（替换 / 并集 / 补集） */
    readonly scopeButtons = new ButtonManager("screen", {
        kind: "toolbar",
        size: 40,
        margin: 14,
        y: 14 + (40 + 6) * 2,
        gap: 6
    });

    /**
     * 放大镜档位：**纵向**一列，贴右上角。
     *
     * 之前塞在第二排末尾，横向排成一长条，档位一多就横穿整个画布；
     * 纵向排也更符合"逐级放大"的语义。
     */
    readonly zoomButtons = new ButtonManager("screen", {
        kind: "column",
        x: 0,
        y: 14,
        size: 40,
        step: 46
    });

    /** 切到上一条 / 下一条判定线，并通知页面（它才是 `selectedLineId` 的拥有者） */
    private stepLine(delta: number): void {
        const chart = this.operationList?.chart;

        if (!chart) return;

        const lines = [...chart.judgeLines].sort((a, b) => a.id - b.id);
        const index = lines.findIndex((line) => line === this.target);

        if (index < 0) return;

        const next = lines[(index + delta + lines.length) % lines.length];

        if (!next || next === this.target) return;

        this.target = next;
        this.dispatchEvent(
            Object.assign(new Event("targetchange"), { judgeLine: next }),
        );
        this.draw(this.lastBeats);
    }

    /** 轴向锁定：时间 ↔ 横轴 */
    private togglePanAxis(): void {
        this.panAxis = this.panAxis === "time" ? "x" : "time";
        this.draw(this.lastBeats);
    }

    /**
     * 每次切档重新锚定到"此刻的指针位置"。
     *
     * 缩放中心不是"按下那一刻"就定死了 —— 用户可能已经拖到别处再点下一档，
     * 那时候应该以**当前**指针为准。
     */
    private reanchorZoom(): void {
        const pixel = this.pointerPixel;
        const anchor = this.zoomAnchor;

        if (!pixel || !anchor) return;

        const [left, top, width, height] = this.clippingRect;
        // 相对 context 原点、且**不含**放大偏移（`matrix` 里没有偏移）
        const localX = pixel.x - (left + width / 2) - this.zoomOffset.x;
        const localY =
            pixel.y - (top + height - this.padding) - this.zoomOffset.y;

        /*
         * 反解"指针下面那个世界点"，让它成为新的缩放中心。
         *
         * 只改 `zoomPointer` 不改 `zoomAnchor` 的话，画面会被整体平移（anchor
         * 去追新指针），看起来就是"节点越跑越远"。
         *
         * `matrix`：`x' = (x - anchor.x) * positionRatio`，
         *            `y' = -(y - anchor.y) * timeRatio`（`y` 已是相对 beats 的拍数）
         */
        const worldX = localX / this.positionRatio + anchor.x;
        const worldY = -localY / this.timeRatio + anchor.y;

        this.zoomAnchor = { x: worldX, y: worldY };
        this.zoomPointer = { x: pixel.x, y: pixel.y };
    }

    /**
     * 指针的**绝对画布像素**坐标。
     *
     * 直接用 `pointerInBitmap` 记下的原始像素，不从 `canvasPoint` 反推 ——
     * 后者乘过 `canvasMatrixInverted`（含当帧的放大偏移），跨帧算会累积误差。
     */
    private absolutePointer(): { x: number; y: number } | null {
        return this.pointerPixel;
    }

    /** 档位切换的 0.4s 动画：逐帧重绘直到插值结束 */
    private animateZoom(): void {
        if (!this.magnifier.animatingNow) return;
        if (typeof requestAnimationFrame !== "function") return;

        requestAnimationFrame(() => {
            if (!this.magnifier.animatingNow) return;

            this.draw(this.lastBeats);
            this.animateZoom();
        });
    }

    /**
     * 桌面端 D / A：放大 / 缩小一级。
     *
     * 没有"按住"这个概念，所以先拿当前选中的音符当中心；一个都没选就不动。
     */
    private stepZoom(delta: number): void {
        if (!this.magnifier.anchor && this.selectedNote) {
            this.focusMagnifier();
        }

        if (!this.magnifier.anchor) return;

        /*
         * 只有**放大**才重新锚定：缩小沿用放大到该级时锁定的中心，
         * 否则每次按 `A` 都按当时的指针位置收，画面会往回跑。
         */
        if (delta > 0) this.reanchorZoom();

        this.magnifier.step(delta);
        this.animateZoom();
        this.draw(this.lastBeats);
    }

    /** 按住音符 → 定住放大镜中心；没有选中就收起 */
    private focusMagnifier(): void {
        const note = this.selectedNote;

        if (!note) {
            this.zoomAnchor = null;
            this.zoomPointer = null;
            this.magnifier.reset();

            return;
        }

        const anchor = {
            x: note.positionX,
            y: TC.toBeats(note.startTime),
        };

        // 主视图中心 / 缩放中心都锁在这里；拖动时只有 `magnifier.anchor` 跟手
        this.zoomAnchor = anchor;
        this.zoomPointer = this.absolutePointer();

        this.magnifier.focus(
            anchor,
            // 手指位置决定局部视图放哪一角（别被挡住）
            this.canvasPoint
        );
    }

    /** 第二排按钮表 */
    private navButtonList(): CanvasButton[] {
        return [
            {
                id: "prev-line",
                icon: "previousLine" as const,
                onClick: () => this.stepLine(-1),
            },
            {
                id: "current-line",
                label: `#${this.target?.id ?? "-"}`,
                onClick: () => undefined,
            },
            {
                id: "next-line",
                icon: "nextLine" as const,
                onClick: () => this.stepLine(1),
            },
            {
                // 用方向箭头直接表示"现在能往哪边拖"：
                // 上下箭头 = 滑时间（横向锁），左右箭头 = 滑横轴（时间锁）
                id: "axis-lock",
                icon:
                    this.panAxis === "x"
                        ? ("axisX" as const)
                        : ("axisTime" as const),
                onClick: () => this.togglePanAxis(),
            },
            // 复制 / 粘贴
            {
                id: "copy",
                icon: "copy" as const,
                disabled: this.notesSelection.size === 0,
                onClick: () => {
                    this.copy();
                    this.draw(this.lastBeats);
                },
            },
            {
                id: "paste",
                icon: "paste" as const,
                disabled: (this.clipboard?.size ?? 0) === 0,
                /*
                 * 两种用法：
                 *   · 点一下 → 进入"待粘贴"，再在画布上点目标位置（松手才粘）
                 *   · 按住拖到画布上 → 松手就在那里粘（和拖音符类型按钮一致）
                 */
                onPress: () => {
                    this.pendingPaste = true;
                    this.dragPasteMode = true;
                },
                onRelease: (inside: boolean) => {
                    const dragging = this.dragPasteMode;

                    this.dragPasteMode = false;

                    if (inside) {
                        // 松手还在按钮上 = 普通点击，留着 pendingPaste 等下一次点画布
                        this.draw(this.lastBeats);

                        return;
                    }

                    if (dragging && this.pasteGhosts.length > 0 && this.pointerInsideCanvas) {
                        this.commitPreview();
                    } else {
                        // 拖出去但没落在画布上（比如滑到播放器上）：取消
                        this.pendingPaste = false;
                        this.pastingFromClipboard = false;
                        this.pasteGhosts = [];
                        this.preview = null;
                    }

                    this.draw(this.lastBeats);
                },
            },
            {
                // 详细信息：交给页面弹底部面板（编辑器自己不做 UI）
                id: "inspect",
                icon: "info" as const,
                disabled: !this.selectedNote,
                onClick: () => {
                    this.dispatchEvent(new Event("inspect"));
                },
            },
        ];
    }

    /**
     * 放大镜的排形按钮。
     *
     * 只在按住元素（`anchor` 有值）时出现；当前档位是 N，就列出 2x…N×2 的
     * 下一档，和 TODO 里"2x 上方多出一个 4x"一致。
     */
    private magnifierButtons(): CanvasButton[] {
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
                        this.reanchorZoom();
                    }

                    this.magnifier.setIndex(level);
                    this.animateZoom();
                    this.draw(this.lastBeats);
                },
            });
        }

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
            icon,
            active:
                this.state === NotesEditorState.selectScope &&
                this.selectState === state,
            onClick: () => this.setSelectState(state),
        }));
    }

    /** 切范围选择的合并方式，并进入 selectScope 模式 */
    private setSelectState(state: SelectState): void {
        this.lastSelectState = state;
        this.selectState = state;
        this.state = NotesEditorState.selectScope;
        this.draw(this.lastBeats);
    }

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
                // 按下就切到 edit + 记下"可能要拖出去放"
                onPress: () => {
                    const previous = this.state;

                    this.noteType = type;
                    this.dragPlaceType = type;
                    this.setMode("edit");
                    // 记住进来之前是什么模式：放完要回到它（而不是一直停在 edit）
                    this.modeBeforeEdit =
                        previous === NotesEditorState.edit ? null : previous;
                },
                onRelease: (inside: boolean) => {
                    const placing = this.dragPlaceType;

                    this.dragPlaceType = null;

                    // 松手还在按钮上 = 普通点击（只切类型，预览丢掉）；
                    // 滑到画布上才真正落子
                    if (inside || placing === null) {
                        this.preview = null;
                        this.draw(this.lastBeats);

                        return;
                    }

                    this.commitPreview();
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
        this.navButtons.draw(this.context, this.navButtonList());
        this.scopeButtons.draw(this.context, this.scopeButtonList());

        // 档位按钮贴右边缘：x 依赖画布宽度，每帧重算
        this.zoomButtons.setLayout({
            kind: "column",
            x: this.context.canvas.width - 40 - 14,
            y: 14,
            size: 40,
            step: 46
        });
        this.zoomButtons.draw(this.context, this.magnifierButtons());

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
        // 手动切模式就不再有"放完回原模式"这回事（类型按钮会在 setMode 之后另行设置）
        this.modeBeforeEdit = null;

        this.state =
            mode === "edit"
                ? NotesEditorState.edit
                : mode === "scope"
                  ? NotesEditorState.selectScope
                  : NotesEditorState.select;

        // 进范围选择必须带上合并方式，否则松手时不会选中任何东西
        if (mode === "scope") this.selectState = this.lastSelectState;

        this.draw();
    }

    /** 点到了按钮就吃掉这次事件 */
    private handleToolbarDown(x: number, y: number): boolean {
        const hit =
            this.buttons.press(x, y) !== null ||
            this.navButtons.press(x, y) !== null ||
            this.scopeButtons.press(x, y) !== null ||
            this.zoomButtons.press(x, y) !== null;

        this.toolbarPressed = hit;

        return hit;
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

        // 桌面端有个全局设置 `useRpeWheel`（滚轮方向反过来），由页面透传进来
        const sign = this.wheelReversed ? -1 : 1;
        const deltaBeats = (event.deltaY / 100) * (this.timeSpan / 10) * sign;

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

    /**
     * 在给定时间/横坐标建一个音符并挂到目标判定线上。
     *
     * 从 `downHandler` 的 edit 分支抽出来的 —— 现在两条路都用它：
     *   · 在画布上点一下（edit 模式）；
     *   · 按住音符类型按钮拖到画布上松手（拖出即放）。
     */
    private createNote(
        type: NoteType,
        startTime: TimeT | undefined,
        positionX: number | undefined,
    ): Note | null {
        if (!startTime || positionX === undefined) return null;

        const endTime: TimeT =
            type === NoteType.hold
                ? TC.validateIp([startTime[0], startTime[1] + 1, startTime[2]])
                : [...startTime];

        const createOptions: NoteDataKPA = {
            ...this.defaultNoteConfig,
            endTime,
            startTime,
            positionX,
            above: this.noteAbove ? 1 : 0,
            speed: this.targetNNList?.speed || this.defaultNoteConfig.speed,
            type,
        } as NoteDataKPA;

        // 这里只能用 visibleBeats 创建，因此不需要 tc
        const note = Note.fromKPAJSON(
            createOptions,
            this.operationList.chart,
            "",
        );

        this.operationList.tryDo(
            () => new O.NoteAddOperation(note, this.target.getNode(note, true)),
        );

        return note;
    }

    private selectNote(note: Note): void {
        this.selectedNote = note;
        this.selectingTail = note.type === NoteType.hold;
        this.dispatchEvent(new KPANoteSelectedEvent(note));
    }

    /**
     * 放置预览：**对象还不存在**，只在画布上画一个半透明的样子跟着指针。
     *
     * 两条路都走它：
     *   · 编辑模式在画布上按下（拖到合适位置再松手）；
     *   · 按住音符类型按钮拖出（拖到画布上松手）。
     * 松手时才 `commitPreview()` 真正 `createNote()`。
     */
    private preview: { type: NoteType; time: TimeT; positionX: number } | null =
        null;

    /** 开始预览（拿不到指针时间就算了） */
    private beginPreview(type: NoteType): void {
        if (!this.pointedTime || this.pointedPositionX === undefined) return;

        this.preview = {
            type,
            time: this.pointedTime,
            positionX: this.pointedPositionX,
        };
        this.draw(this.lastBeats);
    }

    /** 这次预览是为了粘贴（松手时走 paste，而不是新建一个） */
    private pastingFromClipboard = false;

    /** 按住"粘贴"按钮拖出来放的（松手在画布上就粘） */
    private dragPasteMode = false;

    /**
     * 粘贴预览：剪贴板里**每一个**音符的落点。
     *
     * 只画第一个是不够的 —— 复制一串音符时，用户需要看到整串的排列。
     * `paste()` 的对齐规则是"最早的那个对齐到指针时间、各自 X 不变"，
     * 这里照抄同一套（`clone(offset)` 只改时间）。
     */
    private pasteGhosts: {
        type: NoteType;
        time: TimeT;
        positionX: number;
    }[] = [];

    /** 按当前指针位置重算所有预览落点 */
    private syncPasteGhosts(): void {
        const clipboard = this.clipboard;

        if (!clipboard || clipboard.size === 0 || !this.pointedTime) {
            this.pasteGhosts = [];

            return;
        }

        const notes = [...clipboard].sort((a: Note, b: Note) =>
            TC.gt(a.startTime, b.startTime) ? 1 : -1,
        );
        const offset = TC.sub(this.pointedTime, notes[0]!.startTime);

        this.pasteGhosts = notes.map((note) => ({
            type: note.type,
            time: TC.add(note.startTime, offset),
            positionX: note.positionX,
        }));
    }

    /** 用剪贴板里第一个音符起一个预览（视觉提示，松手才真的 paste） */
    private beginPastePreview(): boolean {
        const clipboard = this.clipboard;

        if (!clipboard || clipboard.size === 0) return false;

        const first = [...clipboard][0];

        if (!first) return false;

        this.pastingFromClipboard = true;
        this.beginPreview(first.type);
        this.syncPasteGhosts();

        return true;
    }

    /** 指针移动时把预览挪过去 */
    private movePreview(): void {
        // 指针在画布上移动，说明"这次手势"还落在画布内
        this.pointerInsideCanvas = true;

        // 从按钮拖出来的：指针第一次进画布才建预览（按下那一刻还没有坐标）
        if (!this.preview) {
            if (this.pendingPaste) {
                this.beginPastePreview();

                return;
            }

            if (this.dragPlaceType) this.beginPreview(this.dragPlaceType);

            return;
        }

        if (!this.pointedTime) return;

        this.preview = {
            ...this.preview,
            time: this.pointedTime,
            positionX: this.pointedPositionX ?? this.preview.positionX,
        };

        // 粘贴预览要跟着指针整串走
        if (this.pastingFromClipboard) this.syncPasteGhosts();
    }

    /** 松手：真的建出来并选中 */
    private commitPreview(): void {
        const preview = this.preview;

        this.preview = null;
        this.pasteGhosts = [];

        if (!preview) return;

        // 滑出画布就不落子（拖出去又拖回来时 pointerInsideCanvas 会是 true）
        if (!this.pointerInsideCanvas) {
            this.draw(this.lastBeats);

            return;
        }

        // 粘贴：位置直接用当前指针，`paste()` 自己按剪贴板最早的那个对齐
        if (this.pastingFromClipboard) {
            this.pastingFromClipboard = false;
            this.pendingPaste = false;

            this.pointedTime = preview.time;
            this.pointedPositionX = preview.positionX;
            this.paste(false, false);

            this.wasEditing = true;
            this.state = NotesEditorState.edit;
            this.draw(this.lastBeats);

            return;
        }

        const note = this.createNote(
            preview.type,
            preview.time,
            preview.positionX,
        );

        if (note) {
            this.selectNote(note);
            this.wasEditing = true;

            // 由**音符类型按钮**进入的编辑是"单发"的：放完回到原来的模式；
            // 本来就在 edit 模式里连点的，留在 edit 方便接着放。
            if (this.modeBeforeEdit !== null) {
                this.state = this.modeBeforeEdit;
                this.modeBeforeEdit = null;
            } else {
                this.state = NotesEditorState.edit;
            }
        }

        this.draw(this.lastBeats);
    }

    /** 画预览（半透明的音符贴图，跟着指针走） */
    private drawPreview(beats: number): void {
        // 粘贴：整串一起画（只画第一个看不到排列）
        if (this.pasteGhosts.length > 0) {
            const width = this.noteWidth;
            const height = this.noteHeight;

            this.context.save();
            this.context.globalAlpha = 0.55;

            for (const ghost of this.pasteGhosts) {
                const start = TC.toBeats(ghost.time) - beats;
                const { x, y } = new Coordinate(ghost.positionX, start).mul(
                    this.matrix,
                );

                this.context.drawImage(
                    this.respack.getNoteFromType(ghost.type),
                    x - width / 2,
                    y - height / 2,
                    width,
                    height,
                );
            }

            this.context.restore();

            return;
        }

        const preview = this.preview;

        if (!preview) return;

        const start = TC.toBeats(preview.time) - beats;
        const { x, y } = new Coordinate(preview.positionX, start).mul(
            this.matrix,
        );

        const width = this.noteWidth;
        const height = this.noteHeight;

        this.context.save();
        this.context.globalAlpha = 0.55;
        this.context.drawImage(
            this.respack.getNoteFromType(preview.type),
            x - width / 2,
            y - height / 2,
            width,
            height,
        );
        this.context.restore();
    }

    /**
     * 用事件更新"指针指向的时间 / 横坐标"。
     *
     * `moveHandler` 里有一份相同的换算，但那段还要算 `timeT` 给拖动改时间用，
     * 拆出来会把那边搅乱 —— 这里只给"松手"用（拖出即放要按离开的位置落音符）。
     */
    private updatePointedFrom(event: TouchEvent | MouseEvent): void {
        // 松手落在画布外（比如滑回了播放器上）就不更新，也标记为"不在画布内"，
        // 免得拿上一次的坐标在莫名其妙的地方放音符
        const point = this.pointerInBitmap(event);

        this.pointerInsideCanvas =
            point.x >= 0 &&
            point.y >= 0 &&
            point.x <= this.canvas.width &&
            point.y <= this.canvas.height;

        if (!this.pointerInsideCanvas) return;

        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY)
            .mul(this.elementMatrixInverted)
            .mul(this.canvasMatrixInverted);

        const { x, y } = canvasCoord.mul(this.matrixInverted);

        this.pointedPositionX =
            Math.round(x / this.positionGridSpan) * this.positionGridSpan;

        const attached = computeAttach(
            this.attachableTimes,
            y + this.lastBeats,
        );

        this.pointedTime = this.timeMap.get(attached);
    }

    downHandler(event: TouchEvent | MouseEvent) {
        const { width, height } = this.canvas;
        // console.log(width, height)
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);

        const canvasCoord = (this.canvasPoint = new Coordinate(offsetX, offsetY)
            .mul(this.elementMatrixInverted)
            .mul(this.canvasMatrixInverted));

        this.pointerPixel = this.pointerInBitmap(event);

        // 按钮优先于画布：命中就直接吃掉这次事件（按钮在位图像素空间）
        {
            const point = this.pointerInBitmap(event);

            if (this.handleToolbarDown(point.x, point.y)) return;
        }

        // 待粘贴：这一下只用来定位，松手才真的粘
        if (this.pendingPaste) {
            this.updatePointedFrom(event);

            if (this.beginPastePreview()) this.draw(this.lastBeats);

            return;
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
                    // 放大镜以这个音符为中心（松手才收起）
                    this.focusMagnifier();
                    // 按住不动也得把局部视图画出来 —— 否则要等下一次 move 才看得见
                    this.draw(this.lastBeats);
                    this.dispatchEvent(
                        new KPANoteSelectedEvent(this.selectedNote),
                    );
                }
                // 点空白处 = 开始轴向拖动（拖什么看 panAxis）
                if (!snote) {
                    this.pan = {
                        startPixelX: this.pointerInBitmap(event).x,
                        lastY: y,
                        basis: this.positionBasis,
                    };
                }

                this.wasEditing = false;
                break;
            case NotesEditorState.edit:
            case NotesEditorState.placingHold:
                // 按下只**起预览**：拖到合适位置松手才落子（和拖出即放同一条路）
                this.beginPreview(
                    this.state === NotesEditorState.placingHold
                        ? NoteType.hold
                        : this.noteType,
                );
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
            // 先按松手的位置更新指针指向（拖出即放要落在"离开的地方"），
            // 再把事件交给按钮管理器 —— `onRelease` 是在 release 里触发的
            this.updatePointedFrom(event);

            const point = this.pointerInBitmap(event);

            this.buttons.release(point.x, point.y);
            this.navButtons.release(point.x, point.y);
            this.scopeButtons.release(point.x, point.y);
            this.zoomButtons.release(point.x, point.y);
        }

        // 这次手势属于按钮（onRelease 已在上面处理过），别再走画布那套
        if (this.toolbarPressed) {
            this.toolbarPressed = false;

            return;
        }

        // 在画布上按下起的预览：松手就在这里落子（状态由 commitPreview 决定）
        if (this.preview) {
            this.commitPreview();

            return;
        }

        // 轴向拖动结束
        this.pan = null;

        // 松手：放大镜回到 1x（选中状态保留）
        this.magnifier.reset();
        this.zoomAnchor = null;
        this.zoomPointer = null;

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
    /**
     * 放大时的网格细分倍数。
     *
     * 按 2 的幂取整（1x → 1、2x~3x → 2、4x~7x → 4…）：连续倍率会让步长变成
     * 非整数，网格每帧漂一点点，看起来像在抖。
     */
    private gridSubdivision(
        zoom = this.magnifier.zooming ? this.magnifier.zoom : 1
    ): number {
        return 2 ** Math.max(0, Math.floor(Math.log2(Math.max(1, zoom))));
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
        // 放大镜：只临时乘倍率，不改 `timeSpan` / `positionSpan` 本身
        //（那两个是用户的视野设置，松手要还原）
        const zoom = this.magnifier.zooming ? this.magnifier.zoom : 1;
        this.positionRatio = (width * zoom) / this.positionSpan;
        this.timeRatio = (height * zoom) / this.timeSpan;
        this.context.resetTransform();

        const anchor = this.magnifier.zooming ? this.zoomAnchor : null;

        if (anchor) {
            /*
             * 缩放中心用**按下时锁定**的 `zoomPointer`，不是实时的
             * `magnifier.pointer` —— 后者拖动时每帧都变，画面会跟着鼠标跑。
             */
            const pointer = this.zoomPointer ?? {
                x: left + width / 2,
                y: top + height - this.padding,
            };
            /*
             * 以**按住的那一点**为中心缩放：世界点 `anchor` 始终落在手指
             * 所在的那一像素上，而不是被搬到画布中心（那样一放大整个画面
             * 会跳一下，手底下的东西跑掉）。
             *
             * 偏移放进 **context**，不是只放进 `matrix`：网格是 `drawCoordination`
             * 里按像素算的（不经过 `matrix`），只改 `matrix` 的话网格不动、
             * 节点乱跑 —— 两边就对不上了。
             */
            const px = pointer.x - (left + width / 2);
            const py = pointer.y - (top + height - this.padding);

            this.context.translate(
                left + width / 2 + px,
                top + height - this.padding + py,
            );
            this.zoomOffset = { x: px, y: py };

            this.matrix = identity
                .scale(this.positionRatio, -this.timeRatio)
                .translate(-anchor.x, -(anchor.y - this.lastBeats));
        } else {
            this.zoomOffset = { x: 0, y: 0 };
            this.context.translate(left + width / 2, top + height - this.padding);
            this.matrix = identity
                .translate(this.positionBasis, 0)
                .scale(positionRatio, -timeRatio);
        }

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

        /*
         * 网格和节点必须用同一个世界原点：
         *   · 平时是 `positionBasis` / `beats`（用户视野）；
         *   · 放大时是 `zoomAnchor`（`matrix` 也是围绕它平移的）。
         * 不统一的话网格不动、节点被搬走 —— 看起来就是"网格错位"。
         */
        const anchor = this.magnifier.zooming ? this.zoomAnchor : null;
        const originX = anchor ? -anchor.x : positionBasis;
        const originY = anchor ? anchor.y : beats;

        /*
         * 网格要铺到**屏幕边缘**，不能按 `±width/2` 算：放大时 context 原点
         * 被平移了 `zoomOffset`，还用 `±width/2` 会让一侧缺一整块（表现为
         * "左边一片灰"）、标签被推出画布。
         *
         * 下面这几个是屏幕四边在"context 原点坐标系"里的位置。
         */
        const screenLeft = -viewportWidth / 2 - this.zoomOffset.x;
        const screenRight = viewportWidth / 2 - this.zoomOffset.x;
        /*
         * 音符画布的原点**不在中心**：`updateMatrix` 把它放在
         * `(left + width/2, top + height - padding)`，即底部中心再抬一个
         * `padding`。所以纵向要按"原点下方像素"算，不能套 `±height/2`。
         */
        const screenTop = -(viewportHeight - padding) - this.zoomOffset.y;
        const screenBottom = padding - this.zoomOffset.y;

        context.textAlign = "left";

        /*
         * 清屏 / 铺底色走**屏幕坐标**：放大时 context 原点被平移了
         * （见 `updateMatrix`），还按 `-viewportWidth/2` 算会留下一圈残影。
         */
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#333d";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        context.fillStyle = "#333d";
        context.font = `${scaleFont(30, this.canvas.width)}px Phigros`;

        context.save();
        context.lineWidth = 5;
        context.strokeStyle = "#EEE";
        const textPosX = screenLeft + 10;
        // 基线
        drawLine(context, screenLeft, 0, screenRight, 0);

        context.fillStyle = "#EEE6";
        context.fillText(`Kipphi v${VERSION}`, textPosX, -70);
        context.fillText("by Zes-Minkey-Young", textPosX, -40);
        context.fillText("MIT Licensed", textPosX, -10);

        // 画布上的状态文字（State / Cursor / Selected …）已移到工具栏按钮里
        context.restore();

        // 绘制x坐标线
        // 放大时把网格按 2 的幂细分：不然放大后一格稀得没法对齐（TODO #8）
        const sub = this.gridSubdivision();
        const positionStep = positionGridSpan / sub;
        // 计算上下界
        const upperEnd =
            Math.ceil(
                (screenRight - originX) / positionStep / positionRatio,
            ) * positionStep;
        const lowerEnd =
            Math.ceil(
                (screenLeft - originX) / positionStep / positionRatio,
            ) * positionStep;
        context.strokeStyle = context.fillStyle = this.positionGridColor;
        context.lineWidth = 1;
        context.textAlign = "center";

        for (
            let value = lowerEnd;
            value < upperEnd;
            value += positionStep
        ) {
            const positionX = value * positionRatio + originX;
            const major =
                Math.abs(value / positionGridSpan - Math.round(value / positionGridSpan)) < 1e-6;

            drawLine(context, positionX, screenTop, positionX, screenBottom);

            // 数字只标在原网格上，细分线不标（位置在**顶部**，别挪到底部）
            if (major) {
                context.fillText(
                    Math.round(value) + "",
                    positionX,
                    screenTop + padding,
                );
            }
        }
        context.textAlign = "right";

        context.strokeStyle = this.timeGridColor;
        // 绘制时间线
        const startBeats = Math.floor(originY - timeSpan / this.gridSubdivision());
        const stopBeats = Math.ceil(originY + timeSpan / this.gridSubdivision());
        context.lineWidth = 3;
        const attachableTimes = [];
        const map = new Map<number, TimeT>();
        const timeDivisor = this.timeDivisor;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - originY) * timeRatio;
            drawLine(context, screenLeft, -positionY, screenRight, -positionY);
            context.save();
            context.fillStyle = this.timeGridColor;
            context.fillText(time + "", screenRight - padding, -positionY - 4);

            attachableTimes.push(time);
            map.set(time, [time, 0, timeDivisor]);

            context.lineWidth = 1;

            /*
             * 小刻度按放大倍数细分：`minorDivisor = timeDivisor * sub`。
             *
             * 细分出来的线**同样参与吸附** —— 放大后画出密线却吸不上，
             * 等于白画（用户要的是"线在哪儿就能落在哪儿"）。
             * `TimeT` 的分母跟着变大（4 → 8 → 16），是合法值。
             */
            const minorDivisor = timeDivisor * sub;

            for (let i = 1; i < minorDivisor; i++) {
                const minorBeats =
                    time + (i / minorDivisor) * timeGridSpan;
                const minorPosY = (minorBeats - originY) * timeRatio;

                map.set(minorBeats, [time, i, minorDivisor]);
                attachableTimes.push(minorBeats);

                drawLine(
                    context,
                    screenLeft,
                    -minorPosY,
                    screenRight,
                    -minorPosY,
                );
            }
            context.restore();
        }
        this.attachableTimes = attachableTimes;
        this.timeMap = map;

        if (this.showsNNNListAttachable) {
            const nnnList = this.operationList.chart.nnnList;
            this.lookList(nnnList, startBeats, stopBeats, originY);
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

        // 放大镜：推进 0.4s 动画，并在放大时把按住的那个音符摆到中心
        this.magnifier.tick();

        /*
         * 主视图居中用**按下那一刻**的锚点（`zoomAnchor`），不是 `magnifier.anchor`。
         *
         * `magnifier.anchor` 拖动时每帧都会跟着节点走（局部视图靠它刷新），
         * 拿它算 `positionBasis` 会自激：位置变 → 视野变 → 世界坐标换算变
         * → 吸附值变 → 位置又变。局部视图跟手、主视图锁死，两者分开。
         */
        /*
         * 视野不因为放大而改变：居中 / 滚动都不做，缩放由 `updateMatrix`
         * 围绕"按住的那一点"完成（见那里的注释）。这样松手回到 1x 时
         * 画面不会跳，`positionBasis` / `lastBeats` 也就不用存基线再还原。
         */
        this.lastBeats = beats;

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
        // 放大时 `beats` 是为了居中算出来的临时值，不能写回视野
        if (!this.magnifier.zooming) this.lastBeats = beats;
        // 预览画在音符之上、按钮之下（这里还带着相机变换，和 drawNote 同一个空间）
        this.drawPreview(beats);

        // 局部放大视图盖在内容上、按钮下面
        this.drawMagnifier();

        // 画在最后：编辑器自己的背景填充会把前面画的盖住
        this.drawToolbar();
    }

    /** 侧边局部放大视图（按住元素时才有） */
    private drawMagnifier(): void {
        if (!this.magnifier.active) return;

        const [, , width, height] = this.clippingRect;
        const rect = insetRect(
            width,
            height,
            this.padding,
            this.magnifier.pointer
        );
        const { context } = this;

        /*
         * 必须先把变换清成屏幕坐标：`drawPreview` 出来时 context 还带着相机
         * 变换（`translate` + 缩放），直接画的话局部视图会跑到画布外面 ——
         * 表现就是"根本没显示"。
         */
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);

        this.magnifier.drawInset(context, rect, (inner, scale, anchor) =>
            this.paintMagnified(inner, scale, anchor, rect[2])
        );

        context.restore();
    }

    /**
     * 局部视图内容：网格 + 选中音符。
     *
     * 调用时坐标系原点已在框中心，`scale` 是相对主视图的倍率
     *（局部始终比主视图高一档）。
     */
    private paintMagnified(
        context: CanvasRenderingContext2D,
        scale: number,
        anchor: { x: number; y: number },
        size: number
    ): void {
        // `positionRatio` / `timeRatio` 已经含主视图倍率，这里只补"相对主视图
        // 再放大"的那一档（局部恒比主视图高一档）
        const factor = scale / Math.max(1, this.magnifier.zoom);
        const unitX = this.positionRatio * factor;
        const unitT = this.timeRatio * factor;
        const half = size / 2;

        // 这个小窗格能装下的世界范围
        const halfValue = unitX > 0 ? half / unitX : 0;
        const halfBeats = unitT > 0 ? half / unitT : 0;

        context.save();
        context.font = `${Math.max(9, Math.round(size * 0.075))}px system-ui, sans-serif`;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.lineWidth = 1;

        /*
         * 局部视图 = 主视图的**下一档**，网格也按同一套 `gridSubdivision`
         * 往前推一档（`drawCoordination` 用 `gridSubdivision(zoom)`，
         * 这里用 `gridSubdivision(localZoom)`），两边才是同一条规则。
         */
        const subLocal = this.gridSubdivision(this.magnifier.localZoom);
        const valueStep = this.positionGridSpan / subLocal;
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

        /*
         * 时间方向要和主视图**同一个密度**：主视图一拍里有 `timeDivisor`
         * 个小格，放大时再乘 `gridSubdivision`；小窗口是再高一档，
         * 所以用 `localZoom` 的细分。
         */
        const timeStep = this.timeGridSpan / (this.timeDivisor * subLocal);
        const startBeat =
            Math.ceil((anchor.y - halfBeats) / timeStep) * timeStep;

        for (let beat = startBeat; beat <= anchor.y + halfBeats; beat += timeStep) {
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

        context.restore();

        /*
         * 音符：画在**实际吸附到的位置**上，不是中心。
         *
         * 中心是手指（绿球），音符会跳到最近的吸附点 —— 这样才看得出
         * "松手会落在哪"。两个都画在中心的话，吸附与否完全没有反馈。
         */
        const note = this.selectedNote;

        if (note) {
            const width = this.noteWidth;
            const height = this.noteHeight;
            const snappedX = this.pointedPositionX ?? anchor.x;
            const snappedBeats = this.pointedTime
                ? TC.toBeats(this.pointedTime)
                : anchor.y;
            const x = (snappedX - anchor.x) * unitX;
            const y = -(snappedBeats - anchor.y) * unitT;

            context.drawImage(
                this.respack.getNoteFromType(note.type),
                x - width / 2,
                y - height / 2,
                width,
                height
            );
        }

        /*
         * 指针位置：绿色半透明小球，**压在贴图上**（半透明，不挡识别）。
         *
         * 半径跟小窗尺寸走，和事件小窗保持一致 —— 别按音符贴图的宽度算，
         * 那个比事件节点大好几倍。
         */
        context.fillStyle = "rgba(80, 220, 140, 0.45)";
        context.beginPath();
        context.arc(0, 0, Math.max(5, size * 0.05), 0, Math.PI * 2);
        context.fill();
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
