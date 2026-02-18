<script lang="ts">
    import SwitchButton from "./SwitchButton.svelte";
    let {
        offImgSrc,
        onImgSrc,
        onchange: onChange,
        checked = $bindable(false)
    }: {
        offImgSrc: string;
        onImgSrc: string;
        onchange?: (checked: boolean) => void;
        checked?: boolean;
    } = $props();
</script>

<SwitchButton bind:checked onchange={onChange}>
    {#snippet content(on)}
        {#if on}
            <img src={onImgSrc} alt="Switch On" style="">
        {:else}
            <img src={offImgSrc} alt="Switch Off" style="">
        {/if}
    {/snippet}
</SwitchButton>

<style>
    img {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
</style>