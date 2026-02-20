<script lang="ts">
    let { small, title }: { small?: boolean, title?: string } = $props();
</script>


<span class:small={small} {title}><slot/></span>

<style scoped lang="less">
span {
    color: white;
    font-size: var(--font-size-medium);
    font-weight: bold;
    &.small {
        font-weight: normal;
        font-size: var(--font-size-small);
    }
}
</style>