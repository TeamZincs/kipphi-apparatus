export const KPASettings = $state({
    get useRpeEasingId() {
        return !!localStorage.getItem('useRpeEasingId')
    },
    set useRpeEasingId(value: boolean) {
        localStorage.setItem('useRpeEasingId', value ? '1' : '');
    },
    get lang() {
        return localStorage.getItem('lang') || 'zh-Hans'
    },
    set lang(value: string) {
        localStorage.setItem('lang', value);
    },
    get autosaveEnabled() {
        const it = localStorage.getItem('autosaveEnabled')
        return it === null ? true : !!it;
    },
    set autosaveEnabled(value: boolean) {
        localStorage.setItem('autosaveEnabled', value ? '1' : '');
    },
    get autosaveInterval() {
        const it = localStorage.getItem('autosaveInterval')
        return it === null ? 60 : parseInt(it);
    },
    set autosaveInterval(value: number) {
        localStorage.setItem('autosaveInterval', value.toString());
    },
})