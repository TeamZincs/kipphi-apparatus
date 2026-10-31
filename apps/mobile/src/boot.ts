import { EventSequenceEditors, NotesEditor } from 'kipphi-canvas-editor';
import {
    AudioProcessor,
    Images,
    Player,
    Respack,
    setWasmPath,
    VideoFrameSource,
    type EffectShader
} from 'kipphi-player';

import { fetchTexture, _ReturnType } from '@kpa/shared/background/tauri';

import { readDefaultRespackFile } from './tauri';
import { scheduleSave } from './save';

import {
    chart,
    chartId,
    currentTime,
    duration,
    illustration,
    isPlaying,
    lineOf,
    musicUrl,
    operationList,
    playerError,
    playerReady,
    selectedLineId
} from './store';

export let player: Player | null = null;
export let notesEditor: NotesEditor | null = null;
export let eventEditors: EventSequenceEditors | null = null;

/** 默认 respack：Tauri 下读 resource，浏览器下退回 fetch（见 `tauri.ts`） */
export async function loadDefaultRespack(): Promise<Respack> {
    return await Respack.loadFromPhira(async (filename) => {
        if (filename.endsWith('.ogg')) return null;

        return await readDefaultRespackFile(filename);
    });
}

export const respackPromise: Promise<Respack | null> = (async () => {
    try {
        return await loadDefaultRespack();
    } catch (error) {
        playerError.set(`respack 加载失败：${error instanceof Error ? error.message : error}`);

        return null;
    }
})();

/** 静态资源（跟桌面端用的是同一批，都在仓库根的 static/ 里） */
const ASSETS = {
    tap: '/Tap.wav',
    drag: '/Drag.wav',
    flick: '/Flick.wav',
    anchorImg: '/Anchor.png',
    belowImg: '/Below.png',
    selectNoteImg: '/selectNote.png',
    startNodeImg: '/South.png',
    endNodeImg: '/North.png'
} as const;

/**
 * 锚点 / 多押 / 编辑器用的那些小图。
 *
 * `Player.renderLine` 会 `drawImage(Images.ANCHOR)`，两个画布编辑器也依赖
 * `initImagesForEditor` 的那些图 —— 桌面端在页面里一次性初始化，移动端漏了，
 * 于是 `getTexture` 里 `undefined.displayWidth` 直接炸。
 */
const imagesPromise: Promise<void> = (async () => {
    await Images.loadAndOptimize({ anchor: ASSETS.anchorImg, below: ASSETS.belowImg });
    await Images.initImagesForEditor({
        selectNote: ASSETS.selectNoteImg,
        startNode: ASSETS.startNodeImg,
        endNode: ASSETS.endNodeImg
    });
})();

/** respack 里没有打击音效时退回静态资源里的那三个 wav */
async function audioProcessorOf(respack: Respack): Promise<AudioProcessor> {
    if (respack.TAP_SE && respack.DRAG_SE && respack.FLICK_SE) {
        return AudioProcessor.fromRespack(respack);
    }

    const processor = new AudioProcessor();

    await processor.init({ tap: ASSETS.tap, drag: ASSETS.drag, flick: ASSETS.flick });

    return processor;
}

/** 视频：贴图接口拿 blob，再包成 `VideoFrameSource`（跟桌面端 `background.ts` 一样） */
async function fetchVideo(id: string, name: string) {
    const blob = await fetchTexture(id, name, _ReturnType.blob);

    const file = new File([blob], 'file.mp4', { type: blob.type, lastModified: Date.now() });

    return await VideoFrameSource.from(file, { bufferSize: 6 });
}

/** 着色器：读出源码，包成 `EffectShader` */
async function fetchShader(id: string, name: string): Promise<EffectShader> {
    const bytes = await fetchTexture(id, name, _ReturnType.u8);

    return { glsl: new TextDecoder().decode(bytes), name };
}

/**
 * 播放器背景。
 *
 * 有曲绘就用曲绘；没有就用一张 16×16 的深灰画布顶上。
 *
 * 注意：兜底**不能再走 `createImageBitmap(canvas)`** —— 在当前 WebView 里拿到的
 * 东西不是合法 ImageBitmap，`Player` 构造时 `drawImage` 直接抛
 * `TypeError: The provided value is not of type (… ImageBitmap …)`，
 * 连 Canvas 2D 回退路径都建不起来。`drawImage` 本来就吃 canvas，直接给 canvas 就行。
 */
function backgroundOf(): ImageBitmap {
    if (illustration && illustration instanceof ImageBitmap) return illustration;

    const canvas = document.createElement('canvas');

    canvas.width = 16;
    canvas.height = 16;

    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = '#101318';
        context.fillRect(0, 0, 16, 16);
    }

    return canvas as unknown as ImageBitmap;
}

export async function bootPlayer(canvas: HTMLCanvasElement): Promise<void> {
    try {
        if (!chart) throw new Error('谱面还没加载');

        setWasmPath(new URL('/web-demuxer.wasm', window.location.origin).href);

        const respack = await respackPromise;

        if (!respack) throw new Error('respack 没有加载成功');

        const audio = musicUrl ? new Audio(musicUrl) : new Audio();
        const background = backgroundOf();

        // 锚点图等静态资源要先就位，否则 renderLine 里 drawImage(Images.ANCHOR) 会炸
        await imagesPromise;

        // 画布分辨率由模板的 width/height 决定（跟桌面端一样是固定逻辑尺寸），这里不改
        player = await Player.create(
            canvas,
            await audioProcessorOf(respack),
            audio,
            background,
            respack,
            { renderer: 'webgl1' }
        );

        // 贴图 / 视频 / 着色器都从谱面目录读，交给播放器自己按需取
        if (chartId) {
            const id = chartId;

            player.use({
                texture: (name) => fetchTexture(id, name),
                video: (name) => fetchVideo(id, name),
                shader: (path) => fetchShader(id, path)
            });
        }

        // 必须走 `receive`：它会设 chart、初始化 `lastUnplayedNNNode`（漏了就会在
        // `playSounds` 里 `undefined.type` 崩）、同步资源并 warmup
        await player.receive(chart);

        if (operationList) {
            player.watch(operationList);

            // 任何一次操作（含撤销/重做）都排一次自动保存
            for (const type of ['do', 'undo', 'redo'] as const) {
                operationList.addEventListener(type, () => scheduleSave());
            }
        }

        if (!musicUrl) {
            // 没有音源：`time` 会一直读 audio.currentTime（恒为 0），改成自己推 offlineTime
            player.offlineTime = 0;
        }

        duration.set(chart.duration ?? 0);
        playerReady.set(true);

        startTicker();
    } catch (error) {
        // 把曲绘的实际类型带上：`Player` 里 `drawImage(background)` 的类型错误
        // 只会说"不是 ImageBitmap"，不说到底传进去了什么
        const shape = illustration === null ? 'null' : (illustration as unknown as object)?.constructor?.name ?? typeof illustration;

        playerError.set(`${error instanceof Error ? error.message : String(error)}（曲绘：${shape}）`);
    }
}

/** 播放状态与进度同步 */
let lastFrame = 0;

/** 上一次同步给画布编辑器的拍数（只在真的变了才重绘） */
let lastBeats = Number.NaN;
/** 上一次重绘编辑器的时刻（播放时限流用） */
let lastEditorDraw = 0;

/**
 * 播放器是时间的**唯一来源**：每帧把当前拍数喂给两个画布编辑器。
 *
 * 桌面端只在滚动/拖进度条时手动 `draw()` 一次；移动端播放时画面是动的，
 * 这里按帧同步（拍数没变就跳过）。
 */
function drawEditorsAt(beats: number): void {
    if (!Number.isFinite(beats)) return;
    // 没有判定线时编辑器还没 target，画会报错
    if (!lineOf(selectedLineId.get())) return;
    if (Math.abs(beats - lastBeats) < 1e-6) return;

    // 播放时每帧重绘两个 600×900 的画布太费，限到 ~20fps；
    // 暂停（拖进度条）时不限，保证松手就位
    const now = performance.now();

    if (isPlaying.get() && now - lastEditorDraw < 50) return;

    lastBeats = beats;
    lastEditorDraw = now;
    notesEditor?.draw(beats);
    eventEditors?.draw(beats);
}

function startTicker(): void {
    const step = (now: number) => {
        if (player) {
            if (isPlaying.get()) {
                if (musicUrl) {
                    currentTime.set(player.time);
                } else {
                    const delta = lastFrame ? (now - lastFrame) / 1000 : 0;

                    player.offlineTime = (player.offlineTime ?? 0) + delta;
                    currentTime.set(player.offlineTime);
                }
            }

            drawEditorsAt(player.renderingBeats);
        }

        lastFrame = now;
        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}

/** 强制暂停（拖进度条时用） */
export function pause(): void {
    if (!player) return;

    player.pause();
    isPlaying.set(false);
}

export function togglePlay(): void {
    if (!player) return;

    if (isPlaying.get()) {
        player.pause();
        isPlaying.set(false);

        return;
    }

    player.play();
    isPlaying.set(true);
}

export function seek(time: number): void {
    if (!player) return;

    const total = duration.get();
    const next = Math.max(0, total > 0 ? Math.min(time, total) : time);

    // `player.time` **只有 getter**（内部是 `(offlineTime ?? audio.currentTime) - offset + baseOffset`），
    // 想跳转只能写底层的 audio.currentTime / offlineTime，并做同样的偏移换算。
    const offset = (player.chart?.offset ?? 0) / 1000 - (player.baseOffset ?? 0);
    const raw = next + offset;

    if (musicUrl) {
        player.audio.currentTime = raw;
    } else {
        player.offlineTime = raw;
    }

    currentTime.set(next);

    // 暂停时没有播放循环，得手动把现在的画面和两个编辑器刷到新位置
    requestAnimationFrame(() => {
        player?.render();
        lastBeats = Number.NaN;
        if (player) drawEditorsAt(player.renderingBeats);
    });
}

/** 编辑器画布的逻辑尺寸（模板里写死 600×900，跟桌面端一致） */
const rectOf = (canvas: HTMLCanvasElement): [number, number, number, number] => [
    0,
    0,
    canvas.width,
    canvas.height
];

/** 音符画布编辑器（跟桌面端同一套库） */
export async function bootNotesEditor(canvas: HTMLCanvasElement): Promise<void> {
    const respack = await respackPromise;

    if (!operationList) return;

    await imagesPromise;


    notesEditor = new NotesEditor(canvas, rectOf(canvas), operationList, respack as never);

    syncEditors();
}

/** 事件画布编辑器 */
export async function bootEventEditors(canvas: HTMLCanvasElement): Promise<void> {
    if (!operationList) return;

    await imagesPromise;


    eventEditors = new EventSequenceEditors(canvas, rectOf(canvas), operationList, 0.5);

    syncEditors();
}

/** 判定线切换时把两个画布编辑器指过去 */
export function syncEditors(): void {
    const line = lineOf(selectedLineId.get());

    if (!line) return;

    if (notesEditor) notesEditor.target = line;

    if (eventEditors) eventEditors.changeTarget({ judgeLine: line });
}

selectedLineId.subscribe(() => syncEditors());
