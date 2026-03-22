import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { getChartProject, queryMeta, readAFileInChart, type ChartMetadata } from "#/background";
import type { PageLoad } from "./$types";
import { setID } from "./store.svelte";
import { KPAError } from "kipphi";

export const load: PageLoad = async (event) => {
    const chartId = event.params.id;
    setID(chartId);
    // 防止缓冲区堆积错误
    KPAError.flush();
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





