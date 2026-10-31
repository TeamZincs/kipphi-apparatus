// 移动端入口。
//
// 桌面端的 MCP bridge（给 AI 调试用的）这里不装：移动端将来走 v2 的
// `tauri android dev --host`，调试用 Chrome DevTools 直接连，不需要那个插件。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
