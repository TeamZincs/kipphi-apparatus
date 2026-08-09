<script lang="ts">
    import Button from "#/components/buttons/Button.svelte";
    import { _ } from "#/i18n";
    import { getFileInRespack, openPath } from "#/background";
    import { respackId as currentRespackId, useRespack } from "#/respack.svelte";
    import { onDestroy } from "svelte";
    import { _ReturnType } from "#/background-tauri";
    let {
        name,
        pathname,
        shortPathname,
    }: { name: string; pathname: string; shortPathname: string } = $props();

    async function loadImage(filename: string): Promise<string> {
        const blob = await getFileInRespack(shortPathname, filename);
        return blob && URL.createObjectURL(blob);
    }
    const tap = await loadImage("click.png");
    const flick = await loadImage("flick.png");
    const hold = await loadImage("hold.png");
    const drag = await loadImage("drag.png");
    onDestroy(() => {
        URL.revokeObjectURL(tap);
        URL.revokeObjectURL(flick);
        URL.revokeObjectURL(hold);
        URL.revokeObjectURL(drag);
    })
</script>

<div class="respack" class:selected={shortPathname === $currentRespackId} role="button" onclick={() => {
    useRespack(shortPathname);
}}>
    <span class="name">{name}</span>
    <img src={tap} alt="tap"/>
    <img src={hold} alt="hold" class="hold"/>
    <img src={flick} alt="flick"/>
    <img src={drag} alt="drag"/>
    {#if pathname}
    <span class="button-field">
        <Button onclick={() => openPath(pathname)}
            >{$_("main.chart.openInExplorer")}</Button
        >
    </span>
    {/if}
</div>

<style scoped lang="less">
    .name {
        font-size: var(--font-size-medium);
        color: var(--color-foreground);
    }
    .respack {
        box-sizing: border-box;
        border-radius: var(--border-radius);
        background-color: #eee3;
        padding: 1vh;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 1vh;
        .name {
            grid-column: 1 / 5;
        }
        img {
            width: 6vh;
            &.hold {
                max-height: 8vh;
            }
            margin: auto;
        }
        .button-field {
            grid-column: 1 / 5;
            text-align: center;
        }
        width: 100%;
        
        transition-property: box-shadow, transform;
        transition-duration: 0.5s;
        transition-timing-function: ease;
        &.selected {
            transform: translate(-0.5vh, -0.5vh);
            box-shadow: 0.5vh 0.5vh 0.5vh #2229;
        };
        max-height: 70vh;
        scrollbar-width: none;
    }
</style>
