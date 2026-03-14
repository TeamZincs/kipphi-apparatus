<script lang="ts">
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import Navigator from "#/components/Navigator.svelte";
    import { convertPEZ, convertRPEJSON } from "#/convertChart";
    import { _ } from "#/i18n";
    import { downloadFile as downloadFileToAppdata } from "#/background";

    import type { PageData } from "./$types";

    let { data }: { data: PageData} = $props();

    const chartId = data.id;

    function downloadFile(fileName: string, content: ArrayBuffer | string) {
        const u8Arr = typeof content === "string" ? (new TextEncoder().encode(content)) : new Uint8Array(content);
        downloadFileToAppdata(fileName, u8Arr, true);
    }

</script>

<main>
    <Navigator />
    <div id="content">
        <ProgressiveButton onclick={
            async () => {
                const blob = await convertRPEJSON(chartId);
                downloadFile(`${chartId}.rpe.json`, blob);
            }
        }>{$_("export.convertToRPEJSONOnly")}</ProgressiveButton>
        <ProgressiveButton onclick={
            async () => {
                const blob = await convertPEZ(chartId);
                downloadFile(`${chartId}.pez`, blob);
            }
        }>{$_("export.exportPEZ")}</ProgressiveButton>
    </div>
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