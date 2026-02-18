<script lang="ts">
let {
    value = $bindable()
}: {
    value: number
} = $props();

function hexToRgb(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r << 16) | (g << 8) | b;
}

function rgbToHex(rgb: number): string {
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = hexToRgb(target.value);
}
</script>

<div class="color-input">
    <input type="color" value={rgbToHex(value)}/>
    <span class="hex">{rgbToHex(value)}</span>
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

.color-input {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hex {
    font-family: 'Consolas', monospace;
    font-size: 1.5em;
    color: white;
}

input[type="color"] {
    .input;
    width: 3em;
    height: 3em;
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
