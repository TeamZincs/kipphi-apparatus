<script module lang="ts">

    let code: string = $state("");
</script>

<script lang="ts">
    import { _ } from "#/i18n";
    import Label from "#/components/Label.svelte";
    import PopupOption from "#/components/PopupOption/PopupOption.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import ProgressiveButton from "#/components/buttons/ProgressiveButton.svelte";
    import { operationList } from "./store.svelte";
    import { EventStartNode, EventEndNode, NodeType, TC, Op } from "kipphi";

let {
    target
}: {
    target: Set<EventStartNode<any>>
} = $props();

type StartEndOption = "start" | "end" | "back-to-back" | "face-to-face";
type PropOption = "value" | "time";

let startEndOption: StartEndOption = $state("start");
let propOption: PropOption = $state("value");

let size = $derived(target.size);
let sequenceIDs = $derived(() => {
    const ids = new Set<string>();
    for (const node of target) {
        if (!node.parentSeq) {
            target.delete(node);
            continue;
        }
        ids.add(node.parentSeq.id);
    }
    return Array.from(ids).join(", ");
});

const snippets: Record<string, string> = {
    blank: "",
    "fillCurve": `fillCurve(
    node,
    easeInOutQuad,
    [[0, 0, 1], 114],
    [[1, 0, 1], 514]
)`,
    help: `
// 多节点编辑器帮助文档
// 您需要在代码文本框中输入 JavaScript 表达式，然后点击执行。
// 该表达式将在一个函数中运行，该函数接收两个参数：
// 'node' 当前节点, 'val' 该节点的原始值
// 例如，如果您正在编辑多个节点，在属性下拉框中选择值，
// 在代码框中输入 val + 100，然后点击执行，所有节点的值将增加 100。
// 如果您正在编辑多个节点，
// 您可以选择四种模式：起始、结束、背靠背、面对面。
`
};

let snippetKeys = Object.keys(snippets);
let selectedSnippet = $state("blank");

function getSortedNodes(): (EventStartNode<any> | EventEndNode<any>)[] {
    let sortedNodes: (EventStartNode | EventEndNode)[] = [...target].sort((a, b) =>
        TC.gt(a.time, b.time) ? 1 : -1
    );

    if (startEndOption === "end") {
        sortedNodes = sortedNodes.map(n => n.next).filter(n => n.type === NodeType.MIDDLE);
    } else if (startEndOption === "back-to-back") {
        const nodes = [];
        const len = sortedNodes.length;
        if (len > 0) {
            const node = sortedNodes[0];
            const end = node.previous;
            if (end.type !== NodeType.HEAD) {
                nodes.push(end);
            }
            nodes.push(node);
        }
        for (let i = 1; i < len; i++) {
            const node = sortedNodes[i];
            const end = node.previous;
            nodes.push(end);
            nodes.push(node);
        }
        sortedNodes = nodes.filter(n => n.type !== NodeType.HEAD);
    } else if (startEndOption === "face-to-face") {
        const nodes = [];
        const len = sortedNodes.length;
        for (let i = 0; i < len - 1; i++) {
            const node = sortedNodes[i];
            const end = node.next;
            nodes.push(node);
            nodes.push(end);
        }
        const node = sortedNodes[len - 1];
        const end = node.next;
        nodes.push(node);
        if (end.type !== NodeType.TAIL) {
            nodes.push(end);
        }
        sortedNodes = nodes.filter(n => n.type !== NodeType.TAIL);
    }

    return sortedNodes;
}

function executeCode() {
    const fn = new Function("val", "node", "return " + code);
    const sortedNodes = getSortedNodes();

    const operations = sortedNodes.map((node: EventStartNode | EventEndNode) => {
        return propOption === "value"
            ? new Op.EventNodeValueChangeOperation(node, fn(node.value, node))
            : new Op.EventNodeTimeChangeOperation(node, fn(node.time, node));
    });

    operationList.do(new Op.ComplexOperation(...operations));
}

function reverseNodes() {
    const operations = [...target].map(n =>
        new Op.EventNodeValueChangeOperation(n, -n.value)
    );
    operationList.do(new Op.ComplexOperation(...operations));
}

function deleteNodes() {
    const nodes = Array.from(target);
    operationList.do(new Op.MultiNodeDeleteOperation(nodes));
}
</script>

<Label>{$_("main.multiNode.title", { values: { count: size, ids: sequenceIDs() } })}</Label>

<div class="button-row">
    <DestructiveButton onclick={deleteNodes}>{$_("main.multiNode.delete")}</DestructiveButton>
    <Button onclick={reverseNodes}>{$_("main.multiNode.reverse")}</Button>
</div>


<span>{$_("main.multiNode.each")}</span>
<PopupOption wide
    options={["start", "end", "back-to-back", "face-to-face"]}
    displayTexts={[
        $_("main.multiNode.start"),
        $_("main.multiNode.end"),
        $_("main.multiNode.backToBack"),
        $_("main.multiNode.faceToFace")
    ]}
    currentOption={startEndOption}
    onchange={(v) => startEndOption = v as StartEndOption}
/>
<div class="flex-row">
<span>.</span>
<PopupOption wide
    options={["value", "time"]}
    displayTexts={[$_("main.multiNode.value"), $_("main.multiNode.time")]}
    currentOption={propOption}
    onchange={(v) => propOption = v as PropOption}
/>
<span> = </span>
</div>

<textarea bind:value={code} placeholder="Enter JavaScript expression..."></textarea>
<ProgressiveButton onclick={executeCode}>{$_("main.multiNode.execute")}</ProgressiveButton>


<Label>{$_("main.multiNode.snippets")}</Label>
<PopupOption
    wide
    options={snippetKeys}
    displayTexts={snippetKeys}
    currentOption={selectedSnippet}
    onchange={(key) => {
        selectedSnippet = key;
        code = snippets[key];
    }}
/>

<style scoped lang="less">
    @import "#/components/mixin.less";

    .button-row {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
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
        min-height: 35vh;
        font-size: var(--font-size-small);
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
    }
</style>
