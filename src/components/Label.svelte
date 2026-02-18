<script lang="ts">
    let { small, title }: { small?: boolean, title?: string } = $props();
</script>


<span class:small={small} {title}><slot/></span>

<style scoped lang="less">
span {
    color: white;
    font-size: 2.5vh;
    &.small {
        font-size: 2vh;
    }
}
</style>