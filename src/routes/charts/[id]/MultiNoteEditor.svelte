<script module lang="ts">
import { ROKP, createFunction, fillCurve,  } from "./multi"
</script>


<script lang="ts">
    import { _ } from "#/i18n";
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import FractionInput from "#/components/Inputs/FractionInput.svelte";
    import { operationList, selectedLineNumber } from "./store.svelte";
    import { notify } from "./notify.svelte";
    import { Note, Op, TC } from "kipphi";

    let {
        target,
    }: {
        target: Set<Note>;
    } = $props();

    type PropOption =
        | "above"
        | "alpha"
        | "endTime"
        | "isFake"
        | "judgeSize"
        | "positionX"
        | "size"
        | "speed"
        | "startTime"
        | "tint"
        | "tintHitEffects"
        | "type"
        | "visibleBeats"
        | "yOffset";

    let propOption: PropOption = $state("positionX");
    let code: string = $state("");
    let selectedSnippet = $state("blank");

    let size = $derived(target.size);
    let judgeLineCount = $derived(() => {
        const lines = new Set(
            [...target].map((n) => n.parentNode.parentSeq.parentLine),
        );
        return lines.size;
    });

    let fillWarning = $derived(() => {
        if (judgeLineCount() > 1) {
            return $_("main.multiNote.warning-different-lines");
        }
        return "";
    });

    const helpSnippets: Record<string, string> = {
        blank: "",
        fillCurve: `fillCurve(
    note,
    easeInOutQuad,
    [[0, 0, 1], 114],
    [[1, 0, 1], 514]
)`,
        help: `
// 多音符编辑帮助文档
// 您需要在代码文本框中输入 JavaScript 表达式，然后点击执行。
// 该表达式将在一个函数中运行，该函数接收两个参数：
// 'note' 当前音符, 'val' 该音符的原始值
// 例如，如果您正在编辑多个音符，在属性下拉框中选择 positionX，
// 在代码框中输入 val + 100，然后点击执行，所有音符的 positionX 将增加 100。
// 支持使用 fillCurve 函数进行曲线插值。
// 可用的缓动函数: linear, easeIn/Out/InOutSine, easeIn/Out/InOutQuad, easeIn/Out/InOutCubic, easeIn/Out/InOutQuart, easeIn/Out/InOutQuint, easeIn/Out/InOutExpo, easeIn/Out/InOutCirc, easeIn/Out/InOutBack, easeIn/Out/InOutElastic, easeIn/Out/InOutBounce
`,
    };

    let fillDensity = $state<[number, number, number]>([0, 1, 4]);

    function getSortedNotes(): Note[] {
        return [...target].sort((a, b) =>
            TC.gt(a.startTime, b.startTime) ? 1 : -1,
        );
    }

    function generateOperation(note: Note, fn: (val: any, note: Note) => any) {
        const fnMap = {
            above: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "above",
                    fn(note.above, note),
                ),
            alpha: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "alpha",
                    fn(note.alpha, note),
                ),
            endTime: () =>
                new Op.HoldEndTimeChangeOperation(note, fn(note.endTime, note)),
            isFake: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "isFake",
                    fn(note.isFake, note),
                ),
            judgeSize: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "judgeSize",
                    fn(note.judgeSize, note),
                ),
            positionX: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "positionX",
                    fn(note.positionX, note),
                ),
            size: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "size",
                    fn(note.size, note),
                ),
            speed: () =>
                new Op.NoteSpeedChangeOperation(
                    note,
                    fn(note.speed, note),
                    note.parentNode.parentSeq.parentLine,
                ),
            startTime: () =>
                new Op.NoteTimeChangeOperation(
                    note,
                    note.parentNode.parentSeq.getNodeOf(
                        fn(note.startTime, note),
                    ),
                ),
            tint: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "tint",
                    fn(note.tint, note),
                ),
            type: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "type",
                    fn(note.type, note),
                ),
            visibleBeats: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "visibleBeats",
                    fn(note.visibleBeats, note),
                ),
            yOffset: () =>
                new Op.NoteYOffsetChangeOperation(
                    note,
                    fn(note.yOffset, note),
                    note.parentNode.parentSeq.parentLine,
                ),
            tintHitEffects: () =>
                new Op.NotePropChangeOperation(
                    note,
                    "tintHitEffects",
                    fn(note.tintHitEffects, note),
                ),
        } satisfies Record<PropOption, () => any>;

        return fnMap[propOption]();
    }


    

    function executeCode() {
        const fn = createFunction(code, "note");
        const sortedNotes = getSortedNotes();

        const operations = sortedNotes
            .map((note) => {
                try {
                    return generateOperation(note, fn);
                } catch (e) {
                    console.error(e);
                    notify((e as Error).message, "error");
                    return null;
                }
            })
            .filter((op): op is any => op !== null);

        operationList.do(new Op.ComplexOperation(...operations));
    }

    function fillNotes() {
        const step = fillDensity;
        try {
            TC.validateIp(step);
        } catch (e) {
            notify((e as Error).message, "error");
            return;
        }
        if (TC.toBeats(step) <= 0) {
            notify("Step must be positive", "warning");
            return;
        }

        const sortedNotes = getSortedNotes();
        const toBeAdded: Note[] = [];

        const fill = (note1: Note, note2: Note) => {
            const startTime = note1.startTime;
            const endTime = note2.startTime;
            const delta = TC.validateIp(TC.sub(endTime, startTime));
            const positionDelta = note2.positionX - note1.positionX;

            for (
                let offset = step;
                TC.lt(offset, delta);
                offset = TC.validateIp(TC.add(offset, step))
            ) {
                const note = note1.clone(offset);
                note.positionX =
                    (TC.toBeats(offset) / TC.toBeats(delta)) * positionDelta +
                    note1.positionX;
                toBeAdded.push(note);
            }
        };

        const len = sortedNotes.length;
        for (let i = 0; i < len - 1; i++) {
            const note1 = sortedNotes[i];
            const note2 = sortedNotes[i + 1];
            fill(note1, note2);
        }

        const judgeLine = operationList.chart.judgeLines[$selectedLineNumber];
        operationList.do(new Op.MultiNoteAddOperation(toBeAdded, judgeLine));
    }

    function reverseNotes() {
        const operations = [...target].map(
            (n) => new Op.NotePropChangeOperation(n, "positionX", -n.positionX),
        );
        operationList.do(new Op.ComplexOperation(...operations));
    }

    function deleteNotes() {
        operationList.do(new Op.MultiNoteDeleteOperation(target));
    }

</script>

<Label
    >{$_("main.multiNote.title", {
        values: { count: size, lines: judgeLineCount() },
    })}</Label
>
{#if fillWarning()}
    <span style:color="yellow">{fillWarning()}</span>
{/if}

<div class="button-row">
    <DestructiveButton onclick={deleteNotes}
        >{$_("main.multiNote.delete")}</DestructiveButton
    >
    <Button onclick={reverseNotes}>{$_("main.multiNote.reverse")}</Button>
</div>

<span>{$_("main.multiNote.eachNote")} .</span>
<PopupOption
    wide
    options={[
        "above",
        "alpha",
        "endTime",
        "isFake",
        "judgeSize",
        "positionX",
        "size",
        "speed",
        "startTime",
        "tint",
        "tintHitEffects",
        "type",
        "visibleBeats",
        "yOffset",
    ]}
    displayTexts={[
        "above",
        "alpha",
        "endTime",
        "isFake",
        "judgeSize",
        "positionX",
        "size",
        "speed",
        "startTime",
        "tint",
        "tintHitEffects",
        "type",
        "visibleBeats",
        "yOffset",
    ]}
    currentOption={propOption}
    onchange={(v) => (propOption = v as PropOption)}
/>

<span> = </span>

<div class="code-section">
    <textarea bind:value={code} placeholder="Enter JavaScript expression..."
    ></textarea>
    <ProgressiveButton onclick={executeCode}
        >{$_("main.multiNote.execute")}</ProgressiveButton
    >
</div>

<Label>{$_("main.multiNote.snippets")}</Label>
<PopupOption
    wide
    options={Object.keys(helpSnippets)}
    displayTexts={Object.keys(helpSnippets)}
    currentOption={selectedSnippet}
    onchange={(key) => {
        selectedSnippet = key;
        code = helpSnippets[key];
    }}
/>

<div class="fill-section">
    <Label>{$_("main.multiNote.fillEachNeighbors")}</Label>
    <div class="flex-row">
        <FractionInput bind:value={fillDensity}></FractionInput>
        <ProgressiveButton onclick={fillNotes}
            >{$_("main.multiNote.fill")}</ProgressiveButton
        >
    </div>
</div>

<style scoped lang="less">
    @import "#/components/mixin.less";

    .button-row {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
    }

    .code-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    }

    .fill-section {
        margin-top: 8px;
        width: 100%;
    }

    span {
        color: var(--color-foreground);
        font-size: var(--font-size-medium);
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 4px;
        align-items: center;
    }

    textarea {
        .input();
        flex: 1;
        min-height: 25vh;
        font-size: var(--font-size-small);
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
    }
</style>
