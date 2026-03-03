<script lang="ts">
    import type { Snippet } from "svelte";
    import Button from "./Button.svelte";

    let {
        onclick,
        children,
        disabled = false
    }: {
        onclick: (event: MouseEvent) => void,
        children: Snippet,
        disabled?: boolean
    } = $props()
</script>

<Button onclick={onclick} children={children} variant="progressive" disabled={disabled}></Button>

