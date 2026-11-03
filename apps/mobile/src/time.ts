/**
 * 时间（`TimeT` ↔ 拍数 ↔ 分数文本）的小工具。
 *
 * 面板里的时间输入有两种形态：三个框（拍 / 分子 / 分母）和单个分数框
 * （`3+1/4`），两边都要能互相换算，所以抽出来共用。
 */
import { TC, type TimeT } from "kipphi";

/** 分母基数：能被 2/3/4/8/16 整除，分数显示好看 */
const DENOMINATOR = 960;

/** 拍数 → `TimeT` */
export const toTime = (beats: number): TimeT =>
    TC.validateIp([
        Math.floor(beats),
        Math.round((beats % 1) * DENOMINATOR),
        DENOMINATOR
    ]);

/** `TimeT` → 分数文本（`3` / `3+1/4`），和桌面端 FractionInput 的观感一致 */
export function formatTime(time: TimeT): string {
    const beat = Math.floor(TC.toBeats(time));
    const rest = TC.toBeats(time) - beat;

    if (rest <= 1e-6) return String(beat);

    let numerator = Math.round(rest * DENOMINATOR);
    let denominator = DENOMINATOR;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;

    if (denominator === 1) return String(beat + numerator);

    return beat === 0
        ? `${numerator}/${denominator}`
        : `${beat}+${numerator}/${denominator}`;
}

/** 分数文本 → 拍数；认 `3`、`3+1/4`、`3.25`，认不出就 NaN */
export function parseTime(text: string): number {
    const trimmed = text.trim();
    const mixed = /^(\d+)\s*\+\s*(\d+)\s*\/\s*(\d+)$/.exec(trimmed);

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

/** 拍数 → 三个框的文本（约分成最简分数） */
export function splitBeats(beats: number): [string, string, string] {
    const beat = Math.floor(beats);
    let numerator = Math.round((beats - beat) * DENOMINATOR);
    let denominator = DENOMINATOR;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = numerator === 0 ? 1 : gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;

    return [String(beat), String(numerator), String(denominator)];
}
