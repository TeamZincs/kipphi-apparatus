<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        onclick,
        text,
        children
    }: {
        onclick: (event: MouseEvent) => void,
        text?: string
        children?: Snippet
    } = $props()
</script>
<button onclick={onclick}>
    {#if children}
        {@render children()}
    {:else}
        {text}
    {/if}
</button>
<style lang="less" scoped>
    @import "#/components/mixin.less";
    button {
        background-color: #007bff;
        color: white;
        font-size: 2.5vh;
        .wide-button;
    }
</style>