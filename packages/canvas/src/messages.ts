// 注意：这些字符串里可以带 `\n`，绘制时会按行拆开画（见 `drawNoTarget`）
const zhHans = {
    NO_TARGET: (layer: string, type: string) =>
        `没有目标序列\n(${layer}, ${type}) 点击创建`,
    NO_TARGET_EASING: () => "没有指定目标缓动",
};

const zhHant = {
    NO_TARGET: (layer: string, type: string) =>
        `沒有目標序列\n(${layer}, ${type}) 點擊創建`,
    NO_TARGET_EASING: () => "沒有指定目標緩動",
};

const en = {
    NO_TARGET: (layer: string, type: string) =>
        `No target sequence\n(${layer}, ${type}) click to create`,
    NO_TARGET_EASING: () => "You didn't specify a target easing",
};

const locales = {
    "zh-Hans": zhHans,
    "zh-Hant": zhHant,
    en: en,
};

export const messages = new Proxy(zhHans, {
    get: (target, p: keyof typeof zhHans) => {
        return locales[locale][p] || target[p];
    },
});

type LocaleKey = keyof typeof locales;

/** 当前语言。收窄成 `LocaleKey`，这样 `locales[locale]` 不必加索引签名 */
let locale: LocaleKey = "en";

export function setLocale(newLocale: LocaleKey | string): void {
    if (newLocale in locales) locale = newLocale as LocaleKey;
}
