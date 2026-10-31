const zhHans = {
    NO_TARGET: (layer: string, type: string) =>
        `没有目标序列 (${layer}, ${type}), 点击创建.`,
    NO_TARGET_EASING: () => "没有指定目标缓动.",
};

const zhHant = {
    NO_TARGET: (layer: string, type: string) =>
        `沒有目標序列 (${layer}, ${type}), 點擊創建.`,
    NO_TARGET_EASING: () => "沒有指定目標緩動.",
};

const en = {
    NO_TARGET: (layer: string, type: string) =>
        `No target sequence (${layer}, ${type}), click to create.`,
    NO_TARGET_EASING: () => "You didn't specify a target easing.",
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
let locale = "en";
export function setLocale(newLocale: keyof typeof locales | string) {
    if (newLocale in locales) locale = newLocale;
}
