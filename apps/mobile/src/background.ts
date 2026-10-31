/**
 * 数据层直接复用桌面端那一份（`@kpa/shared/background/tauri`）。
 *
 * 磁盘格式、目录约定、导入导出逻辑两端完全一致，移动端不另写一遍。
 */
export * from '@kpa/shared/background/tauri';
