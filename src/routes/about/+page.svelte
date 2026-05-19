<script lang="ts">
    import Navigator from "#/components/Navigator.svelte";
    import { _ } from "#/i18n";
    import { onMount, onDestroy } from "svelte";
    import "./patch";

    // Electron 更新相关
    let isElectron = false;
    let updateStatus: "idle" | "checking" | "available" | "downloading" | "downloaded" | "error" = "idle";
    let updateError = "";
    let downloadProgress = 0;
    let newVersion = "";
    let totalDownloadSize = 0;
    let isIncrementalUpdate = false;

    onMount(() => {
        isElectron = !!window.electronAPI?.updater;
        if (isElectron) {
            setupUpdaterListeners();
            checkForUpdates();
        }
    });

    onDestroy(() => {
        if (isElectron) {
            window.electronAPI?.updater?.removeAllListeners();
        }
    });

    function setupUpdaterListeners() {
        window.electronAPI.updater.onChecking(() => {
            updateStatus = "checking";
            updateError = "";
        });

        window.electronAPI.updater.onAvailable((info) => {
            updateStatus = "available";
            newVersion = info.version;
            totalDownloadSize = info.totalSize || 0;
            isIncrementalUpdate = info.isIncremental || false;
        });

        window.electronAPI.updater.onNotAvailable(() => {
            updateStatus = "idle";
        });

        window.electronAPI.updater.onProgress((progress) => {
            updateStatus = "downloading";
            downloadProgress = progress.percent;
        });

        window.electronAPI.updater.onDownloaded((info) => {
            updateStatus = "downloaded";
            newVersion = info.version;
        });

        window.electronAPI.updater.onError((error) => {
            updateStatus = "error";
            updateError = error;
        });
    }

    async function checkForUpdates() {
        await window.electronAPI.updater.check();
    }

    async function downloadUpdate() {
        await window.electronAPI.updater.download();
    }

    async function installUpdate() {
        await window.electronAPI.updater.install();
    }

    function formatBytes(bytes: number): string {
        if (bytes === 0) return "未知";
        const units = ["B", "KiB", "MiB", "GiB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
    }
</script>

<main class="container">
    <Navigator></Navigator>
    <div class="content">
        <h1>{$_("about.title")}</h1>
        <p>{$_("about.desc")}</p>
        <div class="table">

            <span>{$_("about.apparatus")}</span><span>{__APP_VERSION} ({ isElectron ? "Electron" : "Tauri"})</span>
            <span>{$_("about.kipphi")}</span><span>{__KIPPHI_VERSION}</span>
            <span>{$_("about.player")}</span><span>{__PLAYER_VERSION}</span>
            <span>{$_("about.canvasEditor")}</span><span>{__CANVAS_EDITOR_VERSION}</span>
        </div>
        
        <div class="table-3">
            {#each __DEPENDENCIES as dep}
                <span>{dep.name}</span><span>{dep.version}</span><span>{dep.license}</span>
            {/each}
        </div>

        {#if isElectron}
            <div class="update-section">
                <h2>软件更新</h2>
                <div class="update-status">
                    {#if updateStatus === "idle"}
                        <span>当前版本: {__APP_VERSION}</span>
                        <button onclick={checkForUpdates}>检查更新</button>
                    {:else if updateStatus === "checking"}
                        <span>正在检查更新...</span>
                    {:else if updateStatus === "available"}
                        <span>发现新版本: {newVersion}</span>
                        {#if totalDownloadSize > 0}
                            <span>需下载: {formatBytes(totalDownloadSize)}{isIncrementalUpdate ? " (增量更新)" : " (完整更新)"}</span>
                        {/if}
                        <button onclick={downloadUpdate}>下载更新</button>
                    {:else if updateStatus === "downloading"}
                        <span>正在下载: {downloadProgress.toFixed(1)}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: {downloadProgress}%"></div>
                        </div>
                    {:else if updateStatus === "downloaded"}
                        <span>下载完成! 新版本: {newVersion}</span>
                        <button onclick={installUpdate}>安装并重启</button>
                    {:else if updateStatus === "error"}
                        <span class="error">检查更新失败: {updateError}</span>
                        <button onclick={checkForUpdates}>重试</button>
                    {/if}
                </div>
            </div>
        {/if}
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
        overflow-y: auto;
    }
    .table {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 4px;
        border-radius: var(--border-radius);
        border: 1px solid var(--color-foreground);
        padding: 4px;
    } 
    .table-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 4px;
        border-radius: var(--border-radius);
        border: 1px solid var(--color-foreground);
        padding: 4px;
    }
    .update-section {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px solid var(--color-foreground);
        border-radius: var(--border-radius);
        h2 {
            margin: 0 0 1rem 0;
            color: var(--color-foreground);
        }
    }
    .update-status {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        span {
            color: var(--color-foreground);
        }
        button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background: #555;
            color: white;
            cursor: pointer;
            &:hover {
                background: #666;
            }
        }
    }
    .progress-bar {
        width: 100%;
        height: 8px;
        background: #444;
        border-radius: 4px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: #4caf50;
        transition: width 0.2s;
    }
    .error {
        color: #ff6b6b;
    }
</style>
