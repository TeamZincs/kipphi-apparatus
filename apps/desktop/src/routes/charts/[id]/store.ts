import { writable } from "@graints/runtime";
import { type NotesEditor, type EventSequenceEditors, NotesEditorState, EventCurveEditorState, SelectState, NewNodeState, EventSequenceEditor } from "@kpa/canvas"
import { easingArray, EventEndNode, EventNode, EventStartNode, EventType, NNList, Note, NoteType, type EventMacroTime, type EventMacroValue, type ExtendedEventTypeName, type MacroEvaluator, type NoteMacro, type Op } from "kipphi";
import type { Player } from "kipphi-player";
type OperationList = Op.OperationList;

/** @enum */
export const Sidebar = {
    DEFAULT: 0,
    NOTES: 1,
    EVENTS: 2
}

/** @enum */
export const SecondarySidebar = {
    LINES: 0,
    NOTE: 1,
    EVENT: 2,
    LINE: 3,
    CHART: 4,
    MULTI_NODE: 5,
    MULTI_NOTE: 6,
    ERRORS: 7,
    GENERAL: 8,
    SCRIPT: 9,
    MACRO: 10
}

/** 谱面中可能出现的宏的类型 */
export type AnyMacro = NoteMacro | EventMacroTime | EventMacroValue | MacroEvaluator<any>;

export let player: Player;
export let notesEditor: NotesEditor;
export let eventSequenceEditors: EventSequenceEditors;
export let chartId: string;
export function setID(id: string) { chartId = id; }
export let operationList: OperationList;
/**
 * 先把 `operationList` 塞进 store。
 *
 * 侧栏里的组件在建树时就会用它（`addEventListener`、读 `.chart`），而 grain 的 `{#if}`
 * 只控制插入、内容照样建 —— 所以它得在模板之前就位，不能等 `init()`。
 */
export function setOperationList(ol: OperationList) { operationList = ol; }
export function init(ne: NotesEditor, ece: EventSequenceEditors, ol: OperationList, pl: Player) {
    notesEditor = ne;
    eventSequenceEditors = ece;
    operationList = ol;
    player = pl;
}

// GlobalContext - 每个属性独立的 writable store
export const selectedLineNumber = writable(0);
export const activeSidebar = writable(Sidebar.DEFAULT);
export const activeSecondarySidebar = writable(SecondarySidebar.LINES);
/** 上一次激活的次级侧边栏，用于ctrl切线后还原 */
export const previousActiveSecondarySidebar = writable(SecondarySidebar.LINES);

export const selectedNote = writable<Note | null>(null);
export const selectedNotes = writable<Set<Note> | null>(null);
export const selectedNode = writable<EventStartNode<any> | EventEndNode<any> | null>(null);
export const selectedNodes = writable<Set<EventStartNode<any>> | null>(null);
export const timeDivisor = writable(4);
/** 宏次侧栏中正在编辑的宏 */
export const selectedMacro = writable<AnyMacro | null>(null);

/** 跳转到宏次侧栏，并选中给定的宏 */
export function gotoMacro(macro: AnyMacro) {
    selectedMacro.set(macro);
    activeSecondarySidebar.set(SecondarySidebar.MACRO);
}

// PlayerSettings - 每个属性独立的 writable store
export const playerShowsUI = writable(true);
export const playerShowsLineID = writable(false);
export const playerHitEffectNoFollows = writable(true);
export const playerShowsCurve = writable(false);
export const playerCameraZoom = writable(1);

// NotesEditorSettings - 每个属性独立的 writable store
export const notesEditChecked = writable(false);
export const notesShowsNNN = writable(false);
export const notesNoteType = writable(NoteType.tap);
export const notesTimeSpan = writable(4);
export const notesScopeSelectMode = writable(SelectState.none);
export const notesPositionCenter = writable(0);
export const notesPositionXInterval = writable(135);
export const notesAbove = writable(true);

// EventSequenceEditorSettings - 每个属性独立的 writable store
export const eventsEditChecked = writable(false);
export const eventsLayer = writable<"0" | "1" | "2" | "3" | "ex" | "glb">("0");
export const eventsType = writable<keyof typeof EventType | "general">("general");
export const eventsTimeSpan = writable(4);
export const eventsScopeSelectMode = writable(SelectState.none);
export const newNodeState = writable(NewNodeState.controlsBoth);

// useEasing 和 templateName 作为独立的 writable stores
export const useEasing = writable(1);
export const templateName = writable("");

// === GlobalContext 订阅 ===
selectedLineNumber.subscribe(v => {
    if (!player) return;
    player.greenLine = v;
    notesEditor.target = player.chart.judgeLines[v];
    eventSequenceEditors.changeTarget({
        judgeLine: player.chart.judgeLines[v]
    });
    notesEditor.draw();
    eventSequenceEditors.draw();
    player.render();
});

timeDivisor.subscribe(v => {
    if (!notesEditor || !eventSequenceEditors) return;
    notesEditor.timeDivisor = v;
    eventSequenceEditors.timeDivisor = v;
    notesEditor.draw();
    eventSequenceEditors.draw();
});

// === PlayerSettings 订阅 ===
playerShowsUI.subscribe(v => {
    if (player && player.showsInfo !== v) {
        player.showsInfo = v;
        player.render();
    }
});

playerShowsLineID.subscribe(v => {
    if (player && player.showsLineID !== v) {
        player.showsLineID = v;
        player.render();
    }
});

playerHitEffectNoFollows.subscribe(v => {
    if (!player) return;
    player.hitEffectNoFollows = v;
});

playerShowsCurve.subscribe(v => {
    if (!player) return;
    player.showsLineCurve = v;
});

playerCameraZoom.subscribe(v => {
    if (!player) return;
    player.cameraRatio = v;
    player.render();
})

// === NotesEditorSettings 订阅 ===
notesEditChecked.subscribe(v => {
    if (!notesEditor) return;
    if (v) {
        notesEditor.state = NotesEditorState.edit;
    } else {
        notesEditor.state = NotesEditorState.select;
    }
});

notesShowsNNN.subscribe(v => {
    if (!notesEditor) return;
    if (notesEditor.showsNNNListAttachable !== v) {
        notesEditor.showsNNNListAttachable = v;
        notesEditor.draw();
    }
});
// 特喵的codebuddy，居然忘了帮我写这个
notesNoteType.subscribe(v => {
    if (!notesEditor) return;
    if (notesEditor.noteType !== v) {
        notesEditor.noteType = v;
        notesEditor.draw();
    }
});

notesTimeSpan.subscribe(v => {
    if (!notesEditor) return;
    notesEditor.timeSpan = v;
    notesEditor.draw();
});

notesScopeSelectMode.subscribe(v => {
    if (!notesEditor) return;
    notesEditor.selectState = v;
    if (v !== SelectState.none) {
        notesEditor.state = NotesEditorState.selectScope;
        notesEditor.lastSelectState = v;
    } else {
        notesEditor.state = NotesEditorState.select;
    }
    notesEditor.draw();
});

notesPositionCenter.subscribe(v => {
    if (!notesEditor) return;
    notesEditor.setValueAsCenter(v);
    notesEditor.draw();
});

notesPositionXInterval.subscribe(v => {
    if (!notesEditor) return;
    notesEditor.positionGridSpan = v;
    notesEditor.draw();
});

notesAbove.subscribe(v => {
    if (!notesEditor) return;
    notesEditor.noteAbove = v;
})

// === EventSequenceEditorSettings 订阅 ===
eventsEditChecked.subscribe(v => {
    if (!eventSequenceEditors) return;
    const activatedEditor = eventSequenceEditors.activatedEditor;
    if (!(activatedEditor instanceof EventSequenceEditor)) {
        return
    }
    if (v) {
        activatedEditor.state = EventCurveEditorState.edit;
    } else {
        activatedEditor.state = EventCurveEditorState.select;
    }
});

eventsLayer.subscribe(v => {
    if (!eventSequenceEditors) return;
    eventSequenceEditors.changeTarget({ layerID: v });
});

eventsType.subscribe(v => {
    if (!eventSequenceEditors) return;
    if (v === "general") {
        eventSequenceEditors.activatedEditor = eventSequenceEditors.general;
        return;
    }
    // 按事件类型名取编辑器：`EventSequenceEditors` 没有索引签名（运行时是有的），
    // 各类型编辑器的公共基类上才有 `state`，所以这里只能放宽成 any
    const e = eventSequenceEditors.activatedEditor = (eventSequenceEditors as unknown as Record<
        string,
        any
    >)[v];
    eventsEditChecked.set(e.state === EventCurveEditorState.edit);
    if (v === "easing") {
        switchEasing(templateName.get())
    }
});

eventsTimeSpan.subscribe(v => {
    if (!eventSequenceEditors) return;
    for (const key of ["alpha", "moveX", "moveY", "rotate", "speed",
       "scaleX", "scaleY", "text", "color",
       "bpm", "easing"] satisfies (keyof typeof EventType)[]) {
        eventSequenceEditors[key].timeSpan = v;
    }
    eventSequenceEditors.general.timeSpan = v;
    eventSequenceEditors.draw();
});

eventsScopeSelectMode.subscribe(v => {
    if (!eventSequenceEditors) return;
    const activatedEditor = eventSequenceEditors.activatedEditor;
    if (!(activatedEditor instanceof EventSequenceEditor)) {
        return
    }
    activatedEditor.selectState = v;
    if (v !== SelectState.none) {
        activatedEditor.state = EventCurveEditorState.selectScope;
        activatedEditor.lastSelectState = v;
    } else {
        activatedEditor.state = EventCurveEditorState.select;
    }
});

newNodeState.subscribe(v => {
    if (!eventSequenceEditors) return;
    for (const key of ["alpha", "moveX", "moveY", "rotate", "speed",
       "scaleX", "scaleY", "text", "color",
       "bpm", "easing"] satisfies (keyof typeof EventType)[]) {
        eventSequenceEditors[key].newNodeState = v;
    }
})

// === useEasing 订阅 ===
useEasing.subscribe(v => {
    if (eventSequenceEditors) {
        eventSequenceEditors.useEasing = easingArray[v];
    }
});

const switchEasing = (name: string) => {

    const easing = operationList.chart.templateEasingLib.get(name);
    if (!easing) {
        return;
    }
    const seq = easing.eventNodeSequence
    if (eventSequenceEditors?.activatedEditor.type === EventType.easing) {
        eventSequenceEditors.easing.targetEasing = easing;
        eventSequenceEditors.easing.target = seq;
        eventSequenceEditors.easing.draw();
    }
}

templateName.subscribe(v => {
    if (!operationList) {
        return;
    }
    switchEasing(v);
})

/**
 * "刷新判线列表数值"的登记处（对应 Svelte 原版各节点的 `update()` → `refreshKey++`）。
 *
 * 跟下面的 `reflowAll` 是**两件事**，别合并：
 *   · refresh —— 只重算每行的 x / y / θ / α 这些随时间变的数值，播放时每帧调；
 *   · reflow  —— 增删判定线、改父子关系之后重建结构，只在 `needsreflow` 时调。
 *
 * 之前 grain 迁移时把两者并成了一个 `reflowAll()`，于是播放时每帧都在做全量
 * 重建 —— 跟 Svelte 原版行为不一致。
 */
const refreshHandlers = new Set<() => void>();

export function registerRefresh(handler: () => void) {
    refreshHandlers.add(handler);

    return () => {
        refreshHandlers.delete(handler);
    };
}

let refreshing = false;

export function refreshAll() {
    if (refreshing) return;

    refreshing = true;

    try {
        for (const handler of refreshHandlers) handler();
    } finally {
        refreshing = false;
    }
}

/**
 * "重建判线列表结构"的登记处。
 *
 * Svelte 里父组件靠 `bind:this={child}` 拿到子组件实例再调它的 `update()`；
 * grain 的组件实例没有对外方法，所以改成子组件自己登记、父组件广播。
 */
const reflowHandlers = new Set<() => void>();

export function registerReflow(handler: () => void) {
    reflowHandlers.add(handler);

    return () => {
        reflowHandlers.delete(handler);
    };
}

/** 正在广播中（下面的防重入闸） */
let reflowing = false;

export function reflowAll() {
    /**
     * 防重入。
     *
     * 每个判定线节点都登记了 `refreshKey += 1`，那会重算它自己的 `values` 并刷一片
     * 槽位。行多的谱面（比如 Nap）里，只要有任何一个环节在这次刷新里又调回
     * `reflowAll`，就会叠成"刷新 → 广播 → 刷新"的环，10ms 内直接把循环保护打满。
     * 同一次 flush 里只跑一轮就够了。
     */
    if (reflowing) return;

    reflowing = true;

    try {
        for (const handler of reflowHandlers) handler();
    } finally {
        reflowing = false;
    }
}

/**
 * 谱面页的清理回调。
 *
 * grain 没有卸载钩子，所以由"下一个实例建起来时先把上一个收拾掉"来替代 onDestroy。
 */
let pageCleanup: (() => void) | null = null;

export function registerPageCleanup(cleanup: () => void) {
    try {
        pageCleanup?.();
    } catch (e) {
        console.error('previous page cleanup failed', e);
    }

    pageCleanup = cleanup;
}

export function restoreStates() {
    selectedLineNumber.set(0);
    activeSidebar.set(Sidebar.DEFAULT);
    activeSecondarySidebar.set(SecondarySidebar.LINES);
    previousActiveSecondarySidebar.set(SecondarySidebar.LINES);

    selectedNote.set(null);
    selectedNotes.set(null);
    selectedNode.set(null);
    selectedNodes.set(null);
    timeDivisor.set(4);
    selectedMacro.set(null);

    playerShowsUI.set(true);
    playerShowsLineID.set(false);
    playerHitEffectNoFollows.set(true);
    playerShowsCurve.set(false);
    playerCameraZoom.set(1);

    notesEditChecked.set(false);
    notesShowsNNN.set(false);
    notesNoteType.set(NoteType.tap);
    notesTimeSpan.set(4);
    notesScopeSelectMode.set(SelectState.none);
    notesPositionCenter.set(0);
    notesPositionXInterval.set(135);
    notesAbove.set(true);

    eventsEditChecked.set(false);
    eventsLayer.set("0");
    eventsType.set("general");
    eventsTimeSpan.set(4);
    eventsScopeSelectMode.set(SelectState.none);

    useEasing.set(1);
    templateName.set("");
}