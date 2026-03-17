<script lang="ts">
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { EventType, type ExtendedEventTypeName, KPAError, Op } from "kipphi";
    import { eventsLayer, eventsType, eventsTimeSpan, eventsEditChecked, eventsScopeSelectMode, operationList, useEasing, templateName } from "./store.svelte";
    import { _ } from "#/i18n";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import EasingBox from "./EasingBox.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { EventSequenceEditor } from "kipphi-canvas-editor/eventCurveEditor";
    import { notify } from "#/notify.svelte";
    import { eventSequenceEditors } from "./store.svelte";
    import { SelectState } from "kipphi-canvas-editor";
    import { Replace, SquaresSubtract, SquaresUnite, SquareX } from "@lucide/svelte";

    let options = $derived(
        $eventsLayer === 'ex'
        ? ["scaleX", "scaleY", "text", "color"] satisfies ExtendedEventTypeName[]
        : ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "bpm"] satisfies Exclude<keyof typeof EventType, ExtendedEventTypeName>[])
    let texts = $derived(options.map(name => $_(`general.eventTypes.${name}`)))
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
<UnitInput bind:value={$eventsTimeSpan} unit={$_("general.beat")}></UnitInput>


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

{#if ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "scaleX", "scaleY"].includes($eventsType)}
<input type="text" class="template-name"
placeholder={$_("main.events.templateName")}
bind:value={$templateName}>

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
        try {
            const operation = Op.EncapsuleOperation.encapsule(
                lib,
                evSeqEditor.target,
                evSeqEditor.nodesSelection,
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

<style lang="less">
    @import "#/components/mixin.less";
    .template-name {
        .input();
        font-size: var(--font-size-medium);
        width: 100%;
        box-sizing: border-box;
    }
</style>