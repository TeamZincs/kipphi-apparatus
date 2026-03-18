import { writable } from "svelte/store";
import { type NotesEditor, type EventSequenceEditors, NotesEditorState, EventCurveEditorState, SelectState } from "kipphi-canvas-editor"
import { easingArray, EventEndNode, EventNode, EventStartNode, EventType, NNList, Note, NoteType, type ExtendedEventTypeName, type Op } from "kipphi";
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
    MULTI_NOTE: 6
}

export let player: Player;
export let notesEditor: NotesEditor;
export let eventSequenceEditors: EventSequenceEditors;
export let chartId: string;
export function setID(id: string) { chartId = id; }
export let operationList: OperationList;
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

// PlayerSettings - 每个属性独立的 writable store
export const playerShowsUI = writable(true);
export const playerShowsLineID = writable(false);
export const playerHitEffectNoFollows = writable(false);

// NotesEditorSettings - 每个属性独立的 writable store
export const notesEditChecked = writable(false);
export const notesShowsNNN = writable(false);
export const notesNoteType = writable(NoteType.tap);
export const notesTimeSpan = writable(4);
export const notesScopeSelectMode = writable(SelectState.none);
export const notesPositionCenter = writable(0);
export const notesPositionXInterval = writable(135);

// EventSequenceEditorSettings - 每个属性独立的 writable store
export const eventsEditChecked = writable(false);
export const eventsLayer = writable<"0" | "1" | "2" | "3" | "ex">("0");
export const eventsType = writable<any>("moveX");
export const eventsTimeSpan = writable(4);
export const eventsScopeSelectMode = writable(SelectState.none);

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
})

// === EventSequenceEditorSettings 订阅 ===
eventsEditChecked.subscribe(v => {
    if (!eventSequenceEditors) return;
    const activatedEditor = eventSequenceEditors.activatedEditor;
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
    // @ts-expect-error TSC又在发什么颠
    eventSequenceEditors.activatedEditor = eventSequenceEditors[v];
    eventsEditChecked.set(eventSequenceEditors.activatedEditor.state === EventCurveEditorState.edit);
});

eventsTimeSpan.subscribe(v => {
    if (!eventSequenceEditors) return;
    for (const key of ["alpha", "moveX", "moveY", "rotate", "speed",
       "scaleX", "scaleY", "text", "color",
       "bpm", "easing"] satisfies (keyof typeof EventType)[]) {
        eventSequenceEditors[key].timeSpan = v;
    }
    eventSequenceEditors.draw();
});

eventsScopeSelectMode.subscribe(v => {
    if (!eventSequenceEditors) return;
    eventSequenceEditors.activatedEditor.selectState = v;
    if (v !== SelectState.none) {
        eventSequenceEditors.activatedEditor.state = EventCurveEditorState.selectScope;
    } else {
        eventSequenceEditors.activatedEditor.state = EventCurveEditorState.select;
    }
});

// === useEasing 订阅 ===
useEasing.subscribe(v => {
    if (eventSequenceEditors) {
        eventSequenceEditors.useEasing = easingArray[v];
    }
});

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

    playerShowsUI.set(true);
    playerShowsLineID.set(false);
    playerHitEffectNoFollows.set(false);

    notesEditChecked.set(false);
    notesShowsNNN.set(false);
    notesNoteType.set(NoteType.tap);
    notesTimeSpan.set(4);
    notesScopeSelectMode.set(SelectState.none);
    notesPositionCenter.set(0);
    notesPositionXInterval.set(135);

    eventsEditChecked.set(false);
    eventsLayer.set("0");
    eventsType.set("moveX");
    eventsTimeSpan.set(4);
    eventsScopeSelectMode.set(SelectState.none);

    useEasing.set(1);
    templateName.set("");
}