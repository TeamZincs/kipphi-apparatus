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
    get respack() {
        const it = localStorage.getItem("respack");
        return it || "Default";
    },
    set respack(value: string) {
        localStorage.setItem("respack", value)
    },
    get playerHeight() {
        const it = localStorage.getItem("playerHeight");
        return parseInt(it) || 900
    },
    set playerHeight(value: number) {
        localStorage.setItem("playerHeight", value + "");
    },
    get useRpeWheel() {
        const it = localStorage.getItem("usesRpeWheel");
        return it === null ? true : it === "1";
    },
    set useRpeWheel(value: boolean) {
        localStorage.setItem("usesRpeWheel", value ? "1" : "");
    },
    get baseOffset() {
        const it = localStorage.getItem("baseOffset");
        return it === null ? 0.036 : parseFloat(it);
    },
    set baseOffset(value: number) {
        localStorage.setItem("baseOffset", value.toString());
    },
    get replayCompensation() {
        const it = localStorage.getItem("replayCompensation");
        return it === null ? 0 : parseFloat(it);
    },
    set replayCompensation(value: number) {
        localStorage.setItem("replayCompensation", value.toString());
    },
    get renderingOffset() {
        const it = localStorage.getItem("renderingOffset");
        return it === null ? -0.1 : parseFloat(it);
    },
    set renderingOffset(value: number) {
        localStorage.setItem("renderingOffset", value.toString());
        
    },
})