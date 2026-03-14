import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { getChartProject, queryMeta, readAFileInChart, type ChartMetadata } from "#/background";
import type { PageLoad } from "./$types";
import { setID } from "./store.svelte";

export const load: PageLoad = async (event) => {
    const chartId = event.params.id;
    setID(chartId);
    const {chart, music, illustration} = await getChartProject(chartId)
    return {
        chart,
        music,
        illustration,
        tap: "/Tap.wav",
        drag: "/Drag.wav",
        flick: "/Flick.wav",
        anchorImg: "/Anchor.png",
        belowImg: "/Below.png",
        selectNoteImg: "/selectNote.png",
        startNodeImg: "/South.png",
        endNodeImg: "/North.png",
    };
};





