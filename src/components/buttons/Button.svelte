<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        onclick,
        text,
        children,
        variant = "default",
        disabled = false
    }: {
        onclick: (event: MouseEvent) => void,
        text?: string
        children?: Snippet,
        variant?: "default" | "progressive" | "destructive",
        disabled?: boolean
    } = $props()
</script>
<button
    onclick={(e) => !disabled && onclick(e)}
    class:progressive={variant === "progressive"}
    class:destructive={variant === "destructive"}
    class:disabled
>
    {#if children}
        {@render children()}
    {:else}
        {text}
    {/if}
</button>
<style lang="less" scoped>
    @import "#/components/mixin.less";
    button {
        background-color: #f9f9f9;
        color: black;
        font-size: 2.5vh;
        appearance: none;
        // border: 1px solid grey;
        border: none;
        .wide-button;
        &.progressive {
            background-color: #007bff;
            color: white;
        }
        &.destructive {
            background-color: #dc3545;
            color: white;
        }
        &.disabled {
            pointer-events: none;
            filter: grayscale(0.9);
        }
    }
</style>