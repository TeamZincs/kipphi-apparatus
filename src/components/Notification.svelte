<script lang="ts">
    import { onMount, tick } from "svelte";

    let { message = '', type = 'info', unmount }: {
        message: string,
        type: 'info' | 'error' | 'warning',
        unmount: () => void
    } = $props();
    let fadeIn = $state(false);
    onMount(async () => {
        await tick();
        await tick();
        setTimeout(() => fadeIn = true, 100);
        setTimeout(() => {
            fadeIn = false;
            setTimeout(() => {
                unmount();
            }, 1000);
        }, 5000);
    })
</script>
<div class={"notification " + type} class:fade-in={fadeIn}>
    {message}
</div>

<style lang="less">
    @height: 8vh;
    @width: 30vw;
    @left: -35vw;
    @top: 101vh;
    @vertical-span: 10vh;
    @normal-top: 5vh;
    @normal-left: 30vw;
    @basic-transY: @normal-top - @top;
    @basic-transX: -@left + @normal-top;
    .notification {
        position: fixed;
        height: @height;
        width: @width;
        left: @left;
        top: @top;
        transition: 0.7s ease-out transform;
        transform: translate(0, 0);
        background-color: white;
        color: black;
        border-left: var(--border-radius) solid;
        border-radius: var(--border-radius);
        padding: var(--border-radius);
        font-size: var(--font-size-medium);
        box-shadow: var(--box-shadow);
        &:first-child {
            transform: translateY(@basic-transY);
        }
        &:nth-child(2) {
            transform: translateY(@basic-transY + @vertical-span);
        }
        &:nth-child(3) {
            transform: translateY(@basic-transY + 2 * @vertical-span);
        }
        &.fade-in:first-child {
            transform: translate(@basic-transX, @basic-transY);
        }
        &.fade-in:nth-child(2) {
            transform: translate(@basic-transX, @basic-transY + @vertical-span);
        }
        &.fade-in:nth-child(3) {
            transform: translate(@basic-transX, @basic-transY + 2 * @vertical-span);
        }
        &.fade-in {
            transform: translateX(@basic-transX);
        }
        &.info {
            border-left-color: blue;
        }
        &.error {
            border-left-color: red;
        }
        &.warning {
            border-left-color: orange;
        }
    }
</style>