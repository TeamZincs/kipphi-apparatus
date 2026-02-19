<script lang="ts">
    import SwitchButton from "./SwitchButton.svelte";

    
    let {
        bgText,
        onText,
        offText,
        wide,
        "class": className = "",
        checked = $bindable(false),
        disabled = false,
        onchange: onChange
    }: {
        bgText?: string;
        onText: string;
        offText: string;
        wide?: boolean;
        "class"?: string;
        checked?: boolean;
        disabled?: boolean;
        onchange?: (checked: boolean) => void;
    } = $props();

function len(str: string) {
    return str.replace(/[^\x00-\xff]/g, "mm").length / 2;
}

function getFontSize(str: string) {
    return !wide ? 5 / str.length + "vh" : "2.5vh"
}

</script>

<SwitchButton wide={wide} primary class={className} disabled={disabled} bind:checked onchange={onChange}>
    {#snippet content(on)}
        
        {#if bgText}<div class="bg" style:font-size={getFontSize(bgText)}>{bgText}</div>{/if}
        <div class="bigText"
            style:color={on ? "#4c8" : "#f32"}
            style:font-size={getFontSize(on ? onText : offText)}>{on ? onText : offText}</div>
    {/snippet}
</SwitchButton>

<style>
    .bg {
        width: 100%;
        height: 100%;
        position: relative;
        color: #888;
        align-content: center;
        text-align: center;
        font-size: 5vh;
    }
    .bigText {
        position: absolute;
        font-size: 5vh;
        font-weight: bold;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        align-content: center;
        text-align: center;
        /* text-shadow: 1px 1px 2px #222; */
    }
</style>