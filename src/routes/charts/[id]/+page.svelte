<script lang="ts">
    import { Player, AudioProcessor, Images } from "kipphi-player";
    import type { PageData } from "./$types";
    import { onMount, tick } from "svelte";
    let {
        data
    }: {data: PageData} = $props();

    const audio = new Audio(URL.createObjectURL(data.music));
    audio.addEventListener("timeupdate", () => {
        if (!player.playing) {
            return;
        }
        progressBar.value = audio.currentTime;

    })
    // 这里启用了实验性功能，随时都有可能出现破坏性更改，如果出现，需要修改此处
    const illustration = await createImageBitmap(data.illustration);
    const audioProcessor = new AudioProcessor();
    await audioProcessor.init({
        tap: data.tap,
        drag: data.drag,
        flick: data.flick,
    });
    console.log(audioProcessor.tap)

    await Images.loadAndOptimize({
        tap: data.tapImg,
        drag: data.dragImg,
        flick: data.flickImg,
        anchor: data.anchorImg,
        chord: data.chordImg,
        holdHead: data.holdHeadImg,
        holdBody: data.holdBodyImg,
        below: data.belowImg,
        hitFx: data.hitFxImg
    });


    // @ts-expect-error 仅供调试
    window.Images = Images;
    // @ts-expect-error 仅供调试
    window.audioProcessor = audioProcessor;

    let playerCanvas: HTMLCanvasElement;
    let player: Player;
    let progressBar: HTMLInputElement;
    onMount(async () => {
        await tick();
        playerCanvas.addEventListener("click", () => {
            player.play();
        })
        player = new Player(
            playerCanvas,
            audioProcessor,
            audio,
            illustration
        );
        player.showsRenderingBaseline = true;
        player.renderingOffset = -0.40;
        // @ts-expect-error 仅供调试
        window.player = player;
        player.receive(data.chart, () => void 0);
        // 释放内存
        data.chart = null;
    });



</script>

<main class="container">
    <canvas bind:this={playerCanvas} id="player">Your device does not support the HTML5 canvas element.</canvas>
    <input type="range" bind:this={progressBar} value={audio.currentTime} step="0.01" max={data.chart.duration} onchange={
        (event) => {
            audio.currentTime = progressBar.valueAsNumber;
            player.pause();
            requestAnimationFrame(() => player.render())
        }
    } onmousedown={() => player.pause()}>
</main>

<style>
    .container {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows: auto 1fr;
        width: 100%;
    }
    #player {
        height: 90vh;
        grid-column: 2 / 3;
    }
    input {
        grid-row: 2 / 3;
        grid-column: 1 / 4;
    }
</style>