<script lang="ts">
    import { SquaresSubtract, SquaresUnite, Replace, SquareX } from "@lucide/svelte";
    import Label from "#/components/Label.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import { selectedLineNumber, notesEditChecked, notesShowsNNN, notesNoteType, operationList, notesScopeSelectMode, notesTimeSpan, notesPositionCenter, notesPositionXInterval } from "./store.svelte";

    import { _ } from "#/i18n";
    import Tooltip from "#/components/Tooltip.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { onMount } from "svelte";
    import { NoteType, type NNList } from "kipphi";
    import { SelectState } from "kipphi-canvas-editor";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";

    let judgeLine = $derived(operationList.chart.judgeLines[$selectedLineNumber]);
    let options = $state.raw([]);
    const ALL_OPTION: [string, NNList] = ["*", null]
    let currentOption = $state.raw(ALL_OPTION);
    $effect(() => {
        if (currentOption[1]?.parentLine === judgeLine) {
            return;
        }
        currentOption = ALL_OPTION;
    })
    function updateOptions() {
        const newOptions: [string, NNList][] = [ALL_OPTION];
        judgeLine.nnLists.entries()
            .toArray()
            .sort()
            .forEach((entry) => {
                newOptions.push(entry);
            });
        judgeLine.hnLists.entries()
            .toArray()
            .sort()
            .forEach((entry) => {
                newOptions.push(entry);
            });
        options = newOptions;
    }
    $effect(() => {
        updateOptions();
    });


    operationList.addEventListener("needsupdate", (ev) => {
        updateOptions();
    })

    onMount(() => {console.log(options)})

</script>


<Label>{$_("main.sidebar.notes")}</Label>
<TextSwitchButton wide bgText={$_("main.notes.addNote")}
    onText="+" offText="-" bind:checked={$notesEditChecked}/>
<Label small>{$_("main.notes.noteType")}</Label>
<PopupOption wide options={
    [NoteType.tap, NoteType.hold, NoteType.flick, NoteType.drag]
} displayTexts={
    ["Tap", "Hold", "Flick", "Drag"]
} bind:currentOption={$notesNoteType}
></PopupOption>

<div class="flex">
    <TextSwitchButton wide bgText={$_("main.notes.showsNNN.term")}
    onText="Y" offText="N" bind:checked={$notesShowsNNN}/>
    <Tooltip>{$_("main.notes.showsNNN.desc")}</Tooltip>
</div>

<Label small>{$_("main.notes.NNList.term")}
    <Tooltip>{$_("main.notes.NNList.desc")}</Tooltip>
</Label>
<PopupOption wide options={
    options
} displayTexts={
    options.map(option => option[0])
} currentOption={currentOption}></PopupOption>

<Label small>{$_("main.events.timeSpan")}</Label>
<UnitInput bind:value={$notesTimeSpan} unit={$_("general.beat")}></UnitInput>

<Label small>{$_("general.multiSelectMode")}</Label>
<PopupOption wide options={
    [
        SelectState.none,
        SelectState.extend,
        SelectState.replace,
        SelectState.exclude
    ]
} bind:currentOption={$notesScopeSelectMode}>
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

<UnitInput bind:value={$notesPositionCenter} step={$notesPositionXInterval} unit="px"></UnitInput>
<Label small>{$_("main.notes.positionXInterval")}</Label>
<UnitInput bind:value={$notesPositionXInterval} step={1} unit="px"></UnitInput>

<style scoped>
    .flex {
        display: flex;
        align-items: center;
    }
</style>