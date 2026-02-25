<script lang="ts">
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { EventType, type ExtendedEventTypeName } from "kipphi";
    import { eventSequenceEditors, EventSequenceEditorSettings, GlobalContext, operationList } from "./store.svelte";
    import { _ } from "#/i18n";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import EasingBox from "./EasingBox.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { EventSequenceEditors } from "kipphi-canvas-editor";
    import { notify } from "./notify.svelte";
    import { EncapsuleOperation } from "../../../../../kipphi/packages/package-kipphi/operation";
    import { EventSequenceEditor } from "kipphi-canvas-editor/eventCurveEditor";
    import { KPAError } from "../../../../../kipphi/packages/package-kipphi/env";


    let options = $derived(
        EventSequenceEditorSettings.layer === 'ex'
        ? ["scaleX", "scaleY", "text", "color"] satisfies ExtendedEventTypeName[]
        : ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "bpm"] satisfies Exclude<keyof typeof EventType, ExtendedEventTypeName>[])
    let texts = $derived(options.map(name => $_(`general.eventTypes.${name}`)))
</script>
<Label>Events</Label>
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
    bind:currentOption={EventSequenceEditorSettings.layer}
></PopupOption>

<PopupOption wide
    options={options} displayTexts={texts}
    bind:currentOption={EventSequenceEditorSettings.type}
></PopupOption>

<Label small>{$_("main.events.timeSpan")}</Label>
<UnitInput bind:value={EventSequenceEditorSettings.timeSpan} unit={$_("general.beat")}></UnitInput>


<TextSwitchButton wide bgText={$_("main.events.addNodePair")}
    onText="+" offText="-" bind:checked={EventSequenceEditorSettings.editChecked}/>

<EasingBox bind:value={EventSequenceEditorSettings.useEasing}></EasingBox>

{#if ["moveX", "moveY", "rotate", "alpha", "speed", "easing", "scaleX", "scaleY"].includes(EventSequenceEditorSettings.type)}
<input type="text" class="template-name"
placeholder={$_("main.events.templateName")}
bind:value={EventSequenceEditorSettings.templateName}>
{/if}

<ProgressiveButton onclick={
    () => {
        const name = EventSequenceEditorSettings.templateName;
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
            const operation = EncapsuleOperation.encapsule(
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

<style lang="less">
    @import "#/components/mixin.less";
    .template-name {
        .input();
        font-size: var(--font-size-medium);
        width: 100%;
        box-sizing: border-box;
    }
</style>