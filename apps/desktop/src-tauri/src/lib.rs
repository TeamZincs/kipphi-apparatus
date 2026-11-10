



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    /*
     * MCP 调试桥**默认关闭**，需要时用环境变量打开：
     *
     * ```powershell
     * $env:KPA_MCP_BRIDGE=1; bun run tauri dev
     * ```
     *
     * 原因：插件在 HMR 重新加载页面时会再建一次连接，撞上 MCP server 已占用的
     * 端口就直接报错，整页黑屏 —— HMR 等于废掉。平时不注册就没有这个问题。
     */
    #[cfg(debug_assertions)]
    if std::env::var("KPA_MCP_BRIDGE").is_ok() {
        use tauri_plugin_mcp_bridge::Config;

        builder = builder.plugin(tauri_plugin_mcp_bridge::init_with_config(Config::localhost_only()));
    }

    builder.plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}