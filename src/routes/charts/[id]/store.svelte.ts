import { type NotesEditor, type EventSequenceEditors, NotesEditorState } from "kipphi-canvas-editor"
import { easingArray, EventType, NNList, NoteType, type ExtendedEventTypeName, type Op } from "kipphi";
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
    LINE: 3
}

export let player: Player;
let notesEditor: NotesEditor;
let eventSequenceEditors: EventSequenceEditors;
export let chartId: string;
export function setID(id: string) { chartId = id; }
export let operationList: OperationList;
export function init(ne: NotesEditor, ece: EventSequenceEditors, ol: OperationList, pl: Player) {
    notesEditor = ne;
    eventSequenceEditors = ece;
    operationList = ol;
    player = pl;
}


export let GlobalContext =  $state({
    selectedLineNumber: 0,
    activeSidebar: Sidebar.DEFAULT,
    activeSecondarySidebar: SecondarySidebar.LINES,
    /** 上一次激活的次级侧边栏，用于ctrl切线后还原 */
    previousActiveSecondarySidebar: SecondarySidebar.LINES,

    selectedNote: null,

    timeDivisor: 4,
});

export let PlayerSettings = $state({
    showsUI: true,
    showsLineID: false
})

export let NotesEditorSettings = $state({
    editChecked: false,
    showsNNN: false,
    noteType: NoteType.tap
})

let _useEasing = $state(1);

export let EventSequenceEditorSettings = $state({
    editChecked: false,
    layer: "0" as "0" | "1" | "2" | "3" | "ex",
    type: "moveX" as keyof typeof EventType,
    timeSpan: 4,
    get useEasing() {
        return _useEasing
    },
    set useEasing(value) {
        _useEasing = value;
        eventSequenceEditors.useEasing = easingArray[value];
    }
});