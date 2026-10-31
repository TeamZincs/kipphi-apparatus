import { writable } from '@graints/runtime';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'kpa.mobile.theme';

const prefersDark = () =>
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

const stored = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    } catch {
        return null;
    }
};

export const theme = writable<ThemeName>(stored() ?? (prefersDark() ? 'dark' : 'light'));

export function applyTheme(value: ThemeName): void {
    document.documentElement.dataset.theme = value;

    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // 隐私模式下写不了就算了，不影响界面
    }
}

export function toggleTheme(): void {
    theme.set(theme.get() === 'dark' ? 'light' : 'dark');
}

// 订阅会**立即**回调一次，所以初次也能落到 <html data-theme>
theme.subscribe(applyTheme);

/** 系统主题变了、用户又没手动选过时跟着变 */
if (typeof matchMedia === 'function') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (!stored()) theme.set(event.matches ? 'dark' : 'light');
    });
}
