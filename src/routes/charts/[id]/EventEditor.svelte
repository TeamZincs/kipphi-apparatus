<script module lang="ts">
    import { EvaluatorType } from "kipphi";

    let evaluatorType: EvaluatorType = $state(EvaluatorType.eased);
    let expressionContent = $state("");

    const EASED = EvaluatorType.eased;
    const EXPRESSION = EvaluatorType.expressionbased;
</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
    import Label from "#/components/Label.svelte";
    import { selectedNode, operationList, eventsType, templateName } from "./store.svelte";
    import { EasedEvaluator, easingArray, EventEndNode, EventStartNode, NodeType, Op, type EventValueESType, EventValueType, InterpreteAs, TextEasedEvaluator, EasingType, ExpressionEvaluator, Easing, SegmentedEasing, BezierEasing, NormalEasing, TemplateEasing } from "kipphi";
    import { _ } from "#/i18n";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import ColorInput from "#/components/Inputs/ColorInput.svelte";
    import RadioTabs from "#/components/RadioTabs.svelte";
    import { notify } from "#/notify.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import EasingTypeTabs from "./EasingTypeTabs.svelte";


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
        valueType: typeof target.value === "number"
            ? EventValueType.numeric
        : typeof target.value === "string"
            ? EventValueType.text
        : EventValueType.color,
        interpretedAs: (target.evaluator as TextEasedEvaluator)?.interpretedAs
    });
    const updateStates = () => {
        const _values = getValues();
        values = _values
        if (_values.evaluator instanceof EasedEvaluator) {
            evaluatorType = EASED;
            const easing = (_values.evaluator as EasedEvaluator<any>).easing;
            const inner = easing instanceof SegmentedEasing ? easing.easing : easing;
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
    }

    let target = $derived($selectedNode);
    let values = $state(getValues());
    evaluatorType = values.evaluator instanceof EasedEvaluator ? EASED : EXPRESSION;

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
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            wrap(e)
        ));
    });

    function setExpressionEvaluator() {
        if (!expressionContent) {
            return;
        }
        let evaluator: ExpressionEvaluator<any>;
        try {
            evaluator = new ExpressionEvaluator(expressionContent);
        } catch (e) {
            notify(e instanceof Error ? e.message : e + "", "error")
            return;
        }
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            evaluator
        ));
    }

    function wrap(easing: Easing): EasedEvaluator<any> {
        return operationList.chart.getEasedEvaluator(easing, values.valueType, values.interpretedAs);
    }
    function changeInterpreteAs(interpretedAs: InterpreteAs) {
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            operationList.chart.getEasedEvaluator((values.evaluator as EasedEvaluator<string>).easing, EventValueType.text, interpretedAs)
        ))
    }
</script>

<Label>
    {values.isEnd ? $_("main.event.endNode") : $_("main.event.startNode")}
    ({values.parentSeq?.id})
</Label>

<div class="grid">
    <Label small>{$_("main.event.time")}</Label>
    <FractionInput disabled={values.isFirst} bind:value={
        () => values.time,
        (newTime) => {
            operationList.do(new Op.EventNodeTimeChangeOperation(
                target,
                newTime
            ));
        }
    }></FractionInput>
    <Label small>
        {$_("main.event.value")}
    </Label>
    {#if typeof values.value === "number"}
    <input type="number" bind:value={
        () => values.value as number,
        (newValue) => {
            if (newValue === null) {
                return;
            }
            operationList.do(new Op.EventNodeValueChangeOperation(
                target,
                newValue
            ));
        }
    }>
    {:else if typeof values.value === "string"}
    <input type="text" bind:value={
        () => values.value as string,
        (newValue) => {
            operationList.do(new Op.EventNodeValueChangeOperation(
                target,
                newValue
            ));
        }
    }>
    {:else if Array.isArray(values.value)}
    <ColorInput bind:value={
        () => values.value[0] << 16 | values.value[1] << 8 | values.value[2],
        (newColor) => {
            operationList.do(new Op.EventNodeValueChangeOperation(
                target,
                [(newColor >> 16) & 0xFF, (newColor >> 8) & 0xFF, newColor & 0xFF]
            ));
        }
    }></ColorInput>
    {/if}
</div>
<RadioTabs name="evaluator" options={
    [EASED, EXPRESSION]
} displayTexts={
    [$_("main.event.evaluators.eased"), $_("main.event.evaluators.expression")]
} bind:currentOption={
    () => evaluatorType,
    (op) => {
        evaluatorType = op;
        if (op === EASED) {
            operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                wrap(rawEasing)
            ))
        } else if (op === EXPRESSION) {
            setExpressionEvaluator();
        }
    }
}>
    {#snippet page(option)}
        {#if option === EASED}
            {#if typeof values.value === "string"}
            <PopupOption wide
                bind:currentOption={
                    () => values.interpretedAs,
                    (v) => {
                        changeInterpreteAs(v);
                    }
                }
                options={[InterpreteAs.str, InterpreteAs.int, InterpreteAs.float]}
                displayTexts={["string", "integer", "float"]}
            ></PopupOption>
            {/if}
            <EasingTypeTabs
                bind:easingType={rawEasingType}
                bind:easing={
                    () => rawEasing,
                    (newEasing) => {
                        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                            getStartNode(target),
                            wrap(newEasing)
                        ))
                    }
                }
                ongototemplate={() => {
                    const inner = rawEasing instanceof SegmentedEasing ? rawEasing.easing : rawEasing;
                    if (inner instanceof TemplateEasing) {
                        eventsType.set("easing");
                        templateName.set(inner.name);
                    }
                }}
            ></EasingTypeTabs>
        {:else if option === EXPRESSION}
            <input type="text" bind:value={expressionContent} onchange={setExpressionEvaluator}>
        {/if}
    {/snippet}
</RadioTabs>

<DestructiveButton
    onclick={
        () => {
            operationList.do(new Op.EventNodePairRemoveOperation(getStartNode(target)));
        }
    }
>{$_("main.event.delete")}</DestructiveButton>

<style lang="less" scoped>
    @import "#/components/mixin.less";

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 4px;
    }
    
    input {
        .input();
        font-size: var(--font-size-medium);
    }
</style>
