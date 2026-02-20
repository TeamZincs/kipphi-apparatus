import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { queryMeta, readAFileInChart, type ChartMetadata } from "#/queryCharts";
import type { PageLoad } from "./$types";
import { getMimeTypeFromName } from "#/util";
import { setID } from "./store.svelte";

export const load: PageLoad = async (event) => {
    const chartId = event.params.id;
    setID(chartId);
    const CHART_DIR = (await queryMeta()).CHART_DIR
    const filePath = await join(CHART_DIR, chartId, "metadata.json");
    const metadata = JSON.parse(await readTextFile(filePath)) as ChartMetadata;
    const chartPath = await join(CHART_DIR, chartId, metadata.chart);
    const chartType = metadata.type;
    const musicPath = metadata.music;
    const illustrationPath = metadata.illustration;
    const chartData = JSON.parse(await readTextFile(chartPath)) as ChartDataRPE | ChartDataKPA | ChartDataKPA2;
    const chart = chartType === "RPE"
        ? Chart.fromRPEJSON(chartData as ChartDataRPE, metadata.durationSecs)
        : Chart.fromKPAJSON(chartData as ChartDataKPA | ChartDataKPA2);
    const music = await readAFileInChart(
        chartId,
        musicPath,
        getMimeTypeFromName("audio", musicPath)
    );
    const illustration = await readAFileInChart(
        chartId,
        illustrationPath,
        getMimeTypeFromName("image", illustrationPath)
    );
    return {
        chart,
        music,
        illustration,
        tap: "/Tap.wav",
        drag: "/Drag.wav",
        flick: "/Flick.wav",
        tapImg: "/Tap.png",
        dragImg: "/Drag.png",
        flickImg: "/Flick.png",
        anchorImg: "/Anchor.png",
        holdHeadImg: "/HoldHead.png",
        holdBodyImg: "/HoldBody.png",
        belowImg: "/Below.png",
        chordImg: "/Chord.png",
        hitFxImg: "/hit_fx.png",
        selectNoteImg: "/selectNote.png",
        startNodeImg: "/South.png",
        endNodeImg: "/North.png",
    };
};





