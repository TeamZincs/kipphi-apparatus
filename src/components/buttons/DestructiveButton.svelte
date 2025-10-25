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

<style>
    button {
        font-size: 4vh;
        background-color: red;
        color: white;
        border-radius: 5px;
        padding: 0.35em 0.5em;
        font-size: 100%;
    }
</style>