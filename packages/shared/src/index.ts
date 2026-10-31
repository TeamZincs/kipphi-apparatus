/**
 * 桌面端 / 移动端共用的逻辑层。
 *
 * 现在只有 Tauri 读写那一层（`background/tauri`）加上它依赖的 mime 与解压；
 * 之后再往这里搬 store、i18n、autosave 这些。
 */
export * from './mime';
export * from './uncompress';
export * from './background/tauri';
