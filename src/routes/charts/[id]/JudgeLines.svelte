<script lang="ts">
import type { Chart, JudgeLine } from "kipphi";
import JudgeLinePalette from "./JudgeLine.svelte";

const ORDERED = 0b001;
const TREE = 0b010;
const GROUPED = 0b100;

let {
    layout,
    chart
}: {
    chart: Chart;
    layout: number;
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