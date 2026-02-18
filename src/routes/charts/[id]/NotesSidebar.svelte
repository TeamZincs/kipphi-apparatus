<script lang="ts">
    import Label from "#/components/Label.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import { GlobalContext, NotesEditorSettings, operationList } from "./store.svelte";

    import { _ } from "#/i18n";
    import Tooltip from "#/components/Tooltip.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { onMount } from "svelte";
    import { NoteType, type NNList } from "kipphi";

    let judgeLine = $derived(operationList.chart.judgeLines[GlobalContext.selectedLineNumber]);
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


<Label>Notes</Label>
<TextSwitchButton wide bgText={$_("main.notes.addNote")}
    onText="+" offText="-" bind:checked={NotesEditorSettings.editChecked}/>
<Label>{$_("main.notes.noteType")}</Label>
<PopupOption wide options={
    [NoteType.tap, NoteType.hold, NoteType.flick, NoteType.drag]
} displayTexts={
    ["Tap", "Hold", "Flick", "Drag"]
} currentOption={NotesEditorSettings.noteType}
></PopupOption>

<div class="flex">
    <TextSwitchButton wide bgText={$_("main.notes.showsNNN.term")}
    onText="Y" offText="N" bind:checked={NotesEditorSettings.showsNNN}/>
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

<style scoped>
    .flex {
        display: flex;
        align-items: center;
    }
</style>