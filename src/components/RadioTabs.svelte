<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';

    let {
        name,
        options,
        displayTexts,
        currentOption = $bindable(),
        page
    }: {
        name: string,
        options: T[];
        displayTexts?: string[];
        currentOption: T;
        page: Snippet<[T]>
    } = $props();
</script>

<div class="radio-tabs-container">
    <div class="radio-tabs">
        {#each options as option}
            <label class="radio-tab">
                <input type="radio" name={name} value={option} checked={option === currentOption} onchange={() => currentOption = option}>
                {
                    displayTexts ? displayTexts[options.indexOf(option)] : option
                }
            </label>
        {/each}
    </div>
    <div class="radio-tabs-page">
        {@render page(currentOption)}
    </div>
</div>

<style lang="less" scoped>
    .radio-tabs-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 100%;
    }



    .radio-tabs {
        display: flex;
        width: 100%;
        flex-direction: row;
        gap: 2px;
        flex-wrap: wrap;
    }



    .radio-tab {
        font-size: var(--font-size-small);
        color: var(--color-foreground);
        display: flex;
        align-items: center;
    }



    .radio-tabs-page {
        display: flex;
        flex-direction: column;
        gap: 4px;
        background-color: #BBB3;
        border-radius: var(--border-radius);
        padding: var(--border-radius);
        box-shadow: 1px 1px 1px black inset;
    }

    input[type="radio"] {
        transform: scale(1.5);
    }
</style>