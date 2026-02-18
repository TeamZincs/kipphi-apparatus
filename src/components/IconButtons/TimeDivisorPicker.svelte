<script lang="ts">
    import NumberSelect from "../NumberSelect.svelte";
    import SwitchButton from "./SwitchButton.svelte";

let value = $state(4);
</script>

<SwitchButton>
    {#snippet content(on)}
        {#if on}
        <NumberSelect
            min={1}
            max={64}
            step={1}
            bind:value
            onchange={() => {}}
            class="{on ? 'time-divisor-picker-on' : ''}"
        />
        {/if}
        <span>{value}</span>
    {/snippet}
</SwitchButton>