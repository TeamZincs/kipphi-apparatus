import type { Chart } from "kipphi";
import Constants from "./constants";
import { saveChart } from "./save";
import { KPASettings } from "#/settings.svelte";

export default class AutoSaveRunner {
    static chart: Chart;
    private static timeout: number;
    private static callbackfns: (() => void)[] = [];
    static init(chart: Chart) {
        this.chart = chart;
    }
    static run() {
        this.timeout = setInterval(() => {
            const originalChartSecs = this.chart.chartingSeconds ?? 0;
            this.chart.chartingSeconds = originalChartSecs + Constants.AUTOSAVE_INTERVAL / 1000;
            if (this.chart.modified === false) {
                return;
            }
            saveChart(this.chart, "Autosave " + new Date().toLocaleString());
        }, KPASettings.autosaveInterval)
    }
    static stop() {
        clearInterval(this.timeout);
        this.callbackfns = [];
    }
    static onSave(callbackfn: () => void) {
        this.callbackfns.push(callbackfn);
    }
}