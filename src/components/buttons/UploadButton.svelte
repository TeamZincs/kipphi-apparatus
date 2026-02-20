<script lang="ts">
    import Button from "./Button.svelte";
    import { _ } from "#/i18n";


    let {
        onchange,
        file = $bindable()
    }: {
        onchange: (file: File) => void,
        file: File
    } = $props();
    $effect(() => {
        if (file === null) {
            fileInput.value = "";
        }
    })

    // 用于上传贴图
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", () => {
        file = fileInput.files[0];
        if (!file) {
            fileName = $_("main.judgeline.select");
            return;
        }
        fileName = file.name;
        onchange(file);
    });
    let fileName = $state($_("main.judgeline.select"))
</script>

<Button onclick={() => {
    fileInput.click();
}}>{fileName}</Button>