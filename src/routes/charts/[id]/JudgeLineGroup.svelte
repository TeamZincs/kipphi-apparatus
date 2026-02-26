<script lang="ts">
    import { JudgeLine, Op, type JudgeLineGroup } from "kipphi";
    import JudgeLineManager from "./JudgeLineManager.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { chartId, operationList } from "./store.svelte";
    import { Operation } from "../../../../../kipphi/packages/package-kipphi/operation";
    let {
        target
    }: {
        target: JudgeLineGroup
    } = $props();

    let folded = $state(false);

    let palletes: JudgeLineManager[] = $state([]);

    let judgeLines: JudgeLine[] = $state([...target.judgeLines]);
    $effect(() => {
        judgeLines = [...target.judgeLines];
    });
    operationList.addEventListener("needsreflow", (ev) => {
        if (ev.condition & 0b100) {
            judgeLines = [...target.judgeLines];
        }
    })

    export function update() {
        palletes.forEach(palette => palette.update());
    }

</script>

<div class="judgeline-group">
    <span class="collapsible-button" class:folded
    onclick={() => { folded = !folded }}></span>
    <span class="name">{target.name}</span>
    <ProgressiveButton onclick={
        () => {
            const line = new JudgeLine(operationList.chart);
            operationList.do(new Op.ComplexOperation(
                new Op.JudgeLineCreateOperation(
                    operationList.chart,
                    line
                ),
                Op.JudgeLineRegroupOperation.lazy(
                    line,
                    target
                )
            ));
        }
    }>+</ProgressiveButton>
</div>
{#if !folded}
    {#each judgeLines as line, i}
    <JudgeLineManager target={line} bind:this={palletes[i]}></JudgeLineManager>
    {/each}
{/if}

<style scoped lang="less">
    @import "#/components/mixin.less";
    
    .collapsible-button {
        .collapsible-triangle();
    }
    .name {
        flex-grow: 1;
        margin-left: 1vh;
    }
    .judgeline-group {
        background-color: #ddd;
        padding: 0.5em;
        font-size: var(--font-size-small);
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>