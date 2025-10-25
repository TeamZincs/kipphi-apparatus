<script lang="ts">
    import { resolve } from "@tauri-apps/api/path";
    import { readFile } from "@tauri-apps/plugin-fs";
    import { onMount } from "svelte";
    let {src, alt, style}: {src: string | Blob, alt: string, style?: string} = $props();
    let generatedSrc: string = $state("");

    onMount(async () => {
        let blob: Blob;
        if (typeof src === "string") {
            
            const path = await resolve(src);
            const file = await readFile(path, {});
            blob = new Blob([file], {type: "image/" + src.split(".").pop()});
        } else {
            blob = src;
        }
        generatedSrc = URL.createObjectURL(blob);
    });

</script>
<img src={generatedSrc} alt={alt} style={style}>