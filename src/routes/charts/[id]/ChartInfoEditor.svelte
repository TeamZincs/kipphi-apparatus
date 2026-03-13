<script lang="ts">
    import { openPath as tauriOpenPath } from "#/opener"

    import Label from "#/components/Label.svelte";
    import { _ } from "#/i18n";
    import { Chart, Op } from "kipphi";
    import { chartId, operationList } from "./store.svelte";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { onSave, saveChart } from "./save";
    import { notify } from "../../../notify.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import { getPathOfChart } from "#/queryCharts";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import { goto } from "$app/navigation";

    const target = operationList.chart;
    let values = $state({
        title: target.name,
        charter: target.charter,
        composer: target.composer,
        illustrator: target.illustrator,
        offset: target.offset,
        level: target.level,
        modified: target.modified
    });

    let message = $state("");

    operationList.addEventListener("do", (op) => {
        if (op.operation.constructor.name.startsWith("Chart")) {
            values = {
                title: target.name,
                charter: target.charter,
                composer: target.composer,
                illustrator: target.illustrator,
                offset: target.offset,
                level: target.level,
                modified: target.modified
            }
        }
    });
    onSave(() => {
        values.modified = target.modified;
    })
    function handleChange<K extends Op.ChartPropName>(key: K) {
        return (value: Chart[K]) => {
            operationList.do(new Op.ChartPropChangeOperation(target, key, value));
        }
    }
</script>

<Label>{$_("main.chart.info")}</Label>
<div class="grid">
    <Label small>{$_("main.chart.id")}</Label>
    <input type="text" readonly disabled value={chartId}>
    <Label small>{$_("main.chart.title")}</Label>
    <input type="text" bind:value={
        () => values.title,
        handleChange("name")
    }>
    <Label small>{$_("main.chart.charter")}</Label>
    <input type="text" bind:value={
        () => values.charter,
        handleChange("charter")
    }>
    <Label small>{$_("main.chart.composer")}</Label>
    <input type="text" bind:value={
        () => values.composer,
        handleChange("composer")
    }>
    <Label small>{$_("main.chart.illustrator")}</Label>
    <input type="text" bind:value={
        () => values.illustrator,
        handleChange("illustrator")
    }>
    <Label small>{$_("main.chart.level")}</Label>
    <input type="text" bind:value={
        () => values.level,
        handleChange("level")
    }>
    <Label small>{$_("main.chart.offset")}</Label>
    <UnitInput step={1} unit="ms" bind:value={
        () => values.offset,
        handleChange("offset")
    }/>
</div>

<Button onclick={
    async () => {
        tauriOpenPath(await getPathOfChart(chartId));
    }
}>{$_("main.chart.openInExplorer")}</Button>

<textarea placeholder={$_("main.chart.summary")} spellcheck="false" bind:value={message}></textarea>
<ProgressiveButton disabled={!values.modified} onclick={
    () => {
        if (!message) {
            notify($_("main.chart.noMessage"), 'error');
            return;
        }
        try {
            saveChart(target, message);
            message = ""
            notify($_("main.chart.saveSuccess"), 'info');
        } catch (e) {
            notify(e instanceof Error ? e.message : String(e), 'error');
        }
    }
}>{$_("main.chart.save")}</ProgressiveButton>

<DestructiveButton onclick={
    () => {
        if (target.modified) {
            if (confirm($_("main.chart.confirm"))) {
                goto("/");
            }
        } else {
            goto("/");
        }
    }
}>
    {$_("main.chart.exit")}
</DestructiveButton>

<style lang="less" scoped>
    @import "#/components/mixin.less";
    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px;
        align-items: center;
    }
    input {
        .input();
        font-size: var(--font-size-medium);
    }
    textarea {
        font-size: var(--font-size-small);
        width: 100%;
        box-sizing: border-box;
        .input()
    }
</style>