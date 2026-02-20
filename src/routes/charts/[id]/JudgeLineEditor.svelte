<script module lang="ts">

    // 长生命周期
    let showsUIAttach = $state(false);
</script>

<script lang="ts">
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import ArrowedInput from "#/components/Inputs/ArrowedInput.svelte";
    import Label from "#/components/Label.svelte";
    import Tooltip from "#/components/Tooltip.svelte";
    import { _ } from "#/i18n";
    import { chartId, GlobalContext, operationList, player } from "./store.svelte";
    import { JudgeLine, Op } from "kipphi";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import type { UIName } from "kipphi";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import { fetchTexture, getTexturePathOf, getTextures, uploadTexture } from "#/queryCharts";
    import { notify } from "./notify.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import UploadButton from "#/components/buttons/UploadButton.svelte";

    const chart = operationList.chart;

    let target = $derived(chart.judgeLines[GlobalContext.selectedLineNumber])

    let values = $state({
        cover: target.cover,
        father: target.father ? target.father.id : -1,
        anchor: target.anchor,
        group: target.group.name,
        zOrder: target.zOrder,
        rotatesWithFather: target.rotatesWithFather,
        texture: target.texture
    });
    let uis: Record<UIName, JudgeLine> = $state({
        "name": chart.nameAttach,
        "bar": chart.barAttach,
        "combo": chart.comboAttach,
        "combonumber": chart.combonumberAttach,
        "level": chart.levelAttach,
        "pause": chart.pauseAttach,
        "score": chart.scoreAttach
    }) satisfies Record<UIName, JudgeLine>
    $effect(() => {
        values = {
            cover: target.cover,
            father: target.father ? target.father.id : -1,
            anchor: target.anchor,
            group: target.group.name,
            zOrder: target.zOrder,
            rotatesWithFather: target.rotatesWithFather,
            texture: target.texture
        }
        invalidFather = false;
    });


    let invalidFather = $state(false);
    function checkFather() {
        if (values.father === -1) {
            invalidFather = false;
            return null;
        } else {
            const toBeFather = chart.judgeLines[values.father];
            if (!toBeFather) {
                invalidFather = true;
                return null;
            }
            invalidFather = JudgeLine.checkinterdependency(target, toBeFather);
            return toBeFather;
        }
    }

    operationList.addEventListener("needsupdate", (ev) => {
        const clazz = ev.operation.constructor;
        if (clazz.name.startsWith("JudgeLine")) {
            values = {
                cover: target.cover,
                father: target.father ? target.father.id : -1,
                anchor: target.anchor,
                group: target.group.name,
                zOrder: target.zOrder,
                rotatesWithFather: target.rotatesWithFather,
                texture: target.texture
            }
        }
        if (clazz.name === "UIDetachOperation" || clazz.name === "UIAttachOperation") {
            uis = {
                "name": chart.nameAttach,
                "bar": chart.barAttach,
                "combo": chart.comboAttach,
                "combonumber": chart.combonumberAttach,
                "level": chart.levelAttach,
                "pause": chart.pauseAttach,
                "score": chart.scoreAttach
            }
        }
    });


    let texture: File = $state(null);
    
</script>


<Label>JudgeLine</Label>

<div class="grid">

<Label small>{$_("main.judgeline.group.term")}
    <Tooltip>{$_("main.judgeline.group.desc")}</Tooltip>
</Label>
<PopupOption wide
    options={
        chart.judgeLineGroups.map(group => group.name)
    }
    bind:currentOption={
        () => values.group,
        (value) => {
            operationList.do(new Op.JudgeLineRegroupOperation(target, chart.judgeLineGroups.find(group => group.name === value)));
        }
    }
></PopupOption>


<Label small>{$_("main.judgeline.cover.term")}
    <Tooltip>{$_("main.judgeline.cover.desc")}</Tooltip>
</Label>
<TextSwitchButton wide onText="Y" offText="N"
    bind:checked={
        () => values.cover,
        (value) => {
            operationList.do(new Op.JudgeLinePropChangeOperation(target, "cover", value));
        }
    }
></TextSwitchButton>


<Label small>{$_("main.judgeline.father.term")}
    <Tooltip>{$_("main.judgeline.father.desc")}</Tooltip>
</Label>
<ArrowedInput max={chart.judgeLines.length - 1} min={0}
    bind:value={
        () => values.father,
        (value) => {
            values.father = value;
            const toBeFather = checkFather();
            if (!invalidFather) {
                operationList.do(new Op.JudgeLineInheritanceChangeOperation(chart, target, toBeFather));
            }
        }
    }
    suffix={invalidFather ? "❌" : ""}
/>

<Label small>
    {$_("main.judgeline.rotatesWithFather.term")}
    <Tooltip>{$_("main.judgeline.rotatesWithFather.desc")}</Tooltip>
</Label>
<TextSwitchButton wide onText="Y" offText="N"
    bind:checked={
        () => values.rotatesWithFather,
        (value) => {
            operationList.do(new Op.JudgeLinePropChangeOperation(target, "rotatesWithFather", value));
        }
    }
></TextSwitchButton>


<Label small>
    {$_("main.judgeline.anchor.term")}
    <Tooltip>{$_("main.judgeline.anchor.desc")}</Tooltip>
</Label>
<div class="flex-column">
    <ArrowedInput step={0.01} suffix="(x)" bind:value={
        () => values.anchor[0],

        (value) => {
            operationList.do(new Op.JudgeLinePropChangeOperation(target, "anchor", [value, values.anchor[1]]));
        }
    }></ArrowedInput>
    <ArrowedInput step={0.01} suffix="(y)" bind:value={
        () => values.anchor[1],
        (value) => {
            operationList.do(new Op.JudgeLinePropChangeOperation(target, "anchor", [values.anchor[0], value]));
        }
    }></ArrowedInput>


</div>

<Label small>
    {$_("main.judgeline.zOrder.term")}
    <Tooltip>{$_("main.judgeline.zOrder.desc")}</Tooltip>
</Label>
<ArrowedInput step={1} bind:value={
    () => values.zOrder,
    (value) => {
        operationList.do(new Op.JudgeLinePropChangeOperation(target, "zOrder", value));
    }
}></ArrowedInput>

<Label small>
    {$_("main.judgeline.texture.term")}
    <Tooltip>{$_("main.judgeline.texture.desc")}</Tooltip>
</Label>
<SuggestionInput getSuggestions={
    async (input) => 
    (await getTextures(chartId))
        .filter(s => s.startsWith(input))
}
    onchange={
        async (t) => {
            if ((await getTextures(chartId)).find(texture => texture === t)) {
                operationList.do(new Op.JudgeLinePropChangeOperation(target, "texture", t));
                if (t === "line.png") { // 默认贴图不需要从后端获得
                    return;
                }
                player.textureMapping.set(t, await fetchTexture(chartId, t))
            } else {
                notify($_("main.judgeline.texture.notFound"), 'error');
            }
        }
    }
    value={values.texture}
></SuggestionInput>

<ProgressiveButton
    onclick={async () => {
        if (!texture) {
            notify($_("main.judgeline.select"), 'error');
            return;
        }
        try {
            await uploadTexture(chartId, texture);
            // 完事了把input里面的files删了
            texture = null;
            notify($_("main.judgeline.uploadSuccess"), 'info');
        } catch (e) {
            if (e instanceof Error) {
                notify(e.message, 'error');
            } else {
                notify('Unknown error', 'error');
            }
        }
    }}
>{$_("main.judgeline.upload")}</ProgressiveButton>
<UploadButton bind:file={texture} onchange={
    async (f) => {
        if (!f) {
            return;
        }
        const textures = await getTextures(chartId);
        if (textures.find(texture => texture === f.name)) {
            notify($_("main.judgeline.uploadWarning", { values: {dir: await getTexturePathOf(chartId)} }), 'warning');
        }
    }
}></UploadButton>
</div>


<Label small>
    <span class="collapsible-button"
        role="button"
        class:folded={!showsUIAttach}
        onclick={() => showsUIAttach = !showsUIAttach}></span>
    {$_("main.judgeline.attachUI.term")}
    <Tooltip>{$_("main.judgeline.attachUI.desc")}</Tooltip>
</Label>
<div class="grid" style:display={showsUIAttach ? "" : "none"}>
    {#each Object.entries(uis) as [uiName, uiJudgeLine], i}
            <Label small>{$_(`main.judgeline.attachUI.${uiName as UIName}`)}</Label>
            <TextSwitchButton wide
                offText={$_("main.judgeline.attachUI.detach")}
                onText={uiJudgeLine ? $_("main.judgeline.attachUI.attachedTo", { values: {id: uiJudgeLine.id}}) : $_("main.judgeline.attachUI.attach")}
                disabled={uiJudgeLine && uiJudgeLine !== target}
                bind:checked={
                    () => uiJudgeLine !== target,
                    (c) => {
                        if (c) {
                            operationList.do(new Op.UIDetachOperation(chart, uiName as UIName))
                        } else {
                            operationList.do(new Op.UIAttachOperation(chart, target, uiName as UIName))
                        }
                    }
                }
            ></TextSwitchButton>
    {/each}
</div>

<DestructiveButton text={$_("main.judgeline.delete")}
    onclick={() => {
        operationList.do(new Op.JudgeLineDeleteOperation(chart, target));
    }}
/>

<style lang="less" scoped>
    @import "#/components/mixin.less";
    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
    }
    .flex-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        align-items: center;
        width: 100%;
    }

    .collapsible-button {
        .collapsible-triangle;
        border-top-color: white;
    }
</style>