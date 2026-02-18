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
    font-size: 1.8vh;
    margin-inline: auto;
    input {
        .input;
        font-size: 1.6em;
        min-width: 3em;
    }
}

.unit-input.labeled {
    grid-template-rows: auto 1fr;
    .label {
        grid-row: 1;
    }
    .unit {
        grid-column: 2 / 3;
    }
}

.unit-input.united {
    grid-template-columns: 1fr auto;
    .label {
        grid-column: 1 / 3;
    }
}

.label, .unit {
    color: white;
}

.label {
    font-size: 120%;
    text-align: center;
}

.unit {
    font-size: 1.6em;
}

</style>