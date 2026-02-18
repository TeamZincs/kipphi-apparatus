<script lang="ts">
    import IconSwitchButton from "./IconSwitchButton.svelte";
    let { onchange, checked = $bindable(false) }: { onchange?: (checked: boolean) => void; checked?: boolean } = $props();
</script>
<IconSwitchButton onImgSrc="/icons/pause.svg" offImgSrc="/icons/play.svg" onchange={onchange} checked={checked} />
