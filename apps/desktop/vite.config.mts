import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, type PluginOption } from 'vite';
import electron from 'vite-plugin-electron';

import grain from '@graints/vite-plugin';

import TAURI_CONF from './src-tauri/tauri.conf.json';

const host = process.env.TAURI_DEV_HOST;

/** 这几个包是本地 link 的项目仓库，各自的 `node_modules` 里可能还压着一份陈旧的 kipphi */
const LOCAL_KIPPHI_USERS = ['kipphi-player', 'kipphi-canvas-editor'];

/** 从 `from` 开始往上找 `node_modules/kipphi`，返回真实路径（找不到返回 null） */
const findKipphi = (from: string): string | null => {
    let dir = from;

    for (;;) {
        const candidate = join(dir, 'node_modules', 'kipphi');

        if (existsSync(candidate)) return realpathSync(candidate);

        const parent = dirname(dir);

        if (parent === dir) return null;

        dir = parent;
    }
};

const kipphiVersion = (dir: string): string => {
    try {
        return JSON.parse(readFileSync(join(dir, 'package.json')).toString()).version ?? '?';
    } catch {
        return '?';
    }
};

/**
 * 全项目只能有一份 `kipphi`。
 *
 * 本地 link 的包（`kipphi-player` / `kipphi-canvas-editor`）自己 `node_modules` 里
 * 如果压着一份旧版，打包器会拿到两份声明：rolldown 直接报
 * `MISSING_EXPORT: "VideoScale" is not exported by ...`（rollup 时代只是被容忍）。
 * 这种错误很难从报错信息看出是"链接不一致"，所以在 dev/build 开始前直接拦掉。
 */
const assertSingleKipphi = (root: string): void => {
    const ownPath = findKipphi(root);

    if (!ownPath) {
        throw new Error('[kipphi] 本项目没装 kipphi —— 先 bun install，再 bun link kipphi');
    }

    const problems: string[] = [];

    for (const name of LOCAL_KIPPHI_USERS) {
        const packageDir = join(root, 'node_modules', name);

        if (!existsSync(packageDir)) continue;

        const realDir = realpathSync(packageDir);
        const found = findKipphi(realDir);

        // 自己也找不到时会往上用到本项目这份，不用管
        if (!found || found === ownPath) continue;

        problems.push(`  ${name}: ${found}  (${kipphiVersion(found)})`);
    }

    if (problems.length === 0) return;

    throw new Error(
        [
            '[kipphi] 检测到多份 kipphi，拒绝启动：',
            `  本项目: ${ownPath}  (${kipphiVersion(ownPath)})`,
            ...problems,
            '',
            '打包器会因为"不是一个包"而报 MISSING_EXPORT（例如 VideoScale）。',
            '修复：在右边那几个目录里各跑一次 `bun link kipphi`。'
        ].join('\n')
    );
};

const TAURI_CONF_VERSION = TAURI_CONF.version;

const noFrontend = process.argv.includes('--no-frontend');
const isElectron = process.argv.includes('--electron');

/** 这个配置所在的目录（=`apps/desktop`）；monorepo 下不能再用 cwd 相对路径 */
const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
/** 仓库根：node_modules / static 都在这一层（bun workspaces 会提升到根） */
const REPO_ROOT = resolve(CONFIG_DIR, '../..');

const getNPMPackageVersion = (packageName: string, stringified = true) => {
    const jsonContent = readFileSync(
        resolve(REPO_ROOT, 'node_modules', packageName, 'package.json')
    ).toString();
    const version = JSON.parse(jsonContent).version;
    console.log(version);
    return stringified ? JSON.stringify(version) : version;
};

const getNPMPackageLicense = (packageName: string) => {
    const jsonContent = readFileSync(
        resolve(REPO_ROOT, 'node_modules', packageName, 'package.json')
    ).toString();
    return JSON.parse(jsonContent).license;
};

const getDependencies = () => {
    const jsonContent = readFileSync(resolve(CONFIG_DIR, 'package.json')).toString();
    const dependencyVersions = JSON.parse(jsonContent).dependencies;
    /** @type {import("./dependency").Dependency[]} */
    const dependencies: { name: string; version: string; license: string }[] = [];
    for (const name in dependencyVersions) {
        if (['kipphi', 'kipphi-player', 'kipphi-canvas-editor'].includes(name)) {
            continue;
        }
        dependencies.push({
            name,
            version: getNPMPackageVersion(name, false),
            license: getNPMPackageLicense(name)
        });
    }
    return JSON.stringify(dependencies);
};

// compute at top level so defineConfig stays sync
const __playerVersion = getNPMPackageVersion('kipphi-player');
const __canvasEditorVersion = getNPMPackageVersion('kipphi-canvas-editor');
const __kipphiVersion = getNPMPackageVersion('kipphi');
const __dependencies = getDependencies();

// 从仓库根往下找（cwd 可能被 bun workspace 改过）
assertSingleKipphi(REPO_ROOT);

// https://vite.dev/config/
export default defineConfig(() => {
    const plugins: PluginOption[] = [];

    if (!noFrontend) {
        // grain 的 d.ts 是对着它自己仓库里的 vite 8 生成的，跟本项目的 vite 6
        // 的 `Plugin` 类型不是同一份声明，这里按 PluginOption 收一下
        plugins.push(grain() as unknown as PluginOption);
    }
    if (isElectron) {
        plugins.push(
            electron([
                {
                    entry: './electron/main.ts',
                    vite: {
                        build: {
                            outDir: 'dist-electron/main'
                        }
                    }
                },
                {
                    entry: './electron/preload.ts',
                    vite: {
                        build: {
                            outDir: 'dist-electron/preload'
                        },
                        esbuild: {
                            format: 'cjs'
                        }
                    }
                }
            ])
        );
    }

    return {
        plugins,
        // 静态目录在仓库根（桌面/移动端共用），不在 apps/desktop 里
        publicDir: resolve(REPO_ROOT, 'static'),
        // Tauri 期望的构建产物目录
        build: {
            outDir: 'build',
            emptyOutDir: true,
            minify: false,
            sourcemap: false,
            cssMinify: false,
            target: 'es2022'
        },
        // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
        //
        // 1. prevent Vite from obscuring rust errors
        clearScreen: false,
        // 2. tauri expects a fixed port, fail if that port is not available
        server: {
            port: 1420,
            strictPort: true,
            host: host || false,
            hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
            watch: {
                // 3. tell Vite to ignore watching `src-tauri`
                ignored: ['**/src-tauri/**']
            }
        },
        define: {
            __APP_VERSION: JSON.stringify(TAURI_CONF_VERSION),
            __PLAYER_VERSION: __playerVersion,
            __CANVAS_EDITOR_VERSION: __canvasEditorVersion,
            __KIPPHI_VERSION: __kipphiVersion,
            __DEPENDENCIES: __dependencies,
            'import.meta.env.VITE_BACKEND': isElectron ? "'electron'" : "'tauri'"
        }
    };
});
