<script lang="ts">
    let {
        onclick,
        text
    }: {
        onclick: (event: MouseEvent) => void,
        text: string
    } = $props()
</script>

<button onclick={onclick}>{text}</button>

<style lang="less" scoped>
    @import "#/components/mixin.less";
    button {
        background-color: red;
        color: white;
        font-size: 2.5vh;
        .wide-button;
    }
</style>