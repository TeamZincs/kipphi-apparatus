import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, type PluginOption } from 'vite';

import grain from '@graints/vite-plugin';

/** 这个配置所在的目录（apps/mobile） */
const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
/** 仓库根：静态资源（含默认 respack）与 node_modules 都在这一层 */
const REPO_ROOT = resolve(CONFIG_DIR, '../..');

export default defineConfig(() => ({
    plugins: [grain() as unknown as PluginOption],
    // lucide 是仓库根新装的依赖，只在 packages/canvas 里用到；显式列进来，
    // 免得它被"首次加载时才发现"，那一刻模块图是旧的会报误导性的缺导出
    optimizeDeps: {
        include: ['lucide']
    },
    // 与桌面端共用仓库根的 static（默认 respack 在 static/default 里）
    publicDir: resolve(REPO_ROOT, 'static'),
    build: {
        outDir: 'build',
        emptyOutDir: true,
        minify: false,
        sourcemap: false,
        cssMinify: false,
        target: 'es2022'
    },
    clearScreen: false,
    server: {
        // 桌面端占 1420，移动端让开
        port: 1422,
        strictPort: true,
        host: true
    }
}));
