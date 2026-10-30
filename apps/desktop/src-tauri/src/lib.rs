



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        use tauri_plugin_mcp_bridge::Config;

        builder = builder.plugin(tauri_plugin_mcp_bridge::init_with_config(Config::localhost_only()));
    }

    builder.plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}