import { beforeAll, describe, expect, it, mock } from "bun:test";

import { SCHEMA, VERSION } from "kipphi";

/**
 * 新建谱面时那份"底稿"的结构。
 *
 * 抄的是桌面端 `routes/create/+page.grain`：24 条判定线、每条 4 条事件层序列
 * + 1 条 speed 序列 = 120 条。少一条、id 拼错、默认值给错，读谱就会缺东西，
 * 而且这种缺失**不会报错**（读谱侧对缺字段是宽容的），只能靠测试盯住。
 *
 * `chart-ops` 顶层 import 了 tauri 的落盘函数，bun 里跑不起来 —— 先 mock 掉。
 */

type ChartOps = typeof import("./chart-ops");

let buildBaseChart: ChartOps["buildBaseChart"];

beforeAll(async () => {
    mock.module("@kpa/shared/background/tauri", () => ({
        checkChartDirExists: async () => false,
        createChartDir: async () => {},
        importChart: async () => "",
        parseRawInfoTxt: () => ({}),
        saveChartMeta: async () => {},
        saveChartProject: async () => "",
        saveTextFile: async () => {},
        readTextFile: async () => ""
    }));

    mock.module("@kpa/shared/uncompress", () => ({
        unzip: async () => new Map()
    }));

    const module = await import("./chart-ops");

    buildBaseChart = module.buildBaseChart;
});

const build = () => buildBaseChart("测试谱面", 174, 123.5) as any;

describe("buildBaseChart", () => {
    it("版本号 / schema 跟着 kipphi 走", () => {
        const chart = build();

        expect(chart.version).toBe(VERSION);
        expect(chart.$schema).toBe(SCHEMA);
    });

    it("标题、时长、偏移都写进去了", () => {
        const chart = build();

        expect(chart.info.name).toBe("测试谱面");
        expect(chart.duration).toBe(123.5);
        expect(chart.offset).toBe(0);
    });

    it("BPM：一条，值就是传入的基础 BPM，从 0 拍开始", () => {
        const chart = build();

        expect(chart.bpmList).toEqual([
            { bpm: 174, startTime: [0, 0, 1] }
        ]);
    });

    it("24 条判定线，每条 1 个事件层 + speed 序列", () => {
        const chart = build();

        expect(chart.orphanLines.length).toBe(24);

        for (const [index, line] of chart.orphanLines.entries()) {
            expect(line.id).toBe(index);
            expect(line.eventLayers.length).toBe(1);
            expect(line.speedEventNodeSeq).toBe(`#${index}.speed`);

            const layer = line.eventLayers[0];

            expect(layer.moveX).toBe(`#${index}.0.moveX`);
            expect(layer.moveY).toBe(`#${index}.0.moveY`);
            expect(layer.rotate).toBe(`#${index}.0.rotate`);
            expect(layer.alpha).toBe(`#${index}.0.alpha`);
        }
    });

    it("序列总数 = 24 × 5，且 id 不重复", () => {
        const chart = build();
        const ids = chart.eventNodeSequences.map(
            (sequence: { id: string }) => sequence.id
        );

        expect(ids.length).toBe(24 * 5);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("每条序列都有 1 个事件 + final，且带缓动", () => {
        const chart = build();

        for (const sequence of chart.eventNodeSequences) {
            expect(sequence.events.length).toBe(1);

            const [event] = sequence.events;

            expect(event.startTime).toEqual([0, 0, 1]);
            expect(event.endTime).toEqual([1, 0, 1]);
            expect(event.evaluator.type).toBeDefined();
            expect(sequence.final).toBeTruthy();
        }
    });

    it("判定线默认值：贴图、锚点、cover", () => {
        const chart = build();
        const [line] = chart.orphanLines;

        expect(line.texture).toBe("line.png");
        expect(line.anchor).toEqual([0.5, 0.5]);
        expect(line.cover).toBe(true);
        expect(line.rotatesWithFather).toBe(false);
        expect(line.hnLists).toEqual({});
        expect(line.nnLists).toEqual({});
    });

    it("不同 BPM 传进去互不影响", () => {
        expect((buildBaseChart("a", 60, 10) as any).bpmList[0].bpm).toBe(60);
        expect((buildBaseChart("b", 240, 10) as any).bpmList[0].bpm).toBe(240);
    });
});
