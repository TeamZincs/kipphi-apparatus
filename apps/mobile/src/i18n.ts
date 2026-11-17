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
import { writable } from '@graints/runtime';
import { setLocale as KPCESetLocale } from '@kpa/canvas/messages';
import { parse as parseYAML } from 'yaml';

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

/**
 * 语言文件是 **YAML**（注释、多行文案、diff 都比 JSON 好读）。
 *
 * 用 `?raw` 取原文再自己 `parse` —— 让 vite 直接 import `.yaml` 需要额外插件，
 * 而 `yaml` 包本来就装了（生成类型的脚本也在用）。
 */
const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
    // 字面量 `import('...yaml?raw')`：vite 要静态看到路径才能打进包里
    'zh-Hans': () => loadYaml(() => import('./locales/zh-Hans.yaml?raw')),
    'zh-Hant': () => loadYaml(() => import('./locales/zh-Hant.yaml?raw')),
    en: () => loadYaml(() => import('./locales/en.yaml?raw'))
};

function loadYaml(
    loader: () => Promise<{ default: string }>,
): Promise<{ default: Record<string, unknown> }> {
    return loader().then((module) => ({
        default: parseYAML(module.default) as Record<string, unknown>,
    }));
}

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
 *
 * 这是**非响应式**入口：`_("a.b")` 在渲染时求值一次，换语言后不会自己重画。
 * 要响应式就用 `_i18n`（见下）。
 */
export const _ = t;

/**
 * 响应式取词：store 里装的是**函数**，页面里 `let _ = $read(_i18n)`。
 *
 * 和 svelte-i18n 把 `$_` 做成 store 是同一个思路 —— 换语言时 `set` 一个新
 * 函数实例，所有读过它的地方重新求值。
 *
 * 函数体故意每次都新建（而不是复用同一个引用）：store 的 `set` 若拿到相同
 * 引用会跳过通知（`!==` 判等），那样换语言就不生效了。
 */
export const _i18n = writable(
    (id: string, options?: { values?: Record<string, unknown> }): string =>
        t(id as never, options as never),
);

/** 重新装词典并把新函数推给所有订阅者 */
async function refreshI18n(): Promise<void> {
    await load(KPASettings.lang);

    _i18n.set(
        (id: string, options?: { values?: Record<string, unknown> }): string =>
            t(id as never, options as never),
    );
}

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

/** 当前语言。换语言不再整页重载 —— store 换了新函数，界面自己会跟着变 */
export const locale = {
    get(): string {
        return KPASettings.lang;
    },
    set(value: string): void {
        KPASettings.lang = value;

        // 装词典 + 通知订阅者；失败也不要卡住设置页
        void refreshI18n();
    }
};
