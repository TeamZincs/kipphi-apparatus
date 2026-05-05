<script module lang="ts">

import { SelectionManager } from "kipphi-canvas-editor";
type Points = [number, number, number, number];

let easingId = $state(1);
let templateEasingName = $state("");
let bezierEasingPoints: Points = $state([0, 0, 1, 1]);

let evaluatorType: EvaluatorType = $state(EvaluatorType.eased);
let easingType: EasingType = $state(EasingType.normal)

let expressionContent = $state("");

let segmentBounds = $state([0.0, 1.0] as [number, number])


const EASED = EvaluatorType.eased;
const EXPRESSION = EvaluatorType.expressionbased;

const NORMAL = EasingType.normal;
const BEZIER = EasingType.bezier;
const TEMPLATE = EasingType.template;

class EasingCanvas extends EventTarget {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    rect: LTWH;
    padding: number;
    selectionManager: SelectionManager<"left" | "right"> = new SelectionManager();
    elementMatrix: Matrix33;
    elementMatrixInverted: Matrix33;
    holding: "left" | "right" | null = null;
    nodeSize: number = 32;
    constructor(canvas: HTMLCanvasElement, rect: LTWH) {
        super();
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.context.font = "30px phigros";
        this.context.textBaseline = "top"
        this.rect = rect;
        this.padding = 10;
        const resize = () => {
            const r = this.canvas.getBoundingClientRect();
            this.elementMatrix = identity.scale(r.width / canvas.width, r.height / canvas.height);

            this.elementMatrixInverted = this.elementMatrix.invert();
        }
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();
        on(["mousedown", "touchstart"], this.canvas, (e) => {
            const offset = getCanvasCoordFromEvent(
                e,
                this.canvas,
                this.elementMatrixInverted,
                identity
            );
            console.log(this.selectionManager, offset)
            const selection = this.selectionManager.click(offset);
            console.log(selection)
            if (selection && !this.holding) {
                this.holding = selection.target;
            }
            this.draw(this.lastEasing);
        });
        on(["mousemove", "touchmove"], this.canvas, e => {
            if (!this.holding) { return; }
            const offset = getCanvasCoordFromEvent(
                e,
                this.canvas,
                this.elementMatrixInverted,
                identity
            );
            let arg = (offset.x - this.padding) / (this.rect[2] - this.padding * 2);
            // clamp
            arg = Math.min(Math.max(arg, 0), 1);
            if (this.holding === "left") {
                this.redrawWithNewBounds(arg, null);
            } else {
                this.redrawWithNewBounds(null, arg);
            }
        });
        on(["mouseup", "touchend", "mouseleave"], this.canvas, () => {
            if (!this.holding) {
                return;
            }
            this.holding = null;
            this.dispatchEvent(new CustomEvent("change", { detail: this.lastEasing }));
        });
    }
    // @ts-expect-error
    override addEventListener(type: "change", callback: (e: CustomEvent<Easing>) => void): void {
        return super.addEventListener(type, callback as any);
    }
    lastEasing: TemplateEasing | NormalEasing | SegmentedEasing;
    draw(easing: TemplateEasing | NormalEasing | SegmentedEasing) {
        this.selectionManager.refresh();
        this.lastEasing = easing;
        const width = this.rect[2], pad = this.padding;
        const w = this.rect[2] - this.padding * 2, h = this.rect[3];
        const isSegmented = easing instanceof SegmentedEasing;
        const easingLeft = isSegmented ? easing.left : 0;
        const easingRight = isSegmented ? easing.right : 1;
        const context = this.context;
        const inner = isSegmented ? easing.easing : easing;
        context.clearRect(0, 0, width, h);
        context.fillStyle = "#222";
        context.fillRect(0, 0, width, h);
        context.fillStyle = "#fff3";
        context.fillText(easingLeft.toFixed(6), 10, 10);
        context.fillText(easingRight.toFixed(6), 10, 50);
        context.fillText(this.holding + "", 200, 50);
        context.fillStyle = "#2f93";
        context.fillRect(pad, h * 0.5, w, h / 3);
        const bgPath = new Path2D();
        const path1 = new Path2D();
        const path2 = new Path2D();
        const path3 = new Path2D();

        const forbidden = this.holding === "left" ? inner.getValue(easingRight) : inner.getValue(easingLeft);
        let lastPoint: number = null; // 计量禁入点
        const checkForbidden = !this.holding ? (): void => undefined :() => {
            if (value === forbidden) {
                if (!lastPoint) {
                    lastPoint = i + pad;
                }
            } else {
                if (lastPoint) {
                    console.log(lastPoint, (i + pad) - lastPoint)
                    bgPath.rect(lastPoint, h / 6, (i + pad) - lastPoint, h / 3);
                    lastPoint = null;
                }
                
            }
        }

        path1.moveTo(pad, h * 0.5);
        let i = 0;
        let value: number;
        let y = h * 0.5;
        for (; i < w * easingLeft; i += 2) {
            value = inner.getValue(i / w);
            checkForbidden();
            y = h / 3 * (1 - value) + h / 6;
            path1.lineTo(i + pad, y);
        }

        path2.moveTo(i + pad, y);
        const leftTop = [i + pad, y] as const;
        for (; i < w * easingRight; i += 2) {
            value = inner.getValue(i / w);
            checkForbidden();
            y = h / 3 * (1 - value) + h / 6;
            path2.lineTo(i + pad, y);
        }

        path3.moveTo(i + pad, y);
        const rightBottom = easingRight === 1 ? [w + pad, h / 6] as const : [i + pad, y] as const;
        
        for (; i <= w; i += 2) {
            value = inner.getValue(i / w);
            checkForbidden();
            y = h / 3 * (1 - value) + h / 6;
            path3.lineTo(i + pad, y);
        }
        value = undefined;
        checkForbidden();
        if (this.holding) {
            context.fillStyle = "#f006";
            console.log(bgPath)
            context.fill(bgPath);
        }
        context.lineWidth = 3;
        context.strokeStyle = "#fff";
        context.stroke(path1);
        context.strokeStyle = "#df6"
        context.stroke(path2);
        context.strokeStyle = "#fff";
        context.stroke(path3);
        
        if (isSegmented) {
            context.fillStyle = "#df63";
            context.fillRect(leftTop[0], leftTop[1], rightBottom[0] - leftTop[0], rightBottom[1] - leftTop[1]);
            context.strokeStyle = "#2f7a";

            context.beginPath();
            context.moveTo(pad, h * 5 / 6);
            
            for (let i = 0; i <= w; i += 2) {
                value = easing.getValue(i / w);
                y = h / 3 * (1 - value) + h / 2;
                context.lineTo(i + pad, y);
            }
            context.stroke();
        }
        const ns = this.nodeSize;
        const half = ns / 2;
        context.fillStyle = "#5cfc";
        context.fillRect(pad + easingLeft * w - 2, 0, 4, h / 2);
        context.fillRect(pad + easingLeft * w - half, h / 2, ns, ns);
        this.selectionManager.add({
            target: "left",
            left: pad + easingLeft * w - half,
            top: h / 2 - half,
            width: ns,
            height: ns,
            priority: 1
        })
        context.fillStyle = "#f20c";
        context.fillRect(pad + easingRight * w - 2, 0, 4, h / 2);
        context.fillRect(pad + easingRight * w - half, h / 2, ns, ns);
        this.selectionManager.add({
            target: "right",
            left: pad + easingRight * w - half,
            top: h / 2 - half,
            width: ns,
            height: ns,
            priority: easingRight < 0.5 ? 2 : 1
        })
    }
    redrawWithNewBounds(left: number, right: number) {

        try {

            const newEasing = EasingCanvas.getNewEasing(this.lastEasing, left, right);
            this.draw(newEasing as any);
        } catch (e) {

        }
    }
    static getNewEasing(easing: Easing, left: number, right: number) {
        const isSegmented = easing instanceof SegmentedEasing;
        const inner = isSegmented ? easing.easing : easing;
        const easingLeft = isSegmented ? easing.left : 0;
        const easingRight = isSegmented ? easing.right : 1;
        left ??= easingLeft;
        right ??= easingRight;
        if (right < left) {
            throw new Error("invalid bounds")
        }
        return (left === 0 && right === 1) ? inner : new SegmentedEasing(inner, left, right);
    }
}


</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
    import Label from "#/components/Label.svelte";
    import { EventSequenceEditor } from "kipphi-canvas-editor";
    import { selectedNode, operationList, eventsType, templateName } from "./store.svelte";
    import { EasedEvaluator, easingArray, EventEndNode, EventStartNode, NodeType, Op, type EventValueESType, EventValueType, InterpreteAs, TextEasedEvaluator, NormalEasing, TemplateEasing, BezierEasing, EvaluatorType, EasingType, ExpressionEvaluator, Easing, SegmentedEasing } from "kipphi";
    import { _ } from "#/i18n";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import ColorInput from "#/components/Inputs/ColorInput.svelte";
    import RadioTabs from "#/components/RadioTabs.svelte";
    import EasingBox from "./EasingBox.svelte";
    import { notify } from "#/notify.svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import BezierEditor from "./BezierEditor.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import type { LTWH } from "kipphi-canvas-editor/notesEditor";
    import { tick } from "svelte";
    import { getCanvasCoordFromEvent, getOffsetCoordFromEvent, on } from "kipphi-canvas-editor/util";
    import { identity, type Matrix33 } from "kipphi-player";
    import Button from "#/components/buttons/Button.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";

    function getStartNode(node: EventStartNode<any> | EventEndNode<any>) {
        return node instanceof EventEndNode ? node.previous : node;
    }

    let canvas: HTMLCanvasElement = $state(null);
    let easingCanvas: EasingCanvas;
    $effect(() => {
        if (!canvas) { return; }
        easingCanvas = new EasingCanvas(canvas, [0, 0, 300, 600]);
        easingCanvas.addEventListener("change", (e) => {
            const easing = e.detail;
            operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                getStartNode(target),
                wrap(easing)
            ));
        })
    });

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
            const inner = easing instanceof SegmentedEasing ? easing.easing : easing;
            if (inner instanceof NormalEasing) {
                easingType = NORMAL;
                easingId = inner.id;
            } else if (easing instanceof BezierEasing) {
                easingType = BEZIER;
                bezierEasingPoints = [...easing.cp1, ...easing.cp2];
            } else if (inner instanceof TemplateEasing) {
                easingType = TEMPLATE;
                templateEasingName = inner.name;
            }
            if (!(easing instanceof BezierEasing)) {
                easingCanvas.draw(easing as any);
                if (easing instanceof SegmentedEasing) {
                    segmentBounds = [easing.left, easing.right];
                } else {
                    segmentBounds = [0.0, 1.0];
                }
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
        operationList.tryDo(() => new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            wrap(easing)
        ))
    }
    function setBezierEasing() {
        operationList.do(new Op.EventNodeEvaluatorChangeOperation(
            getStartNode(target),
            wrap(new BezierEasing([bezierEasingPoints[0], bezierEasingPoints[1]], [bezierEasingPoints[2], bezierEasingPoints[3]]))
        ))
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
                <Button onclick={() => {
                    eventsType.set("easing");
                    templateName.set(templateEasingName);
                }}>{$_("main.event.goto")}</Button>
                {/if}
                    <input type="text" value={segmentBounds.map(n => n.toFixed(6)).join(" ")} onchange={
                        (e) => {
                            const that = e.target as HTMLInputElement;
                            const arr = that.value.trim().split(/\s+/);
                            if (arr.length === 2) {
                                const bounds = (arr.map(parseFloat) as [number, number]);
                                if (bounds[0] < 0 || bounds[0] > 1 || bounds[1] < 0 || bounds[1] > 1 || isNaN(bounds[0]) || isNaN(bounds[1])) {
                                    return;
                                }
                                let newEasing: Easing;
                                try {
                                    newEasing = EasingCanvas.getNewEasing((values.evaluator as EasedEvaluator<any>).easing, ...bounds);
                                } catch (e) {
                                    return void notify((e as Error).message, "error")
                                }
                                operationList.do(new Op.EventNodeEvaluatorChangeOperation(
                                    getStartNode(target),
                                    wrap(newEasing)
                                ))
                            } else {
                                return;
                            }
                        }
                    }/>
                    <canvas style:display={option === BEZIER ? 'none' : '' } bind:this={canvas} width="300" height="600"></canvas>
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
