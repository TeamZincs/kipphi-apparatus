<script module lang="ts">
</script>

<script lang="ts">
import { KPAError } from "kipphi";
    import { operationList } from "./store.svelte";
    import { _ } from "#/i18n";
    import Button from "#/components/buttons/Button.svelte";
    import { notify } from "#/notify.svelte";
    let errors = $state(KPAError.buffer);
</script>

<Button onclick={
    () => {
        const pre = performance.now();
        operationList.chart.checkErrors();
        errors = KPAError.buffer;
        const cost = (performance.now() - pre) / 1000;
        notify($_("main.errors.checkComplete",
        {values:{count: KPAError.buffer.length, secs: cost.toFixed(3)}}), "info");
    }
}>{$_("main.errors.check")}</Button>
<div class="errors">
    {#each errors as error}
        <div class="error">
            <div class="error-message">{error.message}</div>
        </div>
    {/each}
</div>

<style scoped lang="less">
@import "#/components/mixin.less";

.errors {
    display: flex;
    flex-direction: column;
    contain: layout;
    width: 100%;
    padding: 4px;
    box-sizing: border-box;
    gap: 4px;

    height: auto;
    min-height: 50vh;
    overflow: auto;
    scrollbar-width: none;
}

.error {
    display: block;
    background-color: #eee;
    padding: var(--border-radius);
    border-radius: var(--border-radius);
}
</style>