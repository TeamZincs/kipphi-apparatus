<script lang="ts">
import { Player, AudioProcessor, Images } from "kipphi-player";
import { EventSequenceEditors, NotesEditor, NotesEditorState } from "kipphi-canvas-editor";
import type { PageData } from "./$types";
import { onMount, tick, onDestroy } from "svelte";
import { Chart, EventType, Op as O, type ExtendedEventTypeName } from "kipphi";

import { _ } from "#/i18n";

import AutoSaveRunner from "./autosaveRunner";

import PlayButton from "#/components/IconButtons/PlayButton.svelte";
import GridSwitch from "#/components/IconButtons/GridSwitch.svelte";
import PopupOption from "#/components/PopupOption/PopupOption.svelte";
import TimeDivisorPicker from "#/components/IconButtons/TimeDivisorPicker.svelte";
import SwitchButton from "#/components/IconButtons/SwitchButton.svelte";
import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import ArrowedInput from "#/components/Inputs/ArrowedInput.svelte";
    import Label from "#/components/Label.svelte";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import JudgeLines from "./JudgeLinesManager.svelte";

import { Sidebar, init as EditorGlobalInit, SecondarySidebar, restoreStates, operationList, eventsType, eventsLayer, playerShowsUI, playerShowsLineID, selectedLineNumber, activeSidebar, activeSecondarySidebar, previousActiveSecondarySidebar, selectedNote, selectedNotes, selectedNode, selectedNodes, timeDivisor, playerHitEffectNoFollows } from "./store.svelte";
    import NoteEditor from "./NoteEditor.svelte";
    import Constants from "./constants";
    import NotesSidebar from "./NotesSidebar.svelte";
    import Tooltip from "#/components/Tooltip.svelte";
    import JudgeLineEditor from "./JudgeLineEditor.svelte";
    import EventsSidebar from "./EventsSidebar.svelte";
    import { EventCurveEditorState } from "kipphi-canvas-editor/eventCurveEditor";
    import { event } from "@tauri-apps/api";
    import EventEditor from "./EventEditor.svelte";
    import ChartInfoEditor from "./ChartInfoEditor.svelte";
    import MultiNodeEditor from "./MultiNodeEditor.svelte";
    import MultiNoteEditor from "./MultiNoteEditor.svelte";
    import { KPASettings } from "#/settings.svelte";
    import { notify } from "./notify.svelte";
    import { respack } from "#/respack";


let {
    data
}: {data: PageData} = $props();



const audio = new Audio(URL.createObjectURL(data.music));
audio.addEventListener("timeupdate", () => {
    if (!player.playing) {
        return;
    }
    progressBar.value = audio.currentTime + '';
});
audio.addEventListener("ended", () => {
    player.pause();
    isPlaying = false;
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
await Images.initImagesForEditor({
    selectNote: data.selectNoteImg,
    startNode: data.startNodeImg,
    endNode: data.endNodeImg
})


// @ts-expect-error 仅供调试
window.Images = Images;
// @ts-expect-error 仅供调试
window.audioProcessor = audioProcessor;

let playerCanvas: HTMLCanvasElement;
let notesEditorCanvas: HTMLCanvasElement;
let eventSequenceEditorCanvas: HTMLCanvasElement;
let player: Player = null;
let notesEditor: NotesEditor;
let eventSequenceEditors: EventSequenceEditors;
// svelte-ignore non_reactive_update
let judgeLinesManager: JudgeLines;
let progressBar: HTMLInputElement;
let playButton: PlayButton;
let isPlaying = $state(false);
let showingGrid = $state(true);
let speed = $state("1.0x");
let preservesPitch = $state(true);
let renderingOffset = $state(-0.10);
let judgeLinesLayout = $state(0b001);

// let selectedLineNumber = $state(0);

$effect(() => {
    let s = parseFloat(speed); // 反正末尾有东西不影响解析
    audio.playbackRate = s;
});
$effect(() => {
    audio.preservesPitch = preservesPitch;
});

$effect(() => {
    renderingOffset; // 确保建立依赖追踪
    if (player) {
        player.renderingOffset = renderingOffset;
    }
});

let selectedLineName = $derived.by(() => {
    const lineNumber = $selectedLineNumber;
    const line = data.chart.judgeLines[lineNumber];
    return line?.name ?? "?";
});

/**
 * 处理滚轮事件。
 * @param event
 */
function handleWheel(event: WheelEvent) {
    if (event.ctrlKey) { // 不处理Ctrl
        return;
    }
    if (audio) {
        audio.currentTime += event.deltaY / 1000;
        progressBar.value = audio.currentTime + '';
        player.render();
    }
}

function globalHandleWheel(event: WheelEvent) {
    if (event.ctrlKey) { // 按下CTRL则认为在切换判定线
        selectedLineNumber.set(($selectedLineNumber + (event.deltaY > 0 ? 1 : -1) + data.chart.judgeLines.length) % data.chart.judgeLines.length);
        return;
    }
}

document.addEventListener("wheel", globalHandleWheel);
document.addEventListener("keydown", (event) => {
    switch (event.key) {
    case "Control":
        if ($activeSecondarySidebar === SecondarySidebar.LINES) {
            return;
        }
        previousActiveSecondarySidebar.set($activeSecondarySidebar);
        activeSecondarySidebar.set(SecondarySidebar.LINES);
        break;
    case " ":
        if (document.hasFocus()) {
            return;
        }
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
        break;
    case "Tab":
        if ($activeSidebar === Sidebar.EVENTS) {
            const offset = event.shiftKey ? -1 : 1;
            const currentType = $eventsType;
            const currentLayer = $eventsLayer;
            const NORMALS = ["moveX", "moveY", "rotate", "alpha", "speed", "easing"] as Exclude<keyof typeof EventType, ExtendedEventTypeName>[]
            const EXTENDED = ["scaleX", "scaleY", "text", "color", "bpm"] as ExtendedEventTypeName[]
            eventsType.set(
                currentLayer === "ex"
                    ? EXTENDED[(EXTENDED.indexOf(currentType as ExtendedEventTypeName) + offset + EXTENDED.length) % EXTENDED.length] ?? EXTENDED[0]
                    : NORMALS[(NORMALS.indexOf(currentType) + offset + NORMALS.length) % NORMALS.length] ?? NORMALS[0]
            );
        }
        break;
    case "z":
        operationList.undo();
        break;
    case "y":
        operationList.redo();
        break;
    }
});
document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        activeSecondarySidebar.set($previousActiveSecondarySidebar);
    }
});

window.addEventListener("beforeunload", (e) => {
    if (operationList.chart?.modified) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});


onMount(async () => {
    await tick();
    const chart = data.chart;
    player = new Player(
        playerCanvas,
        audioProcessor,
        audio,
        illustration,
        respack
    );
    player.addEventListener("play", () => {
        isPlaying = true;
    });
    player.addEventListener("pause", () => {
        isPlaying = false;
    });
    const operationList = new O.OperationList(chart);

    notesEditor = new NotesEditor(
        notesEditorCanvas,
        [0, 0, 600, 900],
        operationList,
        respack
    );
    notesEditor.target = chart.judgeLines[0];
    notesEditor.showsNNNListAttachable = false;
    notesEditorCanvas.addEventListener("click", () => {
        activeSidebar.set(Sidebar.NOTES);
    });
    eventSequenceEditorCanvas.addEventListener("click", () => {
        activeSidebar.set(Sidebar.EVENTS);
    })
    playerCanvas.addEventListener("click", () => {
        activeSidebar.set(Sidebar.DEFAULT);
    })
    eventSequenceEditors = new EventSequenceEditors(
        eventSequenceEditorCanvas,
        [0, 0, 600, 900],
        operationList
    );
    eventSequenceEditors.changeTarget({ judgeLine: chart.judgeLines[0] });
    player.addEventListener("drawn", () => {
        if (showingGrid) {
            notesEditor.draw(player.renderingBeats);
            eventSequenceEditors.draw(player.renderingBeats);
        }
        judgeLinesManager?.update();
    });
    operationList.addEventListener("needsupdate", () => {
        player.render();
    });
    operationList.addEventListener("maxcombochanged", (ev) => {
        chart.maxCombo += ev.comboDelta;
        if (isNaN(chart.maxCombo)) {
            chart.countMaxCombo();
        }
    });
    operationList.addEventListener("firstmodified", (ev) => {
        chart.modified = true;
    });
    operationList.addEventListener("undo", (e) => {
        notify("Undo: " + e.operation.constructor.name, "info");
    })
    operationList.addEventListener("redo", (e) => {
        notify("Redo: " + e.operation.constructor.name, "info");
    })
    notesEditor.addEventListener("noteselected", (ev) => {
        selectedNote.set(ev.note);
        activeSecondarySidebar.set(SecondarySidebar.NOTE);
    });
    notesEditor.addEventListener("notescopeselected", (ev) => {
        selectedNotes.set(ev.notes);
        activeSecondarySidebar.set(SecondarySidebar.MULTI_NOTE);
    });
    eventSequenceEditors.addEventListenerForAll("nodeselected", (ev) => {
        selectedNode.set(ev.node);
        activeSecondarySidebar.set(SecondarySidebar.EVENT);
    });
    eventSequenceEditors.addEventListenerForAll("nodescopeselected", (ev) => {
        selectedNodes.set(ev.nodes);
        activeSecondarySidebar.set(SecondarySidebar.MULTI_NODE);
    });
    player.renderingOffset = renderingOffset;
    // @ts-expect-error 仅供调试
    window.player = player;
    // @ts-expect-error 仅供调试
    window.operationList = operationList;
    player.receive(chart, () => void 0);

    if (KPASettings.autosaveEnabled) {
        AutoSaveRunner.init(chart);
        AutoSaveRunner.run();
    }


    EditorGlobalInit(notesEditor, eventSequenceEditors, operationList, player);
    restoreStates();
    // 释放内存
    // data.chart = null;
});

onDestroy(() => {
    // 停止音频播放
    if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
    }
    // 停止播放器
    if (player) {
        player.pause();
    }
    if (KPASettings.autosaveEnabled) {
        AutoSaveRunner.stop();
    }
    // 清理编辑器
    if (notesEditor) {
        // 如果有清理方法，调用它
    }
    if (eventSequenceEditors) {
        // 如果有清理方法，调用它
    }
    // 移除全局引用
    // @ts-expect-error 仅供调试
    if (window.player === player) window.player = null;
    // @ts-expect-error 仅供调试
    if (window.Images === Images) delete window.Images;
    // @ts-expect-error 仅供调试
    if (window.audioProcessor === audioProcessor) delete window.audioProcessor;
});



let tipIndex: number = $state(0);
function updateTip() {
    tipIndex = Math.floor(Constants.tips.length * Math.random());
    setTimeout(() => {
        updateTip();
    }, Constants.TIP_INTERVAL);
}
updateTip();


</script>

<main class="container">
    <div id="inner" onwheel={handleWheel}>
        <canvas bind:this={playerCanvas} id="player" width=1350 height=900>Your device does not support the HTML5 canvas element.</canvas>
        <canvas bind:this={notesEditorCanvas} id="ne" width=600 height=900>Your device does not support the HTML5 canvas element.</canvas>
        <canvas bind:this={eventSequenceEditorCanvas} id="ece" width=600 height=900>Your device does not support the HTML5 canvas element.</canvas>
    </div>
    <div id="secondary-sidebar">
        <div class="sidebar-shadow"></div>
        <div class="sidebar-content">
            <PopupOption wide
                options={
                    [SecondarySidebar.LINES, SecondarySidebar.NOTE, SecondarySidebar.EVENT, SecondarySidebar.LINE, SecondarySidebar.CHART, SecondarySidebar.MULTI_NODE, SecondarySidebar.MULTI_NOTE]
                }
                displayTexts={[
                    $_("main.secondary.lines"),
                    $_("main.secondary.note"),
                    $_("main.secondary.event"),
                    $_("main.secondary.line"),
                    $_("main.secondary.chart"),
                    $_("main.secondary.multiNode"),
                    $_("main.secondary.multiNote")
                ]}
                bind:currentOption={$activeSecondarySidebar}
            ></PopupOption>
            {#if $activeSecondarySidebar === SecondarySidebar.LINES}
                <JudgeLines chart={data.chart} bind:this={judgeLinesManager}></JudgeLines>
            {:else if $activeSecondarySidebar === SecondarySidebar.NOTE}
                {#if $selectedNote && $selectedNote.parentNode}
                <NoteEditor target={$selectedNote}></NoteEditor>
                {:else}
                <div style="color: var(--color-foreground)">{$_("main.note.noNote")}</div>
                {/if}
            {:else if $activeSecondarySidebar === SecondarySidebar.EVENT}
                {#if $selectedNode && $selectedNode.parentSeq}
                <EventEditor></EventEditor>
                {:else}
                <div style="color: var(--color-foreground)">{$_("main.event.noEvent")}</div>
                {/if}
            {:else if $activeSecondarySidebar === SecondarySidebar.LINE}
                <JudgeLineEditor></JudgeLineEditor>
            {:else if $activeSecondarySidebar === SecondarySidebar.CHART}
                <ChartInfoEditor></ChartInfoEditor>
            {:else if $activeSecondarySidebar === SecondarySidebar.MULTI_NODE}
                {#if $selectedNodes && $selectedNodes.size > 0}
                    <MultiNodeEditor target={$selectedNodes}></MultiNodeEditor>
                {/if}
            {:else if $activeSecondarySidebar === SecondarySidebar.MULTI_NOTE}
                {#if $selectedNotes && $selectedNotes.size > 0}
                    <MultiNoteEditor target={$selectedNotes}></MultiNoteEditor>
                {/if}
            {/if}
        </div>
    </div>
    <div id="sidebar">
        <div class="sidebar-shadow"></div>
        <div class="sidebar-content">
            <!--TimeDivisorPicker /-->
            <Label small>
                {$_("main.sidebar.timeDivisor.term")}
                <Tooltip>{$_("main.sidebar.timeDivisor.desc")}</Tooltip>
            </Label>
            <ArrowedInput
                bind:value={$timeDivisor}
                />
            <Label small>
                {$_("main.sidebar.renderingOffset.term")}
                <Tooltip>{$_("main.sidebar.renderingOffset.desc")}</Tooltip>
            </Label>
            <UnitInput
                unit="s"
                bind:value={renderingOffset}/>
            <Label small>{$_("main.sidebar.linenumber") + ` (${data.chart.judgeLines.length ?? 0})`}</Label>
            <ArrowedInput
                max={(data.chart.judgeLines.length ?? 1) - 1} min={0}
                bind:value={$selectedLineNumber}
                suffix={`(${selectedLineName})`}
                loops
            />
            {#if $activeSidebar === Sidebar.DEFAULT}
                <Label>Player</Label>
                <TextSwitchButton wide bgText={$_("main.player.showsUI")} onText="Y" offText="N" bind:checked={$playerShowsUI}/>
                <TextSwitchButton wide bgText={$_("main.player.showsLineID")} onText="Y" offText="N" bind:checked={$playerShowsLineID}/>
                <TextSwitchButton wide bgText={$_("main.player.hitEffectNoFollows")} onText="Y" offText="N" bind:checked={$playerHitEffectNoFollows}/>
            {:else if $activeSidebar === Sidebar.NOTES}
                <NotesSidebar/>
            {:else if $activeSidebar === Sidebar.EVENTS}
                <EventsSidebar/>
            {/if}
        </div>
    </div>
    <div id="footer">
        <PlayButton bind:this={playButton} checked={isPlaying} onchange={(playing) => playing ? player.play() : player.pause()}/>
        <GridSwitch bind:checked={showingGrid} onchange={(checked) => {
            if (checked) {
                notesEditorCanvas.style.display = "";
                eventSequenceEditorCanvas.style.display = "";
                // 如果没有在播放，手动渲染一次
                if (!player.playing) {
                    notesEditor.draw(player.renderingBeats);
                    eventSequenceEditors.draw(player.renderingBeats);
                }
            } else {
                notesEditorCanvas.style.display = "none";
                eventSequenceEditorCanvas.style.display = "none";
            }
        }} />
            <input type="range" bind:this={progressBar} value={audio.currentTime} step="0.01" max={data.chart.duration}
                oninput={
                    (event) => {
                        audio.currentTime = progressBar.valueAsNumber;
                        player.pause();
                        requestAnimationFrame(() => player.render())
                    }
                }
                onmousedown={() => player.pause()}>
        <!-- !表示preservesPitch=false -->
        <PopupOption options={[
            "1.0x", "0.5x",  "0.25x",  "0.75x",  "1.5x",  "2.0x"
        ]} bind:currentOption={speed} />
        <TextSwitchButton onText="Y" offText="N" bgText={$_("general.preservesPitch")} bind:checked={preservesPitch} />
    </div>
    <div id="secondary-footer">
        <span id="tips">Tips: {Constants.tips[tipIndex]}</span>
    </div>
</main>
<div id="notifications"></div>

<style lang="less">
    :root {
        --player-height: 85vh;
        --bottom-bar-height: 12vh;
        --bottom-tips-height: 3vh;
        --color-foreground: white;
    }
    .container {
        display: grid;
        grid-template-columns: auto 1fr 1fr;
        grid-template-rows: var(--player-height) var(--bottom-bar-height) var(--bottom-tips-height);
        width: 100%;
        background-color: #444;
    }
    #inner {
        height: var(--player-height);
        grid-column: 1 / 2;
        position: relative;
    }
    #footer {
        grid-row: 2 / 3;
        grid-column: 1 / 4;
        display: flex;
        align-items: center;
        padding: 0 2vh;
        gap: 1vh;
        background-color: #333;
    }
    #secondary-footer {
        grid-row: 3 / 4;
        grid-column: 1 / 4;
        background-color: #333;
        color: white;
    }
    input[type="range"] {
        flex: 1;
    }
    #player {
        height: var(--player-height); 
    }
    #ne {
        position: absolute;
        height: var(--player-height);
        left: 0;
        transition: 0.3s opacity ease;
        opacity: 0.3;
    }
    #ece {
        position: absolute;
        height: var(--player-height);
        right: 0;
        transition: 0.3s opacity ease;
        opacity: 0.3;
    }
    #ne:hover, #ece:hover {
        opacity: 1.0;
    }
    #ne:active, #ece:active {
        cursor: grabbing;
    }






    #sidebar, #secondary-sidebar {
        position: fixed;
        height: var(--player-height);
        width: 20vh;
        right: 0;
        top: 0;
        background-color: #555;
        z-index: 1;
        padding: 1vh;
        
        box-sizing: border-box;
        scrollbar-width: none;
    }
    #secondary-sidebar {
        right: 20vh;
        width: 30vh;
    }

    .sidebar-shadow {
        position: absolute;
        height: var(--player-height);
        width: 6px;
        left: -6px;
        top: 0;
        box-shadow: -6px 0 6px -6px #000 inset;
    }
    .sidebar-content {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow-y: auto;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 3px;

        scrollbar-width: none;
    }





</style>