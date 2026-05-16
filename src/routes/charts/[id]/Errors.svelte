<script module lang="ts">
</script>

<script lang="ts">
import { EventNode, EventNodeSequence, EventType, KPAError, TC, type EventLayer, type EventValueESType, type ExtendedLayer } from "kipphi";
    import { activeSecondarySidebar, eventsLayer, eventsType, operationList, player, SecondarySidebar, selectedLineNumber, selectedNode } from "./store.svelte";
    import { _ } from "#/i18n";
    import Button from "#/components/buttons/Button.svelte";
    import { notify } from "#/notify.svelte";
    import { Environment as kEnv } from "kipphi";
    const ERROR_IDS = kEnv.ERROR_IDS;
    let errors = $state(KPAError.buffer);

    const IDS = new Set([
        ERROR_IDS.EVENT_NODE_NOT_DENSE,
        ERROR_IDS.EVENT_NODE_TIME_NOT_INCREMENTAL
    ])

    function gotoAvailable(error: KPAError<ERROR_IDS>) {
        return IDS.has(error.id);
    }

    const findNormalSeqReference = (seq: EventNodeSequence<number>) => {
        const match = /^#(\d+)\.(\d+)/.exec(seq.id);
        const typeName = EventType[seq.type] as keyof EventLayer
        if (match) {
            const [, line, layer] = match;
            const lineNum = parseInt(line);
            const judgeLine = operationList.chart.judgeLines[lineNum];
            if (judgeLine && judgeLine.eventLayers[parseInt(layer)]?.[typeName] === seq) {
                return [lineNum, parseInt(layer)] as const;
            }
        }
        const judgeLines = operationList.chart.judgeLines;
        for (const line of judgeLines) {
            const eventLayers = line.eventLayers;
            const len = eventLayers.length;
            for (let i = 0; i < len; i++) {
                const layer = eventLayers[i];
                if (!layer) { continue; }
                if (layer && layer[typeName] === seq) {
                    return [line.id, i] as const;
                }
            }
        }
        return null;
    }

    const findExtendedSeqReference = (seq: EventNodeSequence<number>) => {
        const match = /^#(\d+)\.ex/.exec(seq.id);
        const typeName = EventType[seq.type] as keyof ExtendedLayer
        if (match) {
            const [, line] = match;
            const lineNum = parseInt(line);
            const judgeLine = operationList.chart.judgeLines[lineNum];
            if (judgeLine && judgeLine.extendedLayer?.[typeName] === seq) {
                return lineNum;
            }
        }
        const judgeLines = operationList.chart.judgeLines;
        for (const line of judgeLines) {
            if (line.extendedLayer?.[typeName] === seq) {
                return line.id;
            }
        }
        return null;
    }

    function gotoSequence(seq: EventNodeSequence<EventValueESType>) {
        switch (seq.type) {
            case EventType.moveX:
            case EventType.moveY:
            case EventType.rotate:
            case EventType.alpha: {
                const lineAndLayer = findNormalSeqReference(seq as any);
                if (!lineAndLayer) {
                    notify($_("main.errors.sequenceNotReferenced"), "warning")
                }
                const [lineId, layerId] = lineAndLayer;
                selectedLineNumber.set(lineId);
                eventsLayer.set(layerId + "" as any);
                eventsType.set(EventType[seq.type] as any);
                break;
            }
            case EventType.speed:
                break;
            case EventType.easing:
                break;
            case EventType.bpm:
                break;
            case EventType.scaleX:
            case EventType.scaleY:
            case EventType.text:
            case EventType.color: {
                const lineId = findExtendedSeqReference(seq as any);
                selectedLineNumber.set(lineId);
                eventsLayer.set("ex");
                eventsType.set(EventType[seq.type] as any)
            }
        }
    }

    function gotoEventNode(node: EventNode<EventValueESType>) {
        if (!node) { return; }
        const time = node.time;
        player.renderingBeats = TC.toBeats(time) - 0.2;
        const parentSeq = node.parentSeq;
        if (!parentSeq) {
            notify($_("main.errors.nodeParentNotFound"), "error");
        } else {
            selectedNode.set(node as any);
            activeSecondarySidebar.set(SecondarySidebar.EVENT)
        }
        gotoSequence(parentSeq);
        player.render()
    }
    function gotoError(error: KPAError<ERROR_IDS>) {
        switch (error.id) {
            case ERROR_IDS.EVENT_NODE_NOT_DENSE:
            case ERROR_IDS.EVENT_NODE_TIME_NOT_INCREMENTAL:
                const [node] = (error as
                    KPAError<ERROR_IDS.EVENT_NODE_NOT_DENSE | ERROR_IDS.EVENT_NODE_TIME_NOT_INCREMENTAL>
                ).args;
                gotoEventNode(node);
                break;
        }
    }
</script>

<Button onclick={
    () => {
        const pre = performance.now();
        operationList.chart.checkErrors();
        errors = KPAError.buffer;
        const cost = (performance.now() - pre) / 1000;
        notify($_("main.errors.checkComplete",
        {values:{count: KPAError.buffer.length, secs: cost.toFixed(3)}}), "info");
    }
}>{$_("main.errors.check")}</Button>
<div class="errors">
    {#each errors as error}
        <div class="error">
            <div class="error-message">{error.message}
                {#if gotoAvailable(error)}
                    <a onclick={() => gotoError(error)}>Go to error</a>
                {/if}
            </div>
        </div>
    {/each}
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

.errors {
    display: flex;
    flex-direction: column;
    contain: layout;
    width: 100%;
    padding: 4px;
    box-sizing: border-box;
    gap: 4px;

    height: auto;
    min-height: 50vh;
    overflow: auto;
    scrollbar-width: none;
}

.error {
    display: block;
    background-color: #eee;
    padding: var(--border-radius);
    border-radius: var(--border-radius);
    a {
        color: steelblue;
    }
}
</style>