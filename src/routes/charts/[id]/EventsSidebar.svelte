<script lang="ts">
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { EventType, type ExtendedEventTypeName, KPAError, Op } from "kipphi";
    import { eventsLayer, eventsType, eventsTimeSpan, eventsEditChecked, eventsScopeSelectMode, operationList, useEasing, templateName, selectedLineNumber, newNodeState } from "./store.svelte";
    import { _ } from "#/i18n";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import EasingBox from "./EasingBox.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { EventSequenceEditor } from "kipphi-canvas-editor/eventCurveEditor";
    import { notify } from "#/notify.svelte";
    import { eventSequenceEditors } from "./store.svelte";
    import { SelectState, NumericEventCurveEditor, NewNodeState } from "kipphi-canvas-editor";
    import { Replace, SquaresSubtract, SquaresUnite, SquareX } from "@lucide/svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import Tooltip from "#/components/Tooltip.svelte";

    let options = $derived(
        $eventsLayer === 'ex'
        ? ["scaleX", "scaleY", "text", "color"] satisfies ExtendedEventTypeName[]
        : ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "bpm"] satisfies Exclude<keyof typeof EventType, ExtendedEventTypeName>[])
    let texts = $derived(options.map(name => $_(`general.eventTypes.${name}`)));

    let rangeInput: HTMLInputElement = $state(null);
    const restore = () => {
        if (eventSequenceEditors.activatedEditor.autoRangeEnabled) {
            rangeInput.value = "auto";
        } else {
            let value = (eventSequenceEditors.activatedEditor as NumericEventCurveEditor).valueRange.join(", ");
            if (eventSequenceEditors.activatedEditor.timeGridInterval) {
                value += `, ${eventSequenceEditors.activatedEditor.timeGridInterval}`;
            }
            rangeInput.value = value;
        }
    }
    $effect(() => {
        $eventsLayer;$eventsType;$selectedLineNumber;
        if (rangeInput) restore();
    })

</script>
<Label>{$_("main.sidebar.events")}</Label>
<Label small>{$_("main.events.layerAndSeq")}</Label>
<PopupOption wide
    options={
        ["0", "1", "2", "3", 'ex']
    }
    displayTexts={
        [
            $_("main.events.layers.0"),
            $_("main.events.layers.1"),
            $_("main.events.layers.2"),
            $_("main.events.layers.3"),
            $_("main.events.layers.ex")
        ]
    }
    bind:currentOption={$eventsLayer}
></PopupOption>

<PopupOption wide
    options={options} displayTexts={texts}
    bind:currentOption={$eventsType}
></PopupOption>

<Label small>{$_("main.events.timeSpan")}</Label>
<UnitInput bind:value={$eventsTimeSpan} unit={$_("general.beat")} step={1}></UnitInput>


<TextSwitchButton wide bgText={$_("main.events.addNodePair")}
    onText="+" offText="-" bind:checked={$eventsEditChecked}/>

<EasingBox bind:value={$useEasing}></EasingBox>


<Label small>{$_("general.multiSelectMode")}</Label>
<PopupOption wide options={
    [
        SelectState.none,
        SelectState.extend,
        SelectState.replace,
        SelectState.exclude
    ]
} bind:currentOption={$eventsScopeSelectMode}>
    {#snippet displayTexts(mode: SelectState)}
        {#if mode === SelectState.none}
            <SquareX/>
            {$_("general.modes.none")}
        {:else if mode === SelectState.extend}
            <SquaresUnite/>
            {$_("general.modes.extend")}
        {:else if mode === SelectState.replace}
            <Replace/>
            {$_("general.modes.replace")}
        {:else if mode === SelectState.exclude}
            <SquaresSubtract/>
            {$_("general.modes.substract")}
        {/if}

    {/snippet}
</PopupOption>

{#if ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "scaleX", "scaleY", "bpm"].includes($eventsType)}
<Label small>
{$_("main.events.range")}
<Tooltip>
    {$_("main.events.rangeTooltip")}
</Tooltip>
</Label>
<input bind:this={rangeInput} placeholder="left-right,interval" type="text" class="range" value="auto" onchange={
    (e) => {
        const target = e.target as HTMLInputElement;
        const value = target.value as string;
        if (value === "auto") {
            eventSequenceEditors.activatedEditor.autoRangeEnabled = true;
            return;
        }
        const match = value.match(/^(\-?\d+)[,\- ]\s?(\-?\d+)(?:[, ]\s?(\d+))?$/);
        if (!match) {
            notify($_("main.events.invalidRange"), "error");
            restore();
            return;
        }
        const [, start, end, interval] = match;
        const startNum = parseFloat(start);
        const endNum = parseFloat(end);
        const intervalNum = interval && parseFloat(interval);
        if (isNaN(startNum) || isNaN(endNum)) {
            notify($_("main.events.invalidRange"), "error");
            return restore();
        }
        if (startNum >= endNum) {
            notify($_("main.events.invalidRange"), "error");
            return restore();
        }
        const activatedEditor = eventSequenceEditors.activatedEditor as NumericEventCurveEditor;
        activatedEditor.valueRange = [startNum, endNum];
        activatedEditor.autoRangeEnabled = false;
        // 属性可以为undefined，表示自适应密度
        activatedEditor.valueGridInterval = intervalNum;
        
        eventSequenceEditors.activatedEditor.draw();
        
    }
}>

<PopupOption wide
    bind:currentOption={$newNodeState}
    options={[NewNodeState.controlsBoth, NewNodeState.controlsStart, NewNodeState.controlsEnd]}
    displayTexts={["both", "start", "end"]}
></PopupOption>

{#if $eventsType !== "bpm"}
<SuggestionInput 
getSuggestions={async (s) => operationList.chart.templateEasingLib.easings.keys().toArray().filter(k => k.startsWith(s))}
placeholder={$_("main.events.templateName")}
bind:value={$templateName}/>

<ProgressiveButton onclick={
    () => {
        const name = $templateName;
        if (name === "") {
            return notify($_("main.events.templateNameEmpty"), "error");
        }
        const lib = operationList.chart.templateEasingLib;
        if (lib.easings.has(name)) {
            return notify($_("main.events.templateNameOccupied"), "error");
        }
        const evSeqEditor = eventSequenceEditors.activatedEditor as EventSequenceEditor<number>;
        if (evSeqEditor.nodesSelection.size === 0) {
            return notify($_("main.events.noNodeSelected"), "error");
        }
        const arr = [...evSeqEditor.nodesSelection]
        const hasSelfNodes = arr
            .some(node => node.parentSeq === evSeqEditor.target);
        const selection = hasSelfNodes ? arr.filter(node => node.parentSeq === evSeqEditor.target) : arr;
        try {
            const operation = Op.EncapsuleOperation.encapsule(
                lib,
                evSeqEditor.target,
                new Set(selection),
                name
            );
            operationList.do(operation);
        } catch (e) {
            if (e instanceof KPAError)
                return notify(e.message, "error");
        }
    }
}>{$_("main.events.encapsule")}</ProgressiveButton>
{/if}
{/if}

<style lang="less">
    @import "#/components/mixin.less";
    .template-name, .range {
        .input();
        font-size: var(--font-size-medium);
        width: 100%;
        box-sizing: border-box;
    }
</style>