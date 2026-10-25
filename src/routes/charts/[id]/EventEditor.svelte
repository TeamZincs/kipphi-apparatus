<script module lang="ts">
    import { EvaluatorType, EventType, VideoScale } from "kipphi";

    let evaluatorType: EvaluatorType = $state(EvaluatorType.eased);
    let expressionContent = $state("");

    const EASED = EvaluatorType.eased;
    const EXPRESSION = EvaluatorType.expressionbased;
</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
    import Label from "#/components/Label.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import {
        selectedNode,
        operationList,
        eventsType,
        templateName,
        chartId,
        player,
        gotoMacro,
        type AnyMacro,
    } from "./store.svelte";
    import {
        EasedEvaluator,
        easingArray,
        EventEndNode,
        EventMacroTime,
        EventMacroValue,
        EventStartNode,
        NodeType,
        Op,
        type EventValueESType,
        EventValueType,
        InterpreteAs,
        TextEasedEvaluator,
        EasingType,
        ExpressionEvaluator,
        Easing,
        SegmentedEasing,
        BezierEasing,
        NormalEasing,
        TemplateEasing,
        VideoEventStartNode
    } from "kipphi";
    import { _ } from "#/i18n";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import ColorInput from "#/components/Inputs/ColorInput.svelte";
    import RadioTabs from "#/components/RadioTabs.svelte";
    import { notify } from "#/notify.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import EasingTypeTabs from "./EasingTypeTabs.svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import { fetchVideo, getTexturePathOf, getVideos, uploadTexture } from "#/background";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import UploadButton from "#/components/buttons/UploadButton.svelte";

    const NORMAL = EasingType.normal;
    const BEZIER = EasingType.bezier;
    const TEMPLATE = EasingType.template;

    function getStartNode(node: EventStartNode<any> | EventEndNode<any>) {
        return node instanceof EventEndNode ? node.previous : node;
    }

    let rawEasing: Easing = $state(easingArray[1]);
    let rawEasingType: EasingType = $state(EasingType.normal);
    let syncingEasing: Easing | null = null;

    const getValues = () => ({
        time: target.time,
        value: target.value,
        evaluator: getStartNode(target).evaluator,
        parentSeq: target.parentSeq,
        isEnd: target instanceof EventEndNode,
        isFirst: target.previous?.type === NodeType.HEAD,
        valueType:
            typeof target.value === "number"
                ? EventValueType.numeric
                : typeof target.value === "string"
                  ? EventValueType.text
                  : EventValueType.color,
        isFilename: target.parentSeq.type === EventType.video,
        scale: (getStartNode(target) as unknown as VideoEventStartNode).scale,
        interpretedAs: (target.evaluator as TextEasedEvaluator)?.interpretedAs,
        macro: target.macro,
        macroTime: getStartNode(target).macroTime,
        linkedMacros: [...(target.linkedMacros ?? [])] as AnyMacro[],
    });
    const updateStates = () => {
        const _values = getValues();
        values = _values;
        if (_values.evaluator instanceof EasedEvaluator) {
            evaluatorType = EASED;
            const easing = (_values.evaluator as EasedEvaluator<any>).easing;
            const inner =
                easing instanceof SegmentedEasing ? easing.easing : easing;
            syncingEasing = easing;
            rawEasing = easing;
            if (inner instanceof NormalEasing) {
                rawEasingType = NORMAL;
            } else if (inner instanceof BezierEasing) {
                rawEasingType = BEZIER;
            } else if (inner instanceof TemplateEasing) {
                rawEasingType = TEMPLATE;
            }
        } else {
            evaluatorType = EXPRESSION;
        }
    };

    let target = $derived($selectedNode);
    let values = $state(getValues());
    let video: File = $state(null);
    evaluatorType =
        values.evaluator instanceof EasedEvaluator ? EASED : EXPRESSION;

    $effect(() => {
        updateStates();
    });
    operationList.addEventListener("needsupdate", (ev) => {
        const op = ev.operation;
        if (op.constructor.name.startsWith("Event")) {
            updateStates();
        }
    });

    // ---- push easing changes to operationList ----
    $effect(() => {
        const e = rawEasing;
        if (e === syncingEasing) return;
        operationList.do(
            new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                wrap(e),
            ),
        );
    });

    // 谱面的宏库统一管理所有事件宏，直接从其中取用
    let valueMacros = $derived.by(() => [...(operationList?.chart?.macroLib?.valueMacros.values() ?? [])]);
    let timeMacros = $derived.by(() => [...(operationList?.chart?.macroLib?.timeMacros.values() ?? [])]);

    /** 绑定、切换（传入另一个宏）或解绑（传入null）本节点的数值宏 */
    function setValueMacro(macro: EventMacroValue | null) {
        const node = target as EventStartNode<any>;
        if (macro) {
            if (macro === node.macro) { return; }
            operationList.do(new Op.MacroValueAssignOperation(macro, node));
        } else {
            if (!node.macro) { return; }
            operationList.do(new Op.MacroValueDeassginOperation(node));
        }
        values.macro = node.macro;
    }

    /** 绑定、切换（传入另一个宏）或解绑（传入null）起始节点的时间宏 */
    function setTimeMacro(macro: EventMacroTime | null) {
        const node = getStartNode(target);
        if (macro) {
            if (macro === node.macroTime) { return; }
            operationList.do(new Op.MacroTimeAssignOperation(macro, node));
        } else {
            if (!node.macroTime) { return; }
            operationList.do(new Op.MacroTimeDeassginOperation(node));
        }
        values.macroTime = node.macroTime;
    }

    function setExpressionEvaluator() {
        if (!expressionContent) {
            return;
        }
        let evaluator: ExpressionEvaluator<any>;
        try {
            evaluator = new ExpressionEvaluator(expressionContent);
        } catch (e) {
            notify(e instanceof Error ? e.message : e + "", "error");
            return;
        }
        operationList.do(
            new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                evaluator,
            ),
        );
    }

    function wrap(easing: Easing): EasedEvaluator<any> {
        return operationList.chart.getEasedEvaluator(
            easing,
            values.valueType,
            values.interpretedAs,
        );
    }
    function changeInterpreteAs(interpretedAs: InterpreteAs) {
        operationList.do(
            new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                operationList.chart.getEasedEvaluator(
                    (values.evaluator as EasedEvaluator<string>).easing,
                    EventValueType.text,
                    interpretedAs,
                ),
            ),
        );
    }
</script>

<Label>
    {values.isEnd ? $_("main.event.endNode") : $_("main.event.startNode")}
    ({values.parentSeq?.id})
</Label>

<div class="grid">
    <Label small>{$_("main.event.time")}</Label>
    <FractionInput
        disabled={values.isFirst}
        bind:value={
            () => values.time,
            (newTime) => {
                operationList.do(
                    new Op.EventNodeTimeChangeOperation(target, newTime),
                );
            }
        }
    ></FractionInput>
    <Label small>
        {$_("main.event.value")}
    </Label>
    {#if typeof values.value === "number"}
        <input
            type="number"
            bind:value={
                () => values.value as number,
                (newValue) => {
                    if (newValue === null) {
                        return;
                    }
                    operationList.do(
                        new Op.EventNodeValueChangeOperation(target, newValue),
                    );
                }
            }
        />
    {:else if values.isFilename}
        <SuggestionInput getSuggestions={
            async (input) => 
            (await getVideos(chartId))
                .filter(s => s.startsWith(input))
        }
            onchange={
                async (t) => {
                    if ((await getVideos(chartId)).find(texture => texture === t)) {
                        operationList.do(new Op.EventNodeValueChangeOperation(target, t));
                        if (t === "line.png") { // 默认贴图不需要从后端获得
                            return;
                        }
                        player.videoMapping.set(t, await fetchVideo(chartId, t))
                    } else {
                        notify($_("main.judgeline.texture.notFound"), 'error');
                    }
                }
            }
            value={values.value}
        ></SuggestionInput>

        <ProgressiveButton
            onclick={async () => {
                if (!video) {
                    notify($_("main.judgeline.select"), 'error');
                    return;
                }
                try {
                    await uploadTexture(chartId, video);
                    // 完事了把input里面的files删了
                    video = null;
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
        <UploadButton bind:file={video} onchange={
            async (f) => {
                if (!f) {
                    return;
                }
                const textures = await getVideos(chartId);
                if (textures.find(texture => texture === f.name)) {
                    notify($_("main.judgeline.uploadWarning", { values: {dir: await getTexturePathOf(chartId)} }), 'warning');
                }
            }
        }></UploadButton>
    {:else if typeof values.value === "string"}
        <input
            type="text"
            bind:value={
                () => values.value as string,
                (newValue) => {
                    operationList.do(
                        new Op.EventNodeValueChangeOperation(target, newValue),
                    );
                }
            }
        />
    {:else if Array.isArray(values.value)}
        <ColorInput
            bind:value={
                () =>
                    (values.value[0] << 16) |
                    (values.value[1] << 8) |
                    values.value[2],
                (newColor) => {
                    operationList.do(
                        new Op.EventNodeValueChangeOperation(target, [
                            (newColor >> 16) & 0xff,
                            (newColor >> 8) & 0xff,
                            newColor & 0xff,
                        ]),
                    );
                }
            }
        ></ColorInput>
    {/if}
</div>

{#if values.isFilename}
    <span style="font-size: var(--font-size-small); color: var(--color-foreground)">{$_("main.event.evaluators.constant")}</span>
    <Label small>
        {$_("main.event.videoscale.desc")}
    </Label>
    <PopupOption wide
        options={[VideoScale.cropCenter, VideoScale.fit, VideoScale.inside]}
        displayTexts={[$_("main.event.videoscale.cropCenter"), $_("main.event.videoscale.fit"), $_("main.event.videoscale.inside")]}
        bind:currentOption={
            () => values.scale,
            (v) => {
                operationList.do(
                    new Op.VideoEventScaleChangeOperation(getStartNode(target) as unknown as VideoEventStartNode, v),
                );
            }
        }
    ></PopupOption>
{:else}
    <RadioTabs
        name="evaluator"
        options={[EASED, EXPRESSION]}
        displayTexts={[
            $_("main.event.evaluators.eased"),
            $_("main.event.evaluators.expression"),
        ]}
        bind:currentOption={
            () => evaluatorType,
            (op) => {
                evaluatorType = op;
                if (op === EASED) {
                    operationList.do(
                        new Op.EventNodeEvaluatorChangeOperation(
                            getStartNode(target),
                            wrap(rawEasing),
                        ),
                    );
                } else if (op === EXPRESSION) {
                    setExpressionEvaluator();
                }
            }
        }
    >
        {#snippet page(option)}
            {#if option === EASED}
                {#if typeof values.value === "string"}
                    <PopupOption
                        wide
                        bind:currentOption={
                            () => values.interpretedAs,
                            (v) => {
                                changeInterpreteAs(v);
                            }
                        }
                        options={[
                            InterpreteAs.str,
                            InterpreteAs.int,
                            InterpreteAs.float,
                        ]}
                        displayTexts={["string", "integer", "float"]}
                    ></PopupOption>
                {/if}
                <EasingTypeTabs
                    bind:easingType={rawEasingType}
                    bind:easing={
                        () => rawEasing,
                        (newEasing) => {
                            operationList.do(
                                new Op.EventNodeEvaluatorChangeOperation(
                                    getStartNode(target),
                                    wrap(newEasing),
                                ),
                            );
                        }
                    }
                    ongototemplate={() => {
                        const inner =
                            rawEasing instanceof SegmentedEasing
                                ? rawEasing.easing
                                : rawEasing;
                        if (inner instanceof TemplateEasing) {
                            eventsType.set("easing");
                            templateName.set(inner.name);
                        }
                    }}
                ></EasingTypeTabs>
            {:else if option === EXPRESSION}
                <input
                    type="text"
                    bind:value={expressionContent}
                    onchange={setExpressionEvaluator}
                />
            {/if}
        {/snippet}
    </RadioTabs>
{/if}

<Label small>{$_("main.event.macro")}</Label>
{#if values.macro}
<Button onclick={() => gotoMacro(values.macro)}
    >{$_("main.event.macroValue", { values: { id: values.macro.id } })}</Button
>
{:else}
<span class="no-macro">{$_("main.event.noMacro")}</span>
{/if}
{#if values.macroTime}
<Button onclick={() => gotoMacro(values.macroTime)}
    >{$_("main.event.macroTime", { values: { id: values.macroTime.id } })}</Button
>
{/if}
{#if valueMacros.length > 0}
<Label small>{$_("main.macro.switchValue")}</Label>
<PopupOption wide
    options={[null, ...valueMacros]}
    displayTexts={[$_("main.event.noMacro"), ...valueMacros.map(macro => macro.id)]}
    bind:currentOption={
        () => values.macro ?? null,
        () => {}
    }
    onchange={(macro) => setValueMacro(macro)}
></PopupOption>
{/if}
{#if timeMacros.length > 0}
<Label small>{$_("main.macro.switchTime")}</Label>
<PopupOption wide
    options={[null, ...timeMacros]}
    displayTexts={[$_("main.event.noMacro"), ...timeMacros.map(macro => macro.id)]}
    bind:currentOption={
        () => values.macroTime ?? null,
        () => {}
    }
    onchange={(macro) => setTimeMacro(macro)}
></PopupOption>
{/if}
{#each values.linkedMacros as linkedMacro}
<Button onclick={() => gotoMacro(linkedMacro)}
    >{$_("main.event.macroLinked", { values: { id: linkedMacro.id } })}</Button
>
{/each}

<DestructiveButton
    onclick={() => {
        operationList.do(
            new Op.EventNodePairRemoveOperation(getStartNode(target)),
        );
    }}>{$_("main.event.delete")}</DestructiveButton
>

<style lang="less" scoped>
    @import "#/components/mixin.less";

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 4px;
    }

    .no-macro {
        color: var(--color-foreground);
        font-size: var(--font-size-small);
        opacity: 0.75;
    }

    input {
        .input();
        font-size: var(--font-size-medium);
    }
</style>
