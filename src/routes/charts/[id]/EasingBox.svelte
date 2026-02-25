<script lang="ts">
    import { easingArray, easingMap, rpeEasingArray } from "kipphi";
    import { GlobalContext } from "./store.svelte";
    import { untrack } from "svelte";
    import { KPASettings } from "#/settings.svelte";


    let { value = $bindable(1) }: { value: number } = $props();
    let easingId = $state(value);
    let easeType: "in" | "out" | "inout" = $state("in");
    let funcType: keyof typeof easingMap = $state("linear");
    $effect(() => {
        let newEasingId;
        if (KPASettings.useRpeEasingId) {
            const easing = easingArray[value];
            if (!easing) {
                return;
            }
            newEasingId = easing.rpeId;
        } else {
            newEasingId = value;
        }
        if (newEasingId !== untrack(() => easingId)) {
            easingId = newEasingId;
        }
    });
    $effect(() => {
        const easing = easingArray[value];
        easeType = easing.easeType as "in" | "out" | "inout";
        funcType = easing.funcType as keyof typeof easingMap;
    });
</script>

<div class="easing-box">
    <input type="number" min="0" max={KPASettings.useRpeEasingId ? 29 : 31} step="1" bind:value={easingId} onchange={
        () => {
            value = KPASettings.useRpeEasingId ? rpeEasingArray[easingId].id : easingId
        }
    }>
    <span>Ease</span>
    <select bind:value={easeType} onchange={
        () => {
            value = easingMap[funcType][easeType].id
        }
    }>
        <option value="in">in</option>
        <option value="out">out</option>
        <option value="inout">IO</option>
    </select>
    <select bind:value={funcType} onchange={
        () => {
            value = easingMap[funcType][easeType].id
        }
    }>
        {#each Object.keys(easingMap) as funType}
            <option value={funType}>{funType}</option>
        {/each}
    </select>
</div>

<style lang="less" scoped>
    @import "#/components/mixin.less";
    input {
        .input();
        min-width: 0;
        font-size: var(--font-size-small);
    }
    select {
        .input();
        font-size: var(--font-size-small);
    }
    .easing-box {
        box-sizing: border-box;
        display: grid;
        width: 100%;

        grid-template-rows: 3vh 3vh;
        grid-template-columns: 1fr 1fr;
        gap: 0.5vh;
        span {
            color: white;
        }
    }
</style>