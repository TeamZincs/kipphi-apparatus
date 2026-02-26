<script module lang="ts">
    const ORDERED = 0b001;
    const TREE = 0b010;
    const GROUPED = 0b100;
    let layout = $state(ORDERED);
</script>

<script lang="ts">
import type { Chart, JudgeLine } from "kipphi";
import JudgeLinePalette from "./JudgeLine.svelte";

import { _ } from "#/i18n";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";


let {
    chart
}: {
    chart: Chart;
} = $props();

let _judgeLinePalettes: JudgeLinePalette[] = $state([]);
let judgeLinePalettes = $derived(_judgeLinePalettes.filter(Boolean));


let key = $state(0);

export function ForceReflow() {
    key++;
}

export function update() {
    judgeLinePalettes.forEach(palette => palette.update());
}
</script>

<PopupOption wide
    displayTexts={[
        $_("main.sidebar.judgeLineLayout.ordered"),
        $_("main.sidebar.judgeLineLayout.tree"),
        $_("main.sidebar.judgeLineLayout.group")]}
    options={[ORDERED, TREE, GROUPED]}
    bind:currentOption={layout}
    ></PopupOption>
<div class="judgelines-manager" data-key={key}>
    {#if layout === ORDERED}
        {#each (chart.judgeLines) as judgeLine, i}
            <JudgeLinePalette target={judgeLine} bind:this={_judgeLinePalettes[i]}/>
        {/each}
    {:else if layout === TREE}
        {#each (chart.orphanLines) as judgeLine, i}
            
            <JudgeLinePalette
                level={0}
                target={judgeLine}
                children={[...judgeLine.children].sort((a, b) => a.id - b.id)}
                bind:this={_judgeLinePalettes[i]}/>
        {/each}
    {:else if layout === GROUPED}
    <!-- TODO -->
    {/if}
</div>

<style>

.judgelines-manager {
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

</style>