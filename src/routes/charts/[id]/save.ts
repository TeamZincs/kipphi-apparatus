import { saveChart as _saveChart } from "#/queryCharts";
import type { Chart } from "kipphi";
import { chartId } from "./store.svelte";

export async function saveChart(chart: Chart, message: string) {
    const id = chartId;
    if (!id) {
        throw new Error("Chart ID is not set");
    }
    await _saveChart(id, chart, message);
    chart.modified = false;
    callbackfns.forEach(fn => fn());
}

let callbackfns: (() => void)[] = [];

export async function onSave(callbackfn: () => void) {
    callbackfns.push(callbackfn);
}

