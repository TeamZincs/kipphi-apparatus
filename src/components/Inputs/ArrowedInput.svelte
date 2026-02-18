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

function check() {
    if (max !== undefined && value > max) value = loops ? min : max;
    if (min !== undefined && value < min) value = loops ? max : min;
}

function len(str: string) {
    return str.replace(/[^\x00-\xff]/g, "mm").length / 2;
}

</script>

<div class="arrowed-input" class:labeled={!!label} class:has-suffix={!!suffix}>
    {#if label}
        <span class="label" title={title}>{label}</span>
    {/if}
    <input type="number" step={step} bind:value onchange={check}>
    <span class="up" onclick={() => {value += step; check()}}>↑</span>
    <span class="down" onclick={() => {value -= step; check();}}>↓</span>
    {#if suffix}
        <span class="suffix" style={`font-size:${Math.min(5 / len(suffix), 2)}em; line-height:${3 / Math.min(5 / len(suffix), 2)}em`}>{suffix}</span>
    {/if}
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

div.arrowed-input {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr auto;
    font-size: 1.8vh;
    position: relative;
    margin-inline: auto;
}

div.labeled {
    grid-template-rows: auto 1fr 1fr;
}

div.labeled input {
    grid-row: 2 / 4;
}

div.labeled span.label {
    grid-column: 1 / 3;
    color: white;
    font-size: 120%;
}

input {
    .input;
    font-size: 1.6em;
    min-width: 3em;
    grid-row: 1 / 3;
    border-radius: 4px;
}

.suffix {
    position: absolute;
    right: 3vh;
    bottom: 0;
    font-size: 2em;
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
}
</style>