import { type NotesEditor, type EventSequenceEditors, NotesEditorState } from "kipphi-canvas-editor"
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
    MULTI_NODE: 5
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

let _useEasing = $state(1);
let _templateName = $state("");

const createGlobalContext = () => ({
    selectedLineNumber: 0,
    activeSidebar: Sidebar.DEFAULT,
    activeSecondarySidebar: SecondarySidebar.LINES,
    /** 上一次激活的次级侧边栏，用于ctrl切线后还原 */
    previousActiveSecondarySidebar: SecondarySidebar.LINES,

    selectedNote: null as Note,
    selectedNode: null as EventStartNode<any> | EventEndNode<any>,

    selectedNodes: null as Set<EventStartNode<any>>,

    timeDivisor: 4,
});

export let GlobalContext = $state(createGlobalContext());

const createPlayerSettings = () => ({
    showsUI: true,
    showsLineID: false
})

export let PlayerSettings = $state(createPlayerSettings());

const createNotesEditorSettings = () => ({
    editChecked: false,
    showsNNN: false,
    noteType: NoteType.tap
})

export let NotesEditorSettings = $state(createNotesEditorSettings());

const createEventSequenceEditorSettings = () => ({
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
    },
    get templateName() {
        return _templateName;
    },
    set templateName(value) {
        _templateName = value;
    }
})

export let EventSequenceEditorSettings = $state(createEventSequenceEditorSettings());

export function restoreStates() {
    GlobalContext = createGlobalContext();
    PlayerSettings = createPlayerSettings();
    NotesEditorSettings = createNotesEditorSettings();
    EventSequenceEditorSettings = createEventSequenceEditorSettings();
}