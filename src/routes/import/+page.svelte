<script lang="ts">
    import {
        writeTextFile,
        writeFile,
        mkdir,
        exists,
    } from "@tauri-apps/plugin-fs";
    import { join } from "@tauri-apps/api/path";
    import mime from "mime";

    import { goto } from "$app/navigation";
    import { getExtension } from "#/util";

    import { type PageData } from "./$types";
    import { _ } from "#/i18n";
    // import { _ } from "svelte-i18n";

    import {
        EasingType,
        EvaluatorType,
        EventNodeSequence,
        SCHEMA,
        VERSION,
        type BPMSegmentData,
        type ChartDataKPA,
        type ChartDataKPA2,
        type ChartDataRPE,
        type EventLayerDataKPA2,
        type EventNodeSequenceDataKPA2,
        type EventType,
        type EventValueESType,
        type JudgeLineDataKPA2,
    } from "kipphi";

    import { parseRawInfoTxt, parseInfoTxt, saveAFileToChart, type ChartMetadata } from "#/queryCharts";
    import { unzip } from "#/uncompress";
    import { type UnzippedFile } from "#/workers/unzip.worker";

    const { data }: { data: PageData } = $props();
    const identifiers = new Set(data.chartInfos.map((info) => info.identifier));

    //#region
    function getDuration(blob: Blob): Promise<number> {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        return new Promise((resolve) => {
            audio.addEventListener(
                "loadedmetadata",
                () => {
                    resolve(audio.duration);
                    URL.revokeObjectURL(url);
                },
                { once: true },
            );
        });
    }

    async function createWithRetail() {
        if (!processing) {
            processing = true;
        } else {
            return;
        }
        const chart = chartFileInput.files?.[0];
        const music = musicFileInput.files?.[0];
        const illustration = illustrationFileInput.files?.[0];
        if (!music) {
            alert($_("form.alert.music"));
            return;
        }
        if (!chart) {
            alert($_("import.alert.chart"));
            return;
        }
        if (!illustration) {
            alert($_("form.alert.illustration"));
            return;
        }
        await createWithFiles(chart, music, illustration);

        success = true;

        setTimeout(() => goto(`/charts/${idInput.value}`), 3000);
    }
    async function createWithArchive() {
        if (!processing) {
            processing = true;
        } else {
            return;
        }
        const archive = archiveFileInput.files?.[0];
        if (!archive) {
            alert($_("import.alert.archive"));
            return;
        }
        const result = await unzip(archive);
        if (!result.success) {
            alert($_("import.alert.unzipFailed"));
            return;
        }
        const files = result.files;
        let chart: File, music: File, illustration: File;
        let mName: string, cName: string, iName: string;
        // console.log(files);
        // 我不打算写缺失元数据的补救措施了
        const infoTxt = files.find((n) => n.name === "info.txt");
        const makeFile = (name: string, mimeType: string) => {
            const entry = files.find((n) => n.name === name);
            if (!entry) {
                alert($_("import.alert.incompleteArchive", {values:{missing:name}}));
                throw new Error(`Missing file: ${name}`);
            }
            const file = new File([entry.buffer], name, {type:mimeType});
            return file;
        }
        // console.log(infoTxt, [...files]);
        if (infoTxt) {
            const info = parseRawInfoTxt(infoTxt.buffer);
            mName = info.Song;
            cName = info.Chart;
            iName = info.Picture;
        } else {
            const metadata = files.find((n) => n.name === "metadata.json");
            if (!metadata) {
                alert($_("import.alert.incompleteArchive", {values:{missing:"metadata.json"}}));
                return;
            }
            const info = JSON.parse(new TextDecoder().decode(metadata.buffer)) as ChartMetadata;
            mName = info.music;
            cName = info.chart;
            iName = info.illustration;
        }
        if (!(mName && cName && iName)) {
            alert($_("import.alert.imcompleteMeta"));
        }
        if (!mime.getType(mName)) {
            alert($_("form.alert.unknownAudioType", {values:{filename:mName}}));
            return;
        }
        if (!mime.getType(iName)) {
            alert($_("form.alert.unknownImageType", {values:{filename:iName}}));
            return;
        }
        chart = makeFile(cName, "application/json");
        music = makeFile(mName, mime.getType(mName) as string);
        illustration = makeFile(iName, mime.getType(iName) as string);
        const id = await createWithFiles(chart, music, illustration);
        if (!id) {
            return;
        }
        // 其他文件也传上去
        for (const file of result.files) {
            if (file.name === "info.txt" || file.name === "metadata.json" ||
            file.name === cName || file.name === mName || file.name === iName) {
                continue;
            }
            await writeFile(await join(data.meta.CHART_DIR, id, file.name), new Uint8Array(file.buffer));
        }
        success = true;
        setTimeout(() => goto(`/charts/${id}`), 3000);
    }

    function getTypeAndTitle(content: string): ["RPE" | "KPA1" | "KPA2", string] {
        /* 因为还要title，所以这里优化就无效了
        // 先看看前面几行，有version必为KPAJSON：
        const matchResult = /^\{\s*"version":\s*(\d+)\}/.exec(content);
        if (matchResult) {
            const version = parseInt(matchResult[1]);
            if (version >= 200) {
                return "KPA2";
            } else {
                return "KPA1";
            }
        }
        // 扫一下有没有BPMList，RPEJSON里面BPMJSON一般是第一个
        const matchResult2 = /^\{\s*"BPMList"/.exec(content);
        if (matchResult2) {
            return "RPE";
        }
        //*/
        // 都扫不到就只能全量解析了：
        const data = JSON.parse(content) as ChartDataRPE | ChartDataKPA2 | ChartDataKPA;
        if ("version" in data) {
            if (data.version >= 200) {
                return ["KPA2", data.info.name];
            } else {
                return ["KPA1", data.info.name];
            }
        } else if ("META" in data) {
            return ["RPE", data.META.name];
        } else {
            // 早期KPAJSON没有版本字段。谁还有那时候的谱面啊？？？
            return ["KPA1", (data as ChartDataKPA).info.name];
        }
    }


    async function createWithFiles(chart: File, music: File, illustration: File) {
        const id = idInput.value.trim();
        if (id === "") {
            idState = EMPTY;
            return;
        }
        const duration = await getDuration(music);

        const musicExtension = getExtension(music);
        const illustrationExtension = getExtension(illustration);
        if (!musicExtension) {
            alert($_("form.alert.unknownAudioType"));
        }
        if (!illustrationExtension) {
            alert($_("form.alert.unknownImageType"));
        }
        const chartContent = await chart.text();
        const [chartType, title] = getTypeAndTitle(chartContent);
        const musicName = `music.${musicExtension}`;
        const chartName = `chart.${chartType === 'RPE' ? 'rpe' : 'kpa'}.json`;
        const illustrationName = `illustration.${illustrationExtension}`;
        const metadata = {
            "chart": chartName,
            "durationSecs": await getDuration(music),
            "illustration": illustrationName,
            "music": musicName,
            "type": chartType,
            "title": title
        } satisfies ChartMetadata;
        const chartDir = await join(data.meta.CHART_DIR, id);

        if (!await exists(chartDir)) {
            await mkdir(chartDir);
        }
        
        await writeTextFile(await join(chartDir, "metadata.json"), JSON.stringify(metadata, null, 4));
        await writeTextFile(await join(chartDir, chartName), chartContent);
        await saveAFileToChart(id, musicName, music);
        await saveAFileToChart(id, illustrationName, illustration);
        return id;
    }

    //#endregion
    let idInput: HTMLInputElement,
        illustrationFileInput: HTMLInputElement,
        musicFileInput: HTMLInputElement,
        chartFileInput: HTMLInputElement,
        archiveFileInput: HTMLInputElement;

    const getColor = (state: State) => {
        switch (state) {
            case AVAILABLE:
                return "green";
            case OCCUPIED:
            case EMPTY:
            case INVALID:
                return "red";
        }
    };
    const getContent = (state: State) => {
        switch (state) {
            case AVAILABLE:
                return $_("form.idState.available");
            case OCCUPIED:
                return $_("form.idState.occupied");
            case EMPTY:
                return $_("form.idState.empty");
            case INVALID:
                return $_("form.idState.invalid");
        }
    };

    const checkId = () => {
        if (idInput.value.trim() === "") {
            idState = EMPTY;
        } else if (identifiers.has(idInput.value)) {
            idState = OCCUPIED;
        } else if (idInput.value.match(/[^a-zA-Z0-9-_]/)) {
            idState = INVALID;
        } else {
            idState = AVAILABLE;
        }
    };

    const INITIAL = 0;
    const AVAILABLE = 1;
    const OCCUPIED = 2;
    const EMPTY = 3;
    const INVALID = 4;
    type State = 0 | 1 | 2 | 3 | 4;
    const RETAIL = 0;
    const ARCHIVE = 1;
    type ImportWith = 0 | 1;

    let success: boolean = $state(false);
    let processing: boolean = $state(false);
    let idState: State = $state(INITIAL);
    let importWith: ImportWith = $state(RETAIL);
</script>

<main>
    <p>
        {$_("form.hint")}<br />
        {$_("form.chartsLocation", {
            values: { location: data.meta.CHART_DIR },
        })}<br />
        {$_("import.formathint")}
    </p>
    <div class="outer">
        <div class="tabs">
            <span
                class={importWith === RETAIL ? "selected" : ""}
                onclick={() => (importWith = RETAIL)}
                role="button"
                tabindex="0"
                onkeydown={() => {importWith = RETAIL; idInput.focus()}}
            >
                {$_("import.retail")}
            </span>
            <span
                class={importWith === ARCHIVE ? "selected" : ""}
                onclick={() => (importWith = ARCHIVE)}
                role="button"
                tabindex="0"
                onkeydown={() => (importWith = ARCHIVE)}
            >
                {$_("import.archive")}
            </span>
        </div>
        <div role="form">
            <span class="label">{$_("form.id")}</span>
            <input
                type="text"
                bind:this={idInput}
                placeholder="Identifier"
                oninput={checkId}
                onfocusout={checkId}
            />
            {#if idState !== INITIAL}
                <span
                    style="color: {getColor(idState)};
        font-size: small;
        grid-column: 1 /span 2"
                >
                    {getContent(idState)}
                </span>
            {/if}
            {#if importWith === RETAIL}
                <span class="label">{$_("import.chart")}</span>
                <input type="file" bind:this={chartFileInput} />
                <span class="label">{$_("form.illustration")}</span>
                <input type="file" bind:this={illustrationFileInput} />
                <span class="label">{$_("form.music")}</span>
                <input type="file" bind:this={musicFileInput} />
                <input
                    type="button"
                    value={$_("create.create")}
                    onclick={createWithRetail}
                />
                {#if success}
                    <p>{$_("create.success")}</p>
                {/if}
            {:else}
                <span>{$_("import.archive")}</span>
                <input type="file" bind:this={archiveFileInput} />
                <input
                    type="button"
                    value={$_("create.create")}
                    onclick={createWithArchive}
                />
                {#if success}
                    <p>{$_("create.success")}</p>
                {/if}
            {/if}
        </div>
    </div>
</main>

<style>
    @import "#/formPage.css";
    .tabs {
        display: flex;
        flex-direction: row;
        gap: 2px;
        padding: 0 0.2em;
        margin: 0;
    }
    .tabs > * {
        position: relative;
        top: 2px;
        display: block;
        background-color: azure;
        margin: 0;
        padding: 0.4em;
        border-top: 2px silver solid;
        border-left: 2px silver solid;
        border-right: 2px silver solid;
        border-top-left-radius: 7px;
        border-top-right-radius: 7px;
    }
    .tabs > .selected {
        box-shadow: 1px -2px 1px #666768;
        z-index: 1;
    }
    div[role="form"] {
        z-index: 0;
        /* 使得z-index生效 */
        position: relative;
    }
</style>
