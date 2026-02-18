<script lang="ts">
    import SwitchButton from "./SwitchButton.svelte";
    let {
        onchange: onChange,
        checked = $bindable(false)
    }: {
        onchange?: (checked: boolean) => void;
        checked?: boolean;
    } = $props();
</script>

<SwitchButton bind:checked onchange={onChange}>
    {#snippet content(on)}
        <svg
            style="width: 100%; height: 100%;"
            width="200"
            height="200"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <!-- 定义样式 -->
            <style>
                .grid-line {
                    stroke-width: 16;
                    stroke-linecap: round;
                }
            </style>

            <!-- 水平线 -->
            <g transform-origin="center" transform="scale(0.75, 0.75)" stroke={on ? "#5f9" : "#f8f9fa"}>
                <path class="grid-line horizontal" d="M20,100 H180" />
                <path class="grid-line horizontal" d="M20,20 H180" />
                <path class="grid-line horizontal" d="M20,180 H180" />

                <!-- 垂直线 -->
                <path class="grid-line vertical" d="M100,20 V180" />
                <path class="grid-line vertical" d="M20,20 V180" />
                <path class="grid-line vertical" d="M180,20 V180" />
            </g>

        </svg>
    {/snippet}
</SwitchButton>
