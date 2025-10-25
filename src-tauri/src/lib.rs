// use std::io::{Cursor, Read};
// use serde::Serialize;
// use futures::Stream;

//use zip::{
//    result::ZipError, ZipArchive
//};

// use async_stream::stream;

//use tracing::info;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
/*
#[derive(Serialize)]
struct File {
    name: String,
    data: Vec<u8>
}
*/

/*
#[tauri::command]
async fn unzip(zip_data: Vec<u8>) -> Vec<File> {
    info!("Unzipping...");
    let cursor = Cursor::new(zip_data);
    let mut zip_archive = ZipArchive::new(cursor).unwrap();
    
    let mut files: Vec<File> = Vec::new();
    
    for i in 0..zip_archive.len() {
        let mut file = zip_archive.by_index(i).unwrap();
        let name = file.name().to_string();
        
        let mut data = Vec::new();
        std::io::Read::read_to_end(&mut file, &mut data).unwrap();
        
        files.push(File {
            name,
            data
        });
    }
    
    files
}
*/
/* md，劳资不用tauri后端解压了

#[tauri::command]
async fn unzip(zip_data: Vec<u8>) -> Result<impl Stream<Item = Result<Vec<u8>, String>>, String> {
    info!("Unzipping...");
    let cursor = Cursor::new(zip_data);
    let mut zip_archive = ZipArchive::new(cursor)?;
    
    Ok(stream! {
        for i in 0..zip_archive.len() {
            // 处理文件条目也可能出错，同样需要处理
            let mut file = match zip_archive.by_index(i) {
                Ok(file) => file,
                Err(e) => {
                    // 如果某个文件出错，可以 yield 一个错误，然后继续下一个文件或中断
                    // 这里选择记录错误并跳过该文件
                    eprintln!("Error reading file at index {}: {}", i, e);
                    continue;
                }
            };
            
            // 1. 先发送文件名（同样需要包装为 Result）
            let name = file.name().to_string();
            yield Ok(name.clone().into_bytes()); // 将文件名作为 Vec<u8> 发送

            // 2. 再发送文件内容
            let mut data = Vec::new();
            if let Err(e) = file.read_to_end(&mut data) {
                eprintln!("Error reading file content for {}: {}", name, e);
                // 可以选择 yield 一个错误，或者跳过内容发送
                // yield Err(e.to_string());
                continue;
            }
            yield Ok(data); // 将文件内容数据包装在 Ok 中发送
        }
    })

    
}

impl From<zip::result::ZipError> for String {
    fn from(error: ZipError) -> Self {
        error.to_string()
    }
}
*/



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}