/**
 * 新建 / 导入谱面。
 *
 * 文件落盘全部交给 `@kpa/shared/background/tauri`（跟桌面端同一套），
 * 这里只负责"从用户输入/压缩包里凑出参数"。
 */
import { Chart, JudgeLine, Op } from 'kipphi';

import {
    checkChartDirExists,
    createChartDir,
    importChart,
    saveChartMeta,
    saveTextFile,
    type ChartMetadata
} from '@kpa/shared/background/tauri';
import { unzip } from '@kpa/shared/uncompress';

const AUDIO_EXT = /\.(ogg|mp3|wav|m4a)$/i;
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

/** 生成一个没被占用的 id */
async function freshId(): Promise<string> {
    for (;;) {
        const id = `chart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        if (!(await checkChartDirExists(id))) return id;
    }
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

/** 从文件名猜个标题（去掉扩展名） */
const titleOf = (name: string): string => name.replace(/\.[^.]+$/, '');

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

const chartTypeOf = (json: Record<string, unknown>): 'RPE' | 'KPA2' =>
    Array.isArray(json.judgeLineList) ? 'RPE' : 'KPA2';

/**
 * 导入一个文件：`.pez` / `.zip` 压缩包，或者裸的谱面 `.json`。
 *
 * 压缩包按 Phira 的约定找 `chart.json`、音频、曲绘；标题从 `info.txt` 的
 * `name:` 取，取不到就用文件名。
 */
export async function importChartFile(file: File): Promise<string> {
    const lower = file.name.toLowerCase();

    if (lower.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text) as Record<string, unknown>;
        const chartType = chartTypeOf(json);
        const id = await freshId();

        await createChartDir(id);
        await saveTextFile(id, `chart.${chartType === 'RPE' ? 'rpe' : 'kpa'}.json`, text);
        await saveChartMeta(id, {
            title: titleOf(file.name),
            chart: `chart.${chartType === 'RPE' ? 'rpe' : 'kpa'}.json`,
            music: 'music.ogg',
            illustration: 'illustration.png',
            type: chartType,
            durationSecs: 0
        } as ChartMetadata);

        return id;
    }

    const archive = await unzip(file);

    if (!archive.success || archive.files.length === 0) throw new Error('压缩包解不开');

    const findByName = (predicate: (name: string) => boolean) =>
        archive.files.find((item) => predicate(item.name.toLowerCase()));

    const chartFile = findByName((name) => name.endsWith('chart.json')) ??
        findByName((name) => name.endsWith('.json') && !name.endsWith('info.json'));

    if (!chartFile) throw new Error('压缩包里没找到谱面文件（chart.json）');

    const musicFile = findByName((name) => AUDIO_EXT.test(name));
    const imageFile = findByName((name) => IMAGE_EXT.test(name));
    const infoFile = findByName((name) => name === 'info.txt' || name.endsWith('/info.txt'));

    const chartText = new TextDecoder().decode(chartFile.buffer);
    const chartJson = JSON.parse(chartText) as Record<string, unknown>;
    const chartType = chartTypeOf(chartJson);

    let title = titleOf(file.name);

    if (infoFile) {
        const info = new TextDecoder().decode(infoFile.buffer);
        const matched = /^\s*name:\s*(.+)$/m.exec(info);

        if (matched?.[1]) title = matched[1].trim().replace(/^["']|["']$/g, '');
    }

    const musicMime = musicFile ? (musicFile.name.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'audio/ogg') : '';
    const duration = musicFile ? await audioDuration(musicFile.buffer, musicMime) : 0;

    return await importChart({
        id: await freshId(),
        chartContent: chartText,
        chartType,
        title,
        musicData: musicFile?.buffer ?? new ArrayBuffer(0),
        musicExtension: musicFile?.name.split('.').pop() ?? 'ogg',
        illustrationData: imageFile?.buffer ?? new ArrayBuffer(0),
        illustrationExtension: imageFile?.name.split('.').pop() ?? 'png',
        durationSecs: duration
    });
}
