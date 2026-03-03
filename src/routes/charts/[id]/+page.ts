import { Chart, type ChartDataKPA, type ChartDataKPA2, type ChartDataRPE } from "kipphi";
import { getChart, queryMeta, readAFileInChart, type ChartMetadata } from "#/queryCharts";
import type { PageLoad } from "./$types";
import { setID } from "./store.svelte";

export const load: PageLoad = async (event) => {
    const chartId = event.params.id;
    setID(chartId);
    const {chart, music, illustration} = await getChart(chartId)
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





