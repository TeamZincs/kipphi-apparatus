<script module lang="ts">
</script>

<script lang="ts">
import { KPAError } from "kipphi";
</script>

<div class="errors">
    {#each KPAError.buffer as errror}
        <div class="error">
            <div class="error-message">{errror.message}</div>
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