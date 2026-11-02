// 移动端入口。
//
// MCP bridge 和桌面端一样只在 debug 构建里装，方便 AI 直接读 DOM / 执行 JS。
// 注意 Android / iOS 上它监听的是**设备自己的** 127.0.0.1:9223，
// 从电脑连之前要先转发：
//     adb forward tcp:9223 tcp:9223        # Android
//     （iOS 模拟器直接用 localhost）
// 然后 MCP 侧 `driver_session` 连 localhost:9223 即可。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        use tauri_plugin_mcp_bridge::Config;

        builder = builder.plugin(tauri_plugin_mcp_bridge::init_with_config(Config::localhost_only()));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
