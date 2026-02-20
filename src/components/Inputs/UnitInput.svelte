<script lang="ts">
    import type { Snippet } from "svelte";

let {
    value = $bindable(),
    unit,
    label,
    title
}:  { value: number, unit?: string | Snippet, label?: string | Snippet, title?: string } = $props();

</script>

<div class="unit-input" class:labeled={!!label} class:united={!!unit}>
    {#if label}
        {#if typeof label === "string"}
            <span class="label" title={title}>{label}</span>
        {:else}
            {@render label()}
        {/if}
    {/if}
    <input type="number" step="0.001" bind:value>
    {#if unit}
        <span class="unit">
            {#if typeof unit === "string"}
                {unit}
            {:else}
                {@render unit()}
            {/if}
        </span>
    {/if}
</div>

<style scoped lang="less">
    
@import "#/components/mixin.less";
.unit-input {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    margin-inline: auto;
    input {
        .input;
        font-size: var(--font-size-medium);
        min-width: 3em;
    }
}



.unit-input.united {
    grid-template-columns: 1fr auto;
    .label {
        grid-column: 1 / 3;
    }
}

.unit {
    color: white;
}



.unit {
    font-size: 1.6em;
}

</style>