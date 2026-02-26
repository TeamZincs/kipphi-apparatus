<script module lang="ts">
    const ORDERED = 0b001;
    const TREE = 0b010;
    const GROUPED = 0b100;
    let layout = $state(ORDERED);
</script>

<script lang="ts">
import type { Chart, JudgeLine,  } from "kipphi";
import { JudgeLineGroup as KPJudgeLineGroup } from "kipphi";
import JudgeLinePalette from "./JudgeLineManager.svelte";

import { _ } from "#/i18n";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import JudgeLineGroup from "./JudgeLineGroup.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";


let {
    chart
}: {
    chart: Chart;
} = $props();

let _judgeLinePalettes: (JudgeLinePalette | JudgeLineGroup)[] = $state([]);
let judgeLinePalettes = $derived(_judgeLinePalettes.filter(Boolean));

let newGroupName = $state("");

let key = $state(0);
let judgeLineGroups = $state([...chart.judgeLineGroups])
$effect(() => {
    judgeLineGroups = [...chart.judgeLineGroups];
})

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
        {#each judgeLineGroups as group, i}
            <JudgeLineGroup target={group} bind:this={_judgeLinePalettes[i]}/>
        {/each}
        <div class="flex-row">
        <input type="text" placeholder="New group name" bind:value={newGroupName}/>
        <ProgressiveButton onclick={
            () => {
                const group = new KPJudgeLineGroup(newGroupName);
                chart.judgeLineGroups.push(group);
                judgeLineGroups = [...chart.judgeLineGroups];
                // 暂时不做删除组，创建组是非操作，不入栈

            }
        }>+</ProgressiveButton>
        </div>
        
    {/if}
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

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

.flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    input {
        .input();
        font-size: var(--font-size-small);
        height: 100%;
        box-sizing: border-box;
    }
}
</style>