<script lang="ts">
    import Navigator from "#/components/Navigator.svelte";
    import type { PageData } from "./$types";
    import { _ } from "#/i18n";
    import { disposeChart as delChart } from "#/queryCharts";
    import ImageLoader from "#/components/ImageLoader.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";

    const { data }: { data: PageData } = $props();
    async function deleteChart() {
        if (!data.chartInfo) {
            return;
        }
        await delChart(data.chartInfo.identifier);
        window.location.href = "/";
    }
</script>

<main>
    <Navigator />
    <div id="content">
        {#if data.chartInfo}
            <p>
                {$_("delete.confirm", {
                    values: {
                        name: data.chartInfo.title,
                        id: data.chartInfo.identifier,
                    },
                })}<br>
                {    data.inKPA
                ? $_("delete.alreadyWritten", {values: {mins: data.time ?? 0}})
                : $_("delete.notKPA")
                }<br>
                {
                    $_("delete.hint", {values: {path: data.meta.TRASH_DIR}})
                }
            </p>
            <DestructiveButton onclick={deleteChart} variant="destructive">{$_("delete.delete")}</DestructiveButton>
        {:else}
            <p>{$_("delete.notFound")}</p>
        {/if}
    </div>
    {#if data.chartInfo}
    <ImageLoader src={data.chartInfo?.image} alt={data.chartInfo?.identifier} style="object-fit: cover; height: 100%"/>
    {/if}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    #content {
        position: relative;
        font-size: 4vh;
        z-index: 1;
        position: absolute;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(16px) brightness(40%);
        color: white;
        padding-top: 10vh;
        padding-left: 10vw;
        padding-right: 10vw;
        box-sizing: border-box;
        flex: 1;
        align-content: center;
    }
</style>
