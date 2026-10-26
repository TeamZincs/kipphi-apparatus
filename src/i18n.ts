/**
 * 极简 i18n。
 *
 * 原先用 `svelte-i18n`：它本体其实只是几个 `svelte/store`，真正的价值是
 * `intl-messageformat`。这里的语言文件只用了 `{name}` 这一种占位符（没有
 * plural / select），所以自己实现一遍反而更小、也没有 Svelte 依赖。
 *
 * 关于响应性：grain 的依赖是编译期算出来的，模板里的 `_("a.b")` 只是普通函数调用，
 * 换语言不会自动重画。换语言只发生在设置页，所以这里换完直接整页重载 ——
 * 简单、且不会留下"有些字没换"的半吊子状态。
 */
import { setLocale as KPCESetLocale } from 'kipphi-canvas-editor/messages';

import { KPASettings } from './settings';
import type { I18nMapping } from './i18n-types';

export const localeLangNames = {
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    en: 'English'
};

export type LocaleName = keyof typeof localeLangNames;

/** 扁平化之后的词典：`main.note.type` -> 文本 */
type Table = Record<string, string>;

const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
    'zh-Hans': () => import('./locales/zh-Hans.json'),
    'zh-Hant': () => import('./locales/zh-Hant.json'),
    en: () => import('./locales/en.json')
};

const FALLBACK_LOCALE = 'zh-Hans';

function flatten(source: Record<string, unknown>, prefix = '', out: Table = {}): Table {
    for (const [key, value] of Object.entries(source)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object') flatten(value as Record<string, unknown>, path, out);
        else out[path] = String(value);
    }

    return out;
}

let current: Table = {};
let fallback: Table = {};

type InterpolationValues<T extends keyof I18nMapping> = Record<
    I18nMapping[T],
    string | number | boolean | Date | null | undefined
>;

export interface MessageObject<T extends keyof I18nMapping> {
    id: T;
    locale?: string;
    format?: string;
    default?: string;
    values?: I18nMapping[T] extends never ? never : InterpolationValues<T>;
}

function interpolate(text: string, values?: Record<string, unknown>): string {
    if (!values) return text;

    return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
        name in values ? String(values[name]) : whole
    );
}

/**
 * 取词。`_` 是历史上的名字（svelte-i18n 的 `$_`），组件里统一 `import { t as _ }`。
 */
export function t<T extends keyof I18nMapping>(
    id: T | MessageObject<T>,
    options?: Omit<MessageObject<T>, 'id'>
): string {
    const message = typeof id === 'string' ? { id } : (id as MessageObject<T>);
    const key = message.id as string;

    const text = current[key] ?? fallback[key] ?? message.default ?? key;

    return interpolate(text, (message.values ?? options?.values) as Record<string, unknown> | undefined);
}

/**
 * `_` 是历史上的名字（svelte-i18n 的 `$_`），组件里直接 `import { _ }` 就是它。
 */
export const _ = t;

/** 加载一门语言（不触发重载） */
async function load(name: string): Promise<void> {
    const loader = loaders[name] ?? loaders[FALLBACK_LOCALE];

    current = flatten((await loader()).default);

    if (!Object.keys(fallback).length) {
        fallback = current;
    }
}

/** 应用启动时调一次：把词典装好再挂载界面 */
export async function initI18n(): Promise<void> {
    const name = KPASettings.lang;

    await load(name);

    if (name !== FALLBACK_LOCALE && loaders[FALLBACK_LOCALE]) {
        const backup = current;

        await load(FALLBACK_LOCALE);
        fallback = current;
        current = backup;
    }

    KPCESetLocale(name);
}

/** 当前语言；换语言要整页重载，所以这里只提供"改完就重载"的 `set` */
export const locale = {
    get(): string {
        return KPASettings.lang;
    },
    set(value: string): void {
        KPASettings.lang = value;
        location.reload();
    }
};
