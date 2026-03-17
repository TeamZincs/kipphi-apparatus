<script lang="ts">
    import Navigator from "#/components/Navigator.svelte";
    import { _ } from "#/i18n";
    import "./patch";
</script>

<main class="container">
    <Navigator></Navigator>
    <div class="content">
        <h1>{$_("about.title")}</h1>
        <p>{$_("about.desc")}</p>
        <div class="table">

            <span>{$_("about.apparatus")}</span><span>{__APP_VERSION}</span>
            <span>{$_("about.kipphi")}</span><span>{__KIPPHI_VERSION}</span>
            <span>{$_("about.player")}</span><span>{__PLAYER_VERSION}</span>
            <span>{$_("about.canvasEditor")}</span><span>{__CANVAS_EDITOR_VERSION}</span>
        </div>
    </div>
</main>

<style lang="less" scoped>
    @import "#/components/mixin.less";
    :root {
        --color-foreground: white;
    }
    .container {
        background-color: #777;
        height: 100%;
        h1, p, span {
            color: var(--color-foreground);
        }
    }
    .content {
        padding: 10vh;
        box-sizing: border-box;
        height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .table {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 4px;
        border-radius: var(--border-radius);
        border: 1px solid var(--color-foreground);
        padding: 4px;
    }
</style>
