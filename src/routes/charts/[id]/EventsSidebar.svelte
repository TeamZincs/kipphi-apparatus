<script lang="ts">
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { EventType, type ExtendedEventTypeName } from "kipphi";
    import { EventSequenceEditorSettings, GlobalContext } from "./store.svelte";
    import { _ } from "#/i18n";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";


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