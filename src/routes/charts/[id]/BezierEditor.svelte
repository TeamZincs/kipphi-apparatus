<script module lang="ts"> // 单例模式
    import { BezierEditor } from "kipphi-canvas-editor"
    import { onDestroy, onMount } from "svelte";
    let canvasEditor = new BezierEditor();
</script>

<script lang="ts">
    let container: HTMLDivElement;
    let {value = $bindable()}: { value: [number, number, number, number]} = $props();
    const listener = () => {
        value = canvasEditor.getValue();
    }
    $effect(() => {
        canvasEditor.setValue(...value);
    })
    onMount(() => {
        canvasEditor.addTo(container);
        canvasEditor.addEventListener("change", listener);
    });
    onDestroy(() => {
        canvasEditor.removeEventListener("change", listener);
    })
</script>

<div class="bezier-editor" bind:this={container}></div>

<style scoped lang="less">
    .bezier-editor {
        min-width: 100%;
        :global(canvas) {
            width: 100%;
        }
    }
</style>