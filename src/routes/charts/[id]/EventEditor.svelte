<script module lang="ts">
type Points = [number, number, number, number];

let easingId = $state(1);
let templateEasingName = $state("");
let bezierEasingPoints: Points = $state([0, 0, 1, 1]);

let evaluatorType: EvaluatorType = $state(EvaluatorType.eased);
let easingType: EasingType = $state(EasingType.normal)

let expressionContent = $state("");


const EASED = EvaluatorType.eased;
const EXPRESSION = EvaluatorType.expressionbased;

const NORMAL = EasingType.normal;
const BEZIER = EasingType.bezier;
const TEMPLATE = EasingType.template;




</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
    import Label from "#/components/Label.svelte";
    import { EventSequenceEditor } from "kipphi-canvas-editor";
    import { selectedNode, operationList } from "./store.svelte";
    import { EasedEvaluator, easingArray, EventEndNode, EventStartNode, NodeType, Op, type EventValueESType, EventValueType, InterpreteAs, TextEasedEvaluator, NormalEasing, TemplateEasing, BezierEasing, EvaluatorType, EasingType, ExpressionEvaluator } from "kipphi";
    import { _ } from "#/i18n";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import ColorInput from "#/components/Inputs/ColorInput.svelte";
    import RadioTabs from "#/components/RadioTabs.svelte";
    import EasingBox from "./EasingBox.svelte";
    import { notify } from "#/notify.svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import BezierEditor from "./BezierEditor.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";

    function getStartNode(node: EventStartNode<any> | EventEndNode<any>) {
        return node instanceof EventEndNode ? node.previous : node;
    }

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
        values = getValues();
        if (target.evaluator instanceof EasedEvaluator) {
            evaluatorType = EASED;

            const easing = target.evaluator.easing;
            if (easing instanceof NormalEasing) {
                easingType = NORMAL;
                easingId = easing.id;
            } else if (easing instanceof BezierEasing) {
                easingType = BEZIER;
                bezierEasingPoints = [...easing.cp1, ...easing.cp2];
            } else if (easing instanceof TemplateEasing) {
                easingType = TEMPLATE;
                templateEasingName = easing.name;
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
    async function getSuggestions(input: string) {
        const easingNames = operationList.chart.templateEasingLib.easings.keys().toArray();
        return easingNames.filter(n => n.includes(input));
    }

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
    function setTemplateEasing() {
        if (!templateEasingName) {
            return;
        }
        const easing = operationList.chart.templateEasingLib.easings.get(templateEasingName);
        if (!easing) {
            return;
        }
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            operationList.chart.getEasedEvaluator(
                easing,
                values.valueType,
                values.interpretedAs
            )
        ))
    }
    function setBezierEasing() {
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            operationList.chart.getEasedEvaluator(new BezierEasing([bezierEasingPoints[0], bezierEasingPoints[1]], [bezierEasingPoints[2], bezierEasingPoints[3]]), values.valueType, values.interpretedAs)
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
        console.log(evaluatorType)
        if (op === EASED) {
            operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                operationList.chart.getEasedEvaluator(easingArray[easingId], values.valueType, values.interpretedAs)
            ))
        } else if (op === EXPRESSION) {
            setExpressionEvaluator();
        }
    }
}>
    {#snippet page(option)}
        {#if option === EASED}
            <RadioTabs name="easing"
                options={ [NORMAL, BEZIER, TEMPLATE] }
                displayTexts={ [$_("main.event.easings.normal"), $_("main.event.easings.bezier"), $_("main.event.easings.template")] }
                bind:currentOption={
                    () => easingType,
                    (type) => {
                        easingType = type;
                        switch (type) {
                            case NORMAL:
                                operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                                    getStartNode(target),
                                    operationList.chart.getEasedEvaluator(easingArray[easingId], values.valueType, values.interpretedAs)
                                ));
                                break;
                            case BEZIER:
                                operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                                    getStartNode(target),
                                    operationList.chart.getEasedEvaluator(
                                        new BezierEasing(
                                            [bezierEasingPoints[0], bezierEasingPoints[1]],
                                            [bezierEasingPoints[2], bezierEasingPoints[3]]
                                        ),
                                        values.valueType,
                                        values.interpretedAs
                                    )
                                ));
                                break;
                            case TEMPLATE:
                                setTemplateEasing();
                        }
                    }
                }
            >
                {#snippet page(option)}
                {#if option === NORMAL}
                <EasingBox bind:value={
                    () => easingId,
                    (newEasing) => {
                        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                            getStartNode(target),
                            operationList.chart.getEasedEvaluator(easingArray[newEasing], values.valueType, values.interpretedAs)
                        ));
                    }
                }></EasingBox>
                {:else if option === BEZIER}
                <input type="text" value={bezierEasingPoints.map((n) => n.toFixed(2)).join(" ")} onchange={
                    (e) => {
                        const that = e.target as HTMLInputElement;
                        const arr = that.value.trim().split(/\s+/);
                        if (arr.length === 4) {
                            bezierEasingPoints = arr.map(parseFloat) as Points;
                            setBezierEasing();
                        } else {
                            return;
                        }
                    }
                }>
                <BezierEditor bind:value={
                    () => bezierEasingPoints,
                    (v) => {
                        bezierEasingPoints = v;
                        setBezierEasing();
                    }
                }></BezierEditor>
                {:else if option === TEMPLATE}
                <SuggestionInput bind:value={templateEasingName} getSuggestions={getSuggestions} onchange={setTemplateEasing}></SuggestionInput>
                {/if}
                {/snippet}
            </RadioTabs>
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
