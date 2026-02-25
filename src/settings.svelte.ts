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
    }
})