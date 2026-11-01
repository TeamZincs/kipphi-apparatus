/**
 * 新建 / 导入谱面。
 *
 * 文件落盘全部交给 `@kpa/shared/background/tauri`（跟桌面端同一套），
 * 这里只负责"从用户输入/压缩包里凑出参数"。
 *
 * 导入的取舍和桌面端保持一致：**除了 info/metadata/chart/music/illustration
 * 之外的所有文件都当 extraFiles 原样落盘** —— 视频、着色器（.glsl）、
 * 纹理（textures/）、effect 依赖全在这一堆里，漏掉任何一个谱面就少东西。
 */
import { Chart, JudgeLine, Op } from 'kipphi';

import {
    checkChartDirExists,
    createChartDir,
    importChart,
    parseRawInfoTxt,
    saveChartMeta,
    saveTextFile,
    type ChartMetadata
} from '@kpa/shared/background/tauri';
import { unzip } from '@kpa/shared/uncompress';

const AUDIO_EXT = /\.(ogg|mp3|wav|m4a)$/i;
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

type ChartType = 'RPE' | 'KPA1' | 'KPA2';

/** 随机 id（谱面名不可用时兜底） */
async function freshId(): Promise<string> {
    for (;;) {
        const id = `chart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        if (!(await checkChartDirExists(id))) return id;
    }
}

/**
 * 压缩包名 → 目录名。
 *
 * 只在名字是"纯 ASCII 字母数字/_/-、且以字母开头"时才用，
 * 中文名、带空格或特殊符号的（Phira 的谱面名很常见）继续走随机 id。
 */
function idFromName(filename: string): string | null {
    const base = filename
        .replace(/^.*[\\/]/, '')
        .replace(/\.[^.]+$/, '')
        .trim();

    return /^[A-Za-z][A-Za-z0-9_-]*$/.test(base) ? base : null;
}

/** 拿一个没被占用的 id：优先用压缩包名，重名就加 -2 / -3 … */
async function idForImport(file: File): Promise<string> {
    const base = idFromName(file.name);

    if (!base) return await freshId();
    if (!(await checkChartDirExists(base))) return base;

    for (let index = 2; index < 1000; index += 1) {
        const candidate = `${base}-${index}`;

        if (!(await checkChartDirExists(candidate))) return candidate;
    }

    return await freshId();
}

/**
 * 新建空谱面。
 *
 * 只写 `metadata.json` + 谱面本体；音乐/曲绘留空（`getChartProject` 读不到会退化成
 * null，不影响编辑）。这样不用先塞假的二进制文件进去。
 */
export async function createEmptyChart(title: string): Promise<string> {
    const id = await freshId();
    const chart = new Chart();
    const operations = new Op.OperationList(chart);

    // 先给一条判定线，不然编辑器点开是空白
    operations.do(new Op.JudgeLineCreateOperation(chart, new JudgeLine(chart)));

    await createChartDir(id);
    await saveTextFile(id, 'chart.kpa.json', JSON.stringify(chart.dumpKPA()));
    await saveChartMeta(id, {
        title: title.trim() || '未命名谱面',
        chart: 'chart.kpa.json',
        music: 'music.ogg',
        illustration: 'illustration.png',
        type: 'KPA2',
        durationSecs: 0
    } as ChartMetadata);

    return id;
}

/** 读音频时长，读不到就 0 */
async function audioDuration(buffer: ArrayBuffer, mime: string): Promise<number> {
    try {
        const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: mime })));

        await new Promise<void>((resolve) => {
            audio.onloadedmetadata = () => resolve();
            audio.onerror = () => resolve();
        });

        return Number.isFinite(audio.duration) ? audio.duration : 0;
    } catch {
        return 0;
    }
}

/** 和桌面端 `getTypeAndTitle` 一致：先看 version，再看 META，最后当早期 KPA1 */
function typeAndTitleOf(content: string, fallback: string): [ChartType, string] {
    let data: Record<string, unknown>;

    try {
        data = JSON.parse(content) as Record<string, unknown>;
    } catch {
        return ['KPA2', fallback];
    }

    const info = data.info as { name?: string } | undefined;

    if ('version' in data) {
        const version = Number(data.version);

        return [version >= 200 ? 'KPA2' : 'KPA1', info?.name ?? fallback];
    }

    if ('META' in data) {
        const meta = data.META as { name?: string } | undefined;

        return ['RPE', meta?.name ?? fallback];
    }

    if (info?.name) return ['KPA1', info.name];

    return [Array.isArray(data.judgeLineList) ? 'RPE' : 'KPA2', fallback];
}

/**
 * 导入一个文件：`.pez` / `.zip` 压缩包，或者裸的谱面 `.json`。
 *
 * 压缩包的解析顺序跟桌面端一样：
 *   `info.txt` → `metadata.json` → 按扩展名猜。
 * 剩下的**所有文件**都作为额外文件落盘（视频 / 着色器 / 纹理 / 音频依赖…）。
 */
export async function importChartFile(file: File): Promise<string> {
    const id = await idForImport(file);

    if (file.name.toLowerCase().endsWith('.json')) {
        const content = await file.text();
        const [chartType, title] = typeAndTitleOf(content, file.name.replace(/\.[^.]+$/, ''));
        const chartFile = `chart.${chartType === 'RPE' ? 'rpe' : 'kpa'}.json`;

        await createChartDir(id);
        await saveTextFile(id, chartFile, content);
        await saveChartMeta(id, {
            title,
            chart: chartFile,
            music: 'music.ogg',
            illustration: 'illustration.png',
            type: chartType,
            durationSecs: 0
        } as ChartMetadata);

        return id;
    }

    const archive = await unzip(file);

    if (!archive.success || archive.files.length === 0) throw new Error('压缩包解不开');

    const files = archive.files;
    const findByName = (predicate: (name: string) => boolean) =>
        files.find((item) => predicate(item.name.toLowerCase()));

    /** 元数据：info.txt（Phira）→ metadata.json（KPA）→ 按扩展名猜 */
    let musicName = '';
    let chartName = '';
    let imageName = '';

    const infoFile = findByName((name) => name === 'info.txt' || name.endsWith('/info.txt'));
    const metadataFile = findByName((name) => name === 'metadata.json' || name.endsWith('/metadata.json'));

    if (infoFile) {
        const info = parseRawInfoTxt(infoFile.buffer) as { Song?: string; Chart?: string; Picture?: string };

        musicName = info.Song ?? '';
        chartName = info.Chart ?? '';
        imageName = info.Picture ?? '';
    } else if (metadataFile) {
        const meta = JSON.parse(new TextDecoder().decode(metadataFile.buffer)) as ChartMetadata;

        musicName = meta.music;
        chartName = meta.chart;
        imageName = meta.illustration;
    } else {
        musicName = files.find((item) => AUDIO_EXT.test(item.name))?.name ?? '';
        chartName = files.find((item) => item.name.toLowerCase().endsWith('.json'))?.name ?? '';
        imageName = files.find((item) => IMAGE_EXT.test(item.name))?.name ?? '';
    }

    /**
     * info.txt 里的名字是**相对谱面根目录**的，而压缩包可能多套了一层
     * （`MyChart/chart.json`）。先按全名找，找不到再按文件名兜底。
     */
    const findFile = (name: string) =>
        files.find((item) => item.name === name) ??
        (name ? files.find((item) => item.name.endsWith(`/${name}`)) : undefined);

    const music = findFile(musicName);
    const chart = findFile(chartName);
    const image = findFile(imageName);

    if (!chart) throw new Error('压缩包里没找到谱面文件');

    const chartContent = new TextDecoder().decode(chart.buffer);
    const [chartType, title] = typeAndTitleOf(chartContent, file.name.replace(/\.[^.]+$/, ''));

    const musicMime = music
        ? music.name.toLowerCase().endsWith('.mp3')
            ? 'audio/mpeg'
            : 'audio/ogg'
        : '';

    // 除元数据、谱面、音频、曲绘之外**全部**原样带过去：
    // 视频（.mp4）、着色器（.glsl）、纹理（textures/…）、以及谱面自己引用的其它文件
    // 按**对象身份**排除（按名字排除的话，套了一层目录时会漏，把音源重复塞进去）
    const taken = new Set([infoFile, metadataFile, chart, music, image]);

    const extraFiles = files
        .filter((item) => !taken.has(item))
        .map((item) => ({ name: item.name, data: item.buffer }));

    return await importChart({
        id,
        chartContent,
        chartType,
        title,
        musicData: music?.buffer ?? new ArrayBuffer(0),
        musicExtension: music?.name.split('.').pop() ?? 'ogg',
        illustrationData: image?.buffer ?? new ArrayBuffer(0),
        illustrationExtension: image?.name.split('.').pop() ?? 'png',
        durationSecs: music ? await audioDuration(music.buffer, musicMime) : 0,
        extraFiles
    });
}
