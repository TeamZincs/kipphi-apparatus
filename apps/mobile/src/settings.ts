/**
 * 移动端设置（目前只有语言）。
 *
 * 桌面端的 `settings.ts` 有一堆播放 / 画布参数，移动端那些都存在
 * `KPASettings` 之外的地方；这里只保留 i18n 需要的那一项，读写走
 * `localStorage`，刷新后不会丢。
 */

export type Lang = 'zh-Hans' | 'zh-Hant' | 'en';

const LANG_KEY = 'kpa.lang';

/** 按浏览器语言猜一个默认值 */
function defaultLang(): Lang {
    const raw = (navigator.language ?? '').toLowerCase();

    if (raw.startsWith('zh-tw') || raw.startsWith('zh-hk') || raw.startsWith('zh-hant')) {
        return 'zh-Hant';
    }

    if (raw.startsWith('zh')) return 'zh-Hans';

    return 'en';
}

export const KPASettings = {
    get lang(): Lang {
        const stored = localStorage.getItem(LANG_KEY);

        if (stored === 'zh-Hans' || stored === 'zh-Hant' || stored === 'en') return stored;

        return defaultLang();
    },
    // 收 `string`：`i18n.ts` 的 `locale.set(value: string)` 直接转发过来
    set lang(value: string) {
        localStorage.setItem(LANG_KEY, value);
    }
};
