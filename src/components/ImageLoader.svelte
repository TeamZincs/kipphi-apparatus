<script lang="ts">
    import { loadChartImage } from "#/background";
    import { onMount } from "svelte";
    
    let {
        /** 直接传入 Blob（优先级高） */
        blob,
        /** 谱面 ID（blob 为空时使用） */
        chartId,
        /** 图片文件名（blob 为空时使用） */
        filename,
        alt,
        style,
    }: {
        blob?: Blob;
        chartId?: string;
        filename?: string;
        alt: string;
        style?: string;
    } = $props();
    
    let generatedSrc: string = $state("");

    onMount(async () => {
        let imageBlob: Blob | null = null;
        
        if (blob) {
            imageBlob = blob;
        } else if (chartId && filename) {
            const u8 = await loadChartImage(chartId, filename);
            const ext = filename.split(".").pop().toLowerCase();
            const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
            imageBlob = new Blob([u8], { type: mimeType });
        }
        
        if (imageBlob) {
            generatedSrc = URL.createObjectURL(imageBlob);
        }
    });
</script>
<img src={generatedSrc} alt={alt} style={style}>