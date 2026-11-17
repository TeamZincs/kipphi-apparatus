/**
 * 时间（`TimeT` ↔ 拍数 ↔ 分数文本）的小工具。
 *
 * 面板里的时间输入有两种形态：三个框（拍 / 分子 / 分母）和单个分数框
 * （`3+1/4`），两边都要能互相换算，所以抽出来共用。
 */
import { TC, numberToRatio, type TimeT } from "kipphi";

/**
 * 拍数 → `TimeT`。
 *
 * 小数部分交给 kipphi 的 `numberToRatio`（分母 324324000 = 2⁵·3⁴·5³·7·11·13），
 * 1/3、1/6、1/16 这类常见分数都能**精确**表示 —— 之前自己用 960 做分母，
 * 三连音（1/3）会被舍入成 320/960，显示成 1/3 但值已经偏了一点。
 *
 * 取整用 `Math.trunc`（向 0 取整）而不是 `Math.floor`：后者对负数是往下取，
 * `-1.5` 会拆成 `[-2, -0.5]` 再被判成 -2.5。零前时间是合法的，符号要保住。
 */
export const toTime = (beats: number): TimeT => {
    const beat = Math.trunc(beats);

    return TC.validateIp([beat, ...numberToRatio(beats - beat)]);
};

/**
 * `TimeT` → `拍:分子/分母`（`3:1/4`），整数拍只写 `3`。
 *
 * 和三个框的视觉保持一致（`[拍]:[子]/[母]`），也是 kipphi 的 `toTimeString`
 * 那种形状；三元组本身就是 `[拍, 分子, 分母]`，直接拿来用，不绕 `TC.toBeats`。
 */
export function formatTime(time: TimeT): string {
    const [beat, numerator, denominator] = TC.validateIp([...time]);

    if (numerator === 0) return String(beat);

    if (denominator === 1) return String(beat + numerator);

    return `${beat}:${numerator}/${denominator}`;
}

/**
 * 分数文本 → 拍数。
 *
 * 认这些写法：`3`、`3:1/4`、`3+1/4`、`1/4`、`3.25`（冒号是老写法的补充，
 * 桌面端 FractionInput 用 `+`，面板的单框现在显示 `:`，两种都吃）。
 */
export function parseTime(text: string): number {
    const trimmed = text.trim();

    // 空串必须当"没填"，不能让它走到 `Number("") === 0`
    if (trimmed === "") return NaN;

    const mixed = /^(\d+)\s*[:+]\s*(\d+)\s*\/\s*(\d+)$/.exec(trimmed);

    if (mixed) {
        const denominator = Number(mixed[3]);

        if (!denominator) return NaN;

        return Number(mixed[1]) + Number(mixed[2]) / denominator;
    }

    const fraction = /^(\d+)\s*\/\s*(\d+)$/.exec(trimmed);

    if (fraction) {
        const denominator = Number(fraction[2]);

        return denominator ? Number(fraction[1]) / denominator : NaN;
    }

    const decimal = Number(trimmed);

    return Number.isFinite(decimal) ? decimal : NaN;
}

/** 字符串 → 数字，空串/非法都算 NaN（由调用方决定报什么错） */
export const num = (text: string): number => {
    const trimmed = text.trim();

    return trimmed === "" ? NaN : Number(trimmed);
};

/** 三个框（拍 / 分子 / 分母）→ 拍数；分母为 0 时算 NaN */
export function beatsOf(
    beat: string,
    numerator: string,
    denominator: string
): number {
    const b = num(beat);
    const n = num(numerator);
    const d = num(denominator);

    if (!Number.isFinite(b) || !Number.isFinite(n) || !d) return NaN;

    return b + n / d;
}

/** `TimeT` → 三个框的文本（`[拍, 分子, 分母]`，约分成最简分数） */
export function splitTime(time: TimeT): [string, string, string] {
    const [beat, numerator, denominator] = TC.validateIp([...time]);

    return [String(beat), String(numerator), String(denominator)];
}

/** 拍数 → 三个框的文本；只有从文本解析回来的地方才需要它 */
export const splitBeats = (beats: number): [string, string, string] =>
    splitTime(toTime(beats));
