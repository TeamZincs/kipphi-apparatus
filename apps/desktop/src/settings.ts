/**
 * 用户设置。
 *
 * 原先是 `.svelte.ts` 里的 `$state`；grain 没有跨模块的 rune，而这里的每一项
 * 要么是「读一次就够」（挂载时取初始值），要么是「在事件里读写」，
 * 所以直接落成普通对象 + localStorage 即可。
 */

function readFlag(key: string) {
    return !!localStorage.getItem(key);
}

function writeFlag(key: string, value: boolean) {
    localStorage.setItem(key, value ? '1' : '');
}

let lang = localStorage.getItem('lang') || 'zh-Hans';

export const KPASettings = {
    get useRpeEasingId() {
        return readFlag('useRpeEasingId');
    },
    set useRpeEasingId(value: boolean) {
        writeFlag('useRpeEasingId', value);
    },
    get lang() {
        return lang;
    },
    set lang(value: string) {
        localStorage.setItem('lang', value);
        lang = value;
    },
    get autosaveEnabled() {
        return readFlag('autosaveEnabled');
    },
    set autosaveEnabled(value: boolean) {
        writeFlag('autosaveEnabled', value);
    },
    get autosaveInterval() {
        const it = localStorage.getItem('autosaveInterval');
        return it === null ? 60 : parseInt(it);
    },
    set autosaveInterval(value: number) {
        localStorage.setItem('autosaveInterval', value.toString());
    },
    get respack() {
        const it = localStorage.getItem('respack');
        return it || 'Default';
    },
    set respack(value: string) {
        localStorage.setItem('respack', value);
    },
    get playerHeight() {
        const it = localStorage.getItem('playerHeight');
        return parseInt(it) || 900;
    },
    set playerHeight(value: number) {
        localStorage.setItem('playerHeight', value + '');
    },
    get useRpeWheel() {
        const it = localStorage.getItem('usesRpeWheel');
        return it === null ? true : it === '1';
    },
    set useRpeWheel(value: boolean) {
        localStorage.setItem('usesRpeWheel', value ? '1' : '');
    },
    get baseOffset() {
        const it = localStorage.getItem('baseOffset');
        return it === null ? 0.036 : parseFloat(it);
    },
    set baseOffset(value: number) {
        localStorage.setItem('baseOffset', value.toString());
    },
    get replayCompensation() {
        const it = localStorage.getItem('replayCompensation');
        return it === null ? 0 : parseFloat(it);
    },
    set replayCompensation(value: number) {
        localStorage.setItem('replayCompensation', value.toString());
    },
    get renderingOffset() {
        const it = localStorage.getItem('renderingOffset');
        return it === null ? -0.1 : parseFloat(it);
    },
    set renderingOffset(value: number) {
        localStorage.setItem('renderingOffset', value.toString());
    }
};
