import { type NotesEditor, type EventSequenceEditors, NotesEditorState } from "kipphi-canvas-editor"
import { NNList, NoteType, type Op } from "kipphi";
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


let notesEditor: NotesEditor;
let eventSequenceEditors: EventSequenceEditors;
export let operationList: OperationList;
export function init(ne: NotesEditor, ece: EventSequenceEditors, ol: OperationList) {
    notesEditor = ne;
    eventSequenceEditors = ece;
    operationList = ol;
}


export let GlobalContext =  $state({
    selectedLineNumber: 0,
    activeSidebar: Sidebar.DEFAULT,
    activeSecondarySidebar: SecondarySidebar.LINES,
    /** 上一次激活的次级侧边栏，用于ctrl切线后还原 */
    previousActiveSecondarySidebar: SecondarySidebar.LINES,

    selectedNote: null,

    timeDivisor: 4
})

export let PlayerSettings = $state({
    showsUI: true,
    showsLineID: false
})

export let NotesEditorSettings = $state({
    editChecked: false,
    showsNNN: false,
    noteType: NoteType.tap
})
