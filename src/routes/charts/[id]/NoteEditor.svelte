<script lang="ts">
import Label from "#/components/Label.svelte";
import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import { NoteNode, NoteType, Op, type Note } from "kipphi";
    import { GlobalContext, operationList } from "./store.svelte";
    import { _ } from "#/i18n";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import ArrowedInput from "#/components/Inputs/ArrowedInput.svelte";
    import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import ColorInput from "#/components/Inputs/ColorInput.svelte";

let {
    target
}: {
    target: Note
} = $props();

let values: {
    parentNode: NoteNode;
    type: NoteType;
    startTime: [number, number, number];
    endTime: [number, number, number];
    positionX: number;
    speed: number;
    above: boolean;
    isFake: boolean;
    alpha: number;
    yOffset: number;
    size: number;
    visibleBeats: number;
    judgeSize: number;
    tint: number;
    tintHitEffects: number;
} = $state(target ? {
    parentNode: target.parentNode,

    type: target.type,
    startTime: target.startTime,
    endTime: target.endTime,
    positionX: target.positionX,
    speed: target.speed,
    above: target.above,
    isFake: target.isFake,
    alpha: target.alpha,
    yOffset: target.yOffset,
    size: target.size,
    visibleBeats: target.visibleBeats,
    judgeSize: target.judgeSize,
    tint: target.tint,
    tintHitEffects: target.tintHitEffects,

} : null);

$effect(() => { // 如果用derived的话，响应式变量会是不可写的，所以得这么写才行
    values = {
        parentNode: target.parentNode,

        type: target.type,
        startTime: target.startTime,
        endTime: target.endTime,
        positionX: target.positionX,
        speed: target.speed,
        above: target.above,
        isFake: target.isFake,
        alpha: target.alpha,
        yOffset: target.yOffset,
        size: target.size,
        visibleBeats: target.visibleBeats,
        judgeSize: target.judgeSize,
        tint: target.tint,
        tintHitEffects: target.tintHitEffects,

    }
})

let parentSeq = $derived(values.parentNode?.parentSeq)
let parentLine = $derived(parentSeq?.parentLine)

console.log(operationList)

operationList.addEventListener("needsupdate", (opev) => {
    const operation = opev.operation;
    const clazz = operation.constructor;
    let op;
    switch (clazz) {
        case Op.NoteTypeChangeOperation:
        case Op.NotePropChangeOperation:
        case Op.HoldEndTimeChangeOperation:
        case Op.NoteTimeChangeOperation:
        case Op.NoteYOffsetChangeOperation:
        case Op.NoteSpeedChangeOperation:
            op = operation as
            (Op.NoteTypeChangeOperation | Op.NotePropChangeOperation<any> | Op.HoldEndTimeChangeOperation
            | Op.NoteTimeChangeOperation | Op.NoteYOffsetChangeOperation | Op.NoteSpeedChangeOperation);
            console.log("op")
            if (op.note !== target) { return; }
            break;
        default:
            values.parentNode = target.parentNode;
            return;
    }
    switch (clazz) {
        case Op.NoteTypeChangeOperation:
            values.type = target.type;
            break;
        case Op.NotePropChangeOperation:
            op = op as Op.NotePropChangeOperation<Op.NotePropName>;
            // @ts-expect-error
            values[op.field] = target[op.field];
            break;
        case Op.NoteTimeChangeOperation:
            values.startTime = target.startTime;
            values.endTime = target.endTime;
            break;
        case Op.HoldEndTimeChangeOperation:
            values.endTime = target.endTime;
            break;
        case Op.NoteYOffsetChangeOperation:
            values.yOffset = target.yOffset;
            break;
        case Op.NoteSpeedChangeOperation:
            values.speed = target.speed;
            break;
    }
});

</script>

<Label>Note (from #{values.parentNode.parentSeq.parentLine.id}.{values.parentNode.parentSeq.id})</Label>
{#if !values.parentNode}
<span style:color="red">{
    $_("main.note.warning-lone-note")
}</span>
{:else if parentLine.id !== GlobalContext.selectedLineNumber}
<span style:color="yellow">{
    $_("main.note.warning-not-from-selected-line", { values: { line: GlobalContext.selectedLineNumber }})
}</span>
{/if}
<Label small>{$_("main.note.type")}</Label>
<PopupOption wide
    options={[NoteType.tap, NoteType.drag, NoteType.flick, NoteType.hold]}
    displayTexts={["tap", "drag", "flick", "hold"]}
    bind:currentOption={
        () => values.type,
        (v) => operationList.do(new Op.NoteTypeChangeOperation(target, v))
        }
/>
<Label small>{$_("main.note.time")}</Label>
<div class="time-input">
    <FractionInput
        bind:value={
            () => values.startTime,
            (v) => {
                const node = target.parentNode.parentSeq.getNodeOf(v);
                operationList.do(new Op.NoteTimeChangeOperation(target, node));
            }
        }
    ></FractionInput>
    <span>~</span>
    <FractionInput
        disabled={values.type !== NoteType.hold}
        bind:value={
            () => values.endTime,
            (v) => operationList.do(new Op.HoldEndTimeChangeOperation(target, v))
        }
    ></FractionInput>
</div>
<div class="grid">
<Label small>{$_("main.note.positionX")}</Label>
<UnitInput
    bind:value={
        () => values.positionX,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "positionX", v))
    }
>
{#snippet unit()}
    <abbr title={$_("general.pixel")}>px</abbr>
{/snippet}
</UnitInput>
<Label small>{$_("main.note.direction")}</Label>
<TextSwitchButton wide
    onText={$_("main.note.above")}
    offText={$_("main.note.below")}
    bind:checked={
        () => values.above,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "above", v))
    }
></TextSwitchButton>
<Label small>{$_("main.note.speed")}</Label>
<UnitInput
    bind:value={
        () => values.speed,
        (v) => operationList.do(new Op.NoteSpeedChangeOperation(
            target,
            v,
            target.parentNode.parentSeq.parentLine
        ))
    }
    unit="x"
></UnitInput>
<Label small>{$_("main.note.real")}</Label>
<TextSwitchButton wide
    onText="Y"
    offText="N"
    bind:checked={
        () => !values.isFake,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "isFake", !v))
    }
></TextSwitchButton>
<Label small>{$_("main.note.alpha")}</Label>
<ArrowedInput max={255} min={0}
    bind:value={
        () => values.alpha ?? 255,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "alpha", v))
    }
    suffix={values.alpha?.toString(16)}
></ArrowedInput>
<Label small>{$_("main.note.absoluteYOffset")}</Label>
<UnitInput
    bind:value={
        () => values.yOffset,
        (v) => operationList.do(new Op.NoteYOffsetChangeOperation(target, v, target.parentNode.parentSeq.parentLine))
    }
    unit="px"
></UnitInput>
<Label small>{$_("main.note.visibleBeats")}</Label>
<ArrowedInput step={1 / GlobalContext.timeDivisor}
    bind:value={
        () => values.visibleBeats,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "visibleBeats", v))
    }
></ArrowedInput>
<Label small>{$_("main.note.size")}</Label>
<UnitInput
    bind:value={
        () => values.size,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "size", v))
    }
    unit="x"
></UnitInput>
<Label small>{$_("main.note.judgeSize")}</Label>
<UnitInput
    bind:value={
        () => values.judgeSize,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "judgeSize", v))
    }
    unit="x"
></UnitInput>
<Label small>{$_("main.note.tint")}</Label>
<ColorInput
    bind:value={
        () => values.tint ?? 0xffffff,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "tint", v))
    }
></ColorInput>
<Label small>{$_("main.note.tintHitEffect")}</Label>
<ColorInput
    bind:value={
        () => values.tintHitEffects ?? 0xffffff,
        (v) => operationList.do(new Op.NotePropChangeOperation(target, "tintHitEffects", v))
    }
></ColorInput>
</div>

<style scoped lang="less">
    .time-input {
        display: flex;
        flex-direction: row;
        gap: 4px;
        align-content: center;
        justify-content: center;
        span {
            margin: auto 0;
            color: white;
        }
    }
    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px;
        box-sizing: border-box;
    }
</style>