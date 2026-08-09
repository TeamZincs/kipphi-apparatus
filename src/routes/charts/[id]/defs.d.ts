/// <reference types="kipphi" />


import { Note, EventNode, EventStartNode, type EventValueESType, Chart, JudgeLine, NNList, RGB } from "index";
import { OperationList } from "operation/basic";
import { ToOperable } from "operation/easy";

declare __GLOBAL__ {
    interface ScriptingContext {
        /** 被单选选中的音符 */
        selectedNote: Note;
        /** 被多选选中的音符 */
        selectedNotes: Set<Note>;
        /** 被单选选中的事件节点 */
        selectedNode: EventNode<EventValueESType>;
        /** 被多选选中的事件节点 */
        selectedNodes: Set<EventNode<EventValueESType>>;
        /** 被选中的判定线 */
        selectedLine: JudgeLine;
        /** 当前音符节点序列 */
        currentNNList: __NNLIST_SPECIFIED__ extends true ? NNList : null;
        /** 当前事件节点序列 */
        currentEventNodeSequence: EventNodeSequence<__ENS_T__>;
        /** 谱面 */
        chart: Chart;
        /** 操作栈 */
        operationList: OperationList;
        // 稍后会介绍
        /**
         * 提供一个安全的上下文和简易的API，用于执行谱面编辑
         * @param fn 
         */
        op(fn: (o: ToOperable) => void): void;
    }
    export const context: ScriptingContext;
    export const ctx: ScriptingContext;
    export { Operation, ComplexOperation } from "operation/basic";
    export * as Op from "operation/index";
    export { useToOperable, operate, op } from "operation/easy";
    export { NoteType, EventType, EventValueType, TC } from "index";
    export * as KP from "index";
}