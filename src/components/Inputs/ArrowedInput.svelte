<script lang="ts">

let {
    value = $bindable(),
    label, title, max, min, suffix, loops, step = 1
}: {
    value: number,
    label?: string,
    title?: string,
    max?: number,
    min?: number,
    suffix?: string,
    loops?: boolean,
    step?: number
} = $props();

let val = $state(value);
$effect(() => {
    if (val !== value) {
        val = value;
    }
})

function check() {
    if (max !== undefined && val > max) value = loops ? min : max;
    else if (min !== undefined && val < min) value = loops ? max : min
    else value = val;
}

function len(str: string) {
    return str.replace(/[^\x00-\xff]/g, "mm").length / 2;
}

</script>

<div class="arrowed-input" class:has-suffix={!!suffix}>
    <input type="number" step={step} bind:value={val} onchange={check}>
    <span class="up" onclick={() => {val += step; check()}}>↑</span>
    <span class="down" onclick={() => {val -= step; check();}}>↓</span>
    {#if suffix}
        <span class="suffix" style={`font-size:${Math.min(5 / len(suffix), 2)}em; line-height: 2em`}>{suffix}</span>
    {/if}
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

div.arrowed-input {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr auto;
    position: relative;
    margin-inline: auto;
    font-size: var(--font-size-medium);
    gap: 2px;
}




input {
    .input;
    font-size: var(--font-size-medium);
    min-width: 3em;
    grid-row: 1 / 3;
    border-radius: 4px;
}

.suffix {
    position: absolute;
    right: 3vh;
    bottom: 0;
    color: #888;
    pointer-events: none;
    user-select: none;
}


span {
    text-align: center;
    cursor: pointer;
}

.up, .down {
    background-color: white;
    color: black;
    border-radius: 2px;
    font-size: var(--font-size-smaller);
}
</style>