<script lang="ts">
    let {
        getSuggestions,
        value = $bindable()
    }: {
        getSuggestions: (input: string) => Promise<string[]>,
        value: string
    } = $props();

    let displaysSuggestions = $state(false);
    let suggestions = $state([] as string[])
    async function deliverSuggestions(e: Event) {
        suggestions = await getSuggestions((e.target as HTMLInputElement).value);
        console.log(suggestions)
        displaysSuggestions = true;
    }
</script>

<div class="sugggestion-input-container">
<input class="suggestion-input" type="text"
bind:value
oninput={deliverSuggestions} onfocusout={() => setTimeout(() => displaysSuggestions = false, 100)}>
{#if displaysSuggestions}
<span class="suggestions-outer">
    <ul class="suggestions">
        {#each suggestions as suggestion}
        <li class="suggestion" role="button" onclick={() => value = suggestion}>
            {suggestion}
        </li>
        {/each}
    </ul>
</span>
{/if}
</div>

<style lang="less">
    @import '#/components/mixin.less';


    .sugggestion-input-container {
        min-width: 0;
    }

    .suggestion-input {
        .input;
        font-size: var(--font-size-medium);
        min-width: 3em;
        width: 100%;
        box-sizing: border-box;
    }
    .suggestions-outer {
        position: relative;
        display: block;
        width: 100%;
    }
    .suggestions {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        background-color: white;
        box-shadow: var(--box-shadow);
        padding-block: var(--border-radius);
        padding-inline: 0;
        border-radius: var(--border-radius);
        box-sizing: border-box;
        width: 100%;
        z-index: 1;
    }
    .suggestion {
        display: block;
        padding: 0.25em;
        &:hover {
            background-color: var(--color-selected-li)
        }
    }
</style>