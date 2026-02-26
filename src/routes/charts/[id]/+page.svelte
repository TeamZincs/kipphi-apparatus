<script lang="ts">
import { Player, AudioProcessor, Images } from "kipphi-player";
import { EventSequenceEditors, NotesEditor, NotesEditorState } from "kipphi-canvas-editor";
import type { PageData } from "./$types";
import { onMount, tick, onDestroy } from "svelte";
import { Chart, EventType, Op as O, type ExtendedEventTypeName } from "kipphi";

import { _ } from "#/i18n";

import PlayButton from "#/components/IconButtons/PlayButton.svelte";
import GridSwitch from "#/components/IconButtons/GridSwitch.svelte";
import PopupOption from "#/components/PopupOption/PopupOption.svelte";
import TimeDivisorPicker from "#/components/IconButtons/TimeDivisorPicker.svelte";
import SwitchButton from "#/components/IconButtons/SwitchButton.svelte";
import TextSwitchButton from "#/components/IconButtons/TextSwitchButton.svelte";
    import ArrowedInput from "#/components/Inputs/ArrowedInput.svelte";
    import Label from "#/components/Label.svelte";
    import UnitInput from "#/components/Inputs/UnitInput.svelte";
    import JudgeLines from "./JudgeLines.svelte";

import { GlobalContext, Sidebar, init as EditorGlobalInit, SecondarySidebar, PlayerSettings, NotesEditorSettings, EventSequenceEditorSettings } from "./store.svelte";
    import NoteEditor from "./NoteEditor.svelte";
    import Constants from "./constants";
    import NotesSidebar from "./NotesSidebar.svelte";
    import Tooltip from "#/components/Tooltip.svelte";
    import JudgeLineEditor from "./JudgeLineEditor.svelte";
    import EventsSidebar from "./EventsSidebar.svelte";
    import { EventCurveEditorState } from "kipphi-canvas-editor/eventCurveEditor";
    import { event } from "@tauri-apps/api";


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
    let timeDivisor = GlobalContext.timeDivisor; // 确保建立依赖追踪
    if (player) {
        notesEditor.timeDivisor = timeDivisor;
        eventSequenceEditors.timeDivisor = timeDivisor;
        notesEditor.draw();
        eventSequenceEditors.draw();
    }
});
$effect(() => {
    renderingOffset; // 确保建立依赖追踪
    if (player) {
        player.renderingOffset = renderingOffset;
    }
});

$effect(() => {
    let selectedLineNumber = GlobalContext.selectedLineNumber;
    if (player) {
        player.greenLine = selectedLineNumber;
        notesEditor.target = player.chart.judgeLines[selectedLineNumber];
        eventSequenceEditors.changeTarget({
            judgeLine: player.chart.judgeLines[selectedLineNumber]
        });
        notesEditor.draw();
        eventSequenceEditors.draw();
    }
});

$effect(() => {
    let checked = NotesEditorSettings.editChecked;
    if (checked && notesEditor) {
        notesEditor.state = NotesEditorState.edit;
    } else if (notesEditor) {
        notesEditor.state = NotesEditorState.select;
    }
});

$effect(() => {
    let showsNNN = NotesEditorSettings.showsNNN;
    if (!notesEditor) return;
    if (notesEditor.showsNNNListAttachable !== showsNNN) {
        notesEditor.showsNNNListAttachable = showsNNN;
        notesEditor.draw();
    }
});

$effect(() => {
    let showsUI = PlayerSettings.showsUI;
    if (!player) return;
    if (player.showsInfo !== showsUI) { // 我也不知道为什么加了这个判断才能避免无限递归
        player.showsInfo = showsUI;
        player.render();
    }
})

$effect(() => {
    let showsLineID = PlayerSettings.showsLineID;
    if (!player) return;
    if (player.showsLineID !== showsLineID) {
        player.showsLineID = showsLineID;
        player.render();
    }
})
// 编辑器类型切换
$effect(() => {
    let type = EventSequenceEditorSettings.type;
    if (!eventSequenceEditors) return;
    // @ts-expect-error TSC又在发什么颠
    eventSequenceEditors.activatedEditor = eventSequenceEditors[type];
    EventSequenceEditorSettings.editChecked = eventSequenceEditors.activatedEditor.state === EventCurveEditorState.edit

});
// 层切换
$effect(() => {
    let layer = EventSequenceEditorSettings.layer;
    if (!eventSequenceEditors) return;
    eventSequenceEditors.changeTarget({
        layerID: layer
    })
});
// 时间跨度
$effect(() => {
    let timeSpan = EventSequenceEditorSettings.timeSpan;
    if (!eventSequenceEditors) return;
    for (const key of ["alpha", "moveX", "moveY", "rotate", "speed",
       "scaleX", "scaleY", "text", "color",
       "bpm", "easing"] satisfies (keyof typeof EventType)[]) {
        eventSequenceEditors[key].timeSpan = timeSpan;
    }
    eventSequenceEditors.draw();
});
// 编辑切换
$effect(() => {
    let editChecked = EventSequenceEditorSettings.editChecked;

    if (!eventSequenceEditors) return;
    const activatedEditor = eventSequenceEditors.activatedEditor
    if (editChecked) {
        activatedEditor.state = EventCurveEditorState.edit;
    } else {
        activatedEditor.state = EventCurveEditorState.select;
    }
});



let selectedLineName = $derived.by(() => {
    // 显式访问 GlobalContext.selectedLineNumber，建立依赖
    const lineNumber = GlobalContext.selectedLineNumber;
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
        GlobalContext.selectedLineNumber = (GlobalContext.selectedLineNumber + (event.deltaY > 0 ? 1 : -1) + data.chart.judgeLines.length) % data.chart.judgeLines.length;
        return;
    }
}

document.addEventListener("wheel", globalHandleWheel);
document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        if (GlobalContext.activeSecondarySidebar === SecondarySidebar.LINES) {
            return;
        }
        GlobalContext.previousActiveSecondarySidebar = GlobalContext.activeSecondarySidebar;
        GlobalContext.activeSecondarySidebar = SecondarySidebar.LINES;
    } else if (event.key === " ") {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    } else if (event.key === "Tab") {
        if (GlobalContext.activeSidebar === Sidebar.EVENTS) {
            const offset = event.shiftKey ? -1 : 1;
            const curType = EventSequenceEditorSettings.type;
            const NORMALS = ["moveX", "moveY", "rotate", "alpha", "speed", "easing"] as Exclude<keyof typeof EventType, ExtendedEventTypeName>[]
            const EXTENDED = ["scaleX", "scaleY", "text", "color", "bpm"] as ExtendedEventTypeName[]
            EventSequenceEditorSettings.type = EventSequenceEditorSettings.layer === "ex"
                ? EXTENDED[(EXTENDED.indexOf(curType) + offset + EXTENDED.length) % EXTENDED.length] ?? EXTENDED[0]
                : NORMALS[(NORMALS.indexOf(curType) + offset + NORMALS.length) % NORMALS.length] ?? NORMALS[0]
        }
    }
});
document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        GlobalContext.activeSecondarySidebar = GlobalContext.previousActiveSecondarySidebar;
    }
});


onMount(async () => {
    await tick();
    const chart = data.chart;
    player = new Player(
        playerCanvas,
        audioProcessor,
        audio,
        illustration
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
        operationList
    );
    notesEditor.target = chart.judgeLines[0];
    notesEditor.showsNNNListAttachable = NotesEditorSettings.showsNNN;
    notesEditorCanvas.addEventListener("click", () => {
        GlobalContext.activeSidebar = Sidebar.NOTES;
    });
    eventSequenceEditorCanvas.addEventListener("click", () => {
        GlobalContext.activeSidebar = Sidebar.EVENTS;
    })
    playerCanvas.addEventListener("click", () => {
        GlobalContext.activeSidebar = Sidebar.DEFAULT;
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
        judgeLinesManager?.update()
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
    notesEditor.addEventListener("noteselected", (ev) => {
        GlobalContext.selectedNote = ev.note;
        GlobalContext.activeSecondarySidebar = SecondarySidebar.NOTE
    })
    player.renderingOffset = renderingOffset;
    // @ts-expect-error 仅供调试
    window.player = player;
    // @ts-expect-error 仅供调试
    window.operationList = operationList;
    player.receive(chart, () => void 0);


    EditorGlobalInit(notesEditor, eventSequenceEditors, operationList, player);
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
                    [SecondarySidebar.LINES, SecondarySidebar.NOTE, SecondarySidebar.EVENT, SecondarySidebar.LINE]
                }
                displayTexts={
                    [
                        $_("main.secondary.lines"),
                        $_("main.secondary.note"),
                        $_("main.secondary.event"),
                        $_("main.secondary.line")
                    ]
                }
                bind:currentOption={GlobalContext.activeSecondarySidebar}
            ></PopupOption>
            {#if GlobalContext.activeSecondarySidebar === SecondarySidebar.LINES}
                <JudgeLines chart={data.chart} layout={judgeLinesLayout} bind:this={judgeLinesManager}></JudgeLines>
            {:else if GlobalContext.activeSecondarySidebar === SecondarySidebar.NOTE}
                {#if GlobalContext.selectedNote}
                <NoteEditor target={GlobalContext.selectedNote}></NoteEditor>
                {/if}
            {:else if GlobalContext.activeSecondarySidebar === SecondarySidebar.LINE}
                <JudgeLineEditor></JudgeLineEditor>
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
                bind:value={GlobalContext.timeDivisor}
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
                bind:value={GlobalContext.selectedLineNumber}
                suffix={`(${selectedLineName})`}
                loops
            />
            {#if GlobalContext.activeSidebar === Sidebar.DEFAULT}
                <Label>Player</Label>
                <TextSwitchButton wide bgText={$_("main.player.showsUI")} onText="Y" offText="N" bind:checked={PlayerSettings.showsUI}/>
                <TextSwitchButton wide bgText={$_("main.player.showsLineID")} onText="Y" offText="N" bind:checked={PlayerSettings.showsLineID}/>
            {:else if GlobalContext.activeSidebar === Sidebar.NOTES}
                <NotesSidebar/>
            {:else if GlobalContext.activeSidebar === Sidebar.EVENTS}
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