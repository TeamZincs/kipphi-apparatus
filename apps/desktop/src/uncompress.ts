// 解压逻辑（含 worker）已经搬进 `@kpa/shared/uncompress`，移动端也用同一份
export { unzip } from '@kpa/shared/uncompress';
export type { UnzipResult, UnzippedFile } from '@kpa/shared/workers/unzip.worker';
