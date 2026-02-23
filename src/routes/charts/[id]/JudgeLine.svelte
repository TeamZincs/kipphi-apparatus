<script lang="ts">
import type { JudgeLine } from "kipphi";
import type { Snippet } from "svelte";
import Self from "./JudgeLine.svelte";

import { GlobalContext, operationList, SecondarySidebar } from "./store.svelte";
import { Op } from "kipphi";

let {
    level = 0,
    target,
    children,
    show = true
}: {
    level?: number;
    target: JudgeLine;
    children?: JudgeLine[];
    show?: boolean;
} = $props();

let refreshKey = $state(0);

export function update() {
    refreshKey++;
}

let childrenPalettes: Self[] = [];

const values = $derived({
    moveX: target.moveX,
    moveY: target.moveY,
    rotate: target.rotate,
    alpha: target.alpha,
    refreshKey
});

let folded = $state(false);
let root: HTMLDivElement = $state(null);

let lineName = $state(target.name);
let displays = $derived(GlobalContext.selectedLineNumber === target.id)

$effect(() => {
    if (GlobalContext.selectedLineNumber === target.id) {
        // 滚动前先检测一下，root往上找祖先，如果祖先的scrollTop为0则不平滑滚动
        let cur: HTMLElement = root;
        while (cur && !cur.matches(".judgelines-manager")) {
            cur = cur.parentElement;
        }
        root.scrollIntoView({
            behavior: cur?.scrollTop <= 20 ? "instant" : "smooth",
            block: "center",
            inline: "center"
        });
    }
});

function handleClick() {
    if (displays) { // 如果已经激活，则全局跳转到此判定线管理
        GlobalContext.activeSecondarySidebar = SecondarySidebar.LINE
    } else {
        GlobalContext.selectedLineNumber = target.id
    }
}

</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions-->
<div class="judgeline-manager"
    class:selected={displays}
    style:margin-left={level + "em"} 
    style:display={show ? "" : "none"}
    style:position={children?.length ? "sticky" : ""}
    style:z-index={children?.length ? 1 : 0}
    style:top={level * 3 + "em"}
    onclick={handleClick}
    bind:this={root}
    >
    <span class="id">{target.id}</span>
    <input class="name" bind:value={lineName} onclick={(e) => e.stopPropagation()}
        onchange={() => operationList.do(new Op.JudgeLineRenameOperation(target, lineName))}
    >
    <span>x</span><span>{values.moveX?.toFixed?.(2)}</span>
    <span>y</span><span>{values.moveY?.toFixed?.(2)}</span>
    <span class:triangle={children?.length > 0} class:folded={folded}
        onclick={(e) => {folded = !folded; e.stopPropagation()}}
        ></span>
    <span>θ</span><span>{values.rotate !== undefined ? (values.rotate * 180 / Math.PI).toFixed?.(2) : "N/A"}</span>
    <span>α</span><span>{values.alpha !== undefined ? Math.round(values.alpha).toString?.(16) + "/" + Math.round(values.alpha) : "N/A"}</span>
</div>
{#if children}
    {#each children as child, i}
        <Self
            target={child}
            children={[...child.children].sort((a, b) => a.id - b.id)}
            level={level + 1}
            bind:this={childrenPalettes[i]}
            show={!folded}
        />
    {/each}
{/if}

<style scoped lang="less">

@import '#/components/mixin.less';

.judgeline-manager {
    display: grid;
    grid-template-columns: 2.8em repeat(2, 1fr 3fr);
    grid-template-rows: auto 1fr 1fr auto;
    grid-gap: 0.1em;
    font-size: 1.4vh;
    padding: 0.5em;
    width: 100%;
    background-color: #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    top: 0;

    contain: layout;

    &.selected {
        background-color: aquamarine;
    }
}

.id {
    grid-row: 1 / 3;
    font-size: 180%;
}

.name {
    grid-column: 2 / 6;
    font-size: 150%;
}

.triangle {
    grid-row: 3 / 4;
    grid-column: 1 / 2;
    .collapsible-triangle;
}

span {
    // contain: layout;
    overflow: clip;
    width: 100%;
}

</style>