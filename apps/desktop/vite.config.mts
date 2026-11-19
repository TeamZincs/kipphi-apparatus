import { execFileSync } from 'node:child_process';
import {
    existsSync,
    lstatSync,
    readFileSync,
    readdirSync,
    realpathSync,
    statSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, type PluginOption } from 'vite';
import electron from 'vite-plugin-electron';

import grain from '@graints/vite-plugin';

import TAURI_CONF from './src-tauri/tauri.conf.json';

const host = process.env.TAURI_DEV_HOST;

/** 这几个包是本地 link 的项目仓库，各自的 `node_modules` 里可能还压着一份陈旧的 kipphi */
// 画布编辑器已经吸进本仓库（`packages/canvas`），不再是外部 link 包
const LOCAL_KIPPHI_USERS = ['kipphi-player'];

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
 * 本地 link 的包（`kipphi-player`）自己 `node_modules` 里
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

/**
 * 本地软链的编译器，dist 必须比源码「新」。
 *
 * `@graints/vite-plugin` 的入口是 `dist/vite-plugin/index.js`，而它把编译器
 * 整个 bundle 进去了。所以只改 `packages/compiler/**` 的源码、不重新构建，
 * dev 拿到的还是上一次 `bun run build` 的产物 —— **改了代码却完全不生效**。
 *
 * 更坑的是：编译不报错、单元测试也照过（测试直接 import 源码），只有运行时
 * 行为不对，看起来像"编译器有 bug"。
 *
 * 只对软链生效；发布版是 npm 装的普通目录，没有 git 可查，跳过。
 */
const assertCompilerFresh = (root: string): void => {
    const link = join(root, 'node_modules', '@graints', 'vite-plugin');

    if (!existsSync(link)) return;
    if (!lstatSync(link).isSymbolicLink()) return;

    const pluginDir = realpathSync(link);
    const repo = resolve(pluginDir, '..', '..');

    /**
     * 两个包里 `.ts` 源码的最新修改时间。
     *
     * **不用 git 提交时间**：正常的开发顺序是「改代码 → 构建 → 提交」，
     * 构建时刻必然早于提交时刻 —— 拿提交时间当基准，只要构建完随手提交一次
     * 就会误报「dist 比源码旧」，而 dist 里其实已经是最新代码。
     *
     * 文件 mtime 才对应"这份产物是从什么状态编出来的"。
     *
     * 排除项：
     *   · `dist` —— 里面的 `.d.ts` 也是 `.ts` 结尾，会被算进来
     *   · `tests` —— 改测试不该要求重建产物
     */
    const sourceMtime = ((): number => {
        let latest = 0;

        const walk = (dir: string): void => {
            let entries;

            try {
                entries = readdirSync(dir, { withFileTypes: true });
            } catch {
                return;
            }

            for (const entry of entries) {
                const full = join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (entry.name === 'node_modules') continue;
                    if (entry.name === 'dist') continue;
                    if (entry.name === 'tests') continue;

                    walk(full);
                    continue;
                }

                if (!entry.name.endsWith('.ts')) continue;
                // 声明文件是产物，不是源码
                if (entry.name.endsWith('.d.ts')) continue;

                latest = Math.max(latest, statSync(full).mtimeMs);
            }
        };

        walk(join(repo, 'packages', 'compiler'));
        walk(join(repo, 'packages', 'vite-plugin'));

        return latest;
    })();

    if (sourceMtime === 0) return;

    const artifacts = [
        join(pluginDir, 'dist', 'vite-plugin', 'index.js'),
        join(pluginDir, 'dist', 'compiler', 'index.js')
    ];

    const stale = artifacts.filter(
        (file) => !existsSync(file) || statSync(file).mtimeMs < sourceMtime
    );

    if (stale.length === 0) return;

    throw new Error(
        [
            '[grain] 编译器 dist 比源码提交旧，dev 会跑在旧版本上（改了代码却不生效）：',
            ...stale.map(
                (file) =>
                    `  ${file.replace(repo, '<grain>')}  ${existsSync(file) ? statSync(file).mtime.toLocaleString() : '缺失'}`
            ),
            `  源码最后修改: ${new Date(sourceMtime).toLocaleString()}`,
            '',
            '修复：',
            `  cd ${repo}`,
            '  bun run packages:build                    # 构建一次（runtime + vite-plugin）',
            `  # 或者边改边构建：cd ${join(repo, 'packages', 'vite-plugin')} && bun run build:watch`,
            '',
            '顺带一提：单元测试直接 import 源码，所以它不会替你发现这个问题。'
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
        if (['kipphi', 'kipphi-player', '@kpa/canvas'].includes(name)) {
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
const __canvasEditorVersion = getNPMPackageVersion('@kpa/canvas');
const __kipphiVersion = getNPMPackageVersion('kipphi');
const __dependencies = getDependencies();

// 从仓库根往下找（cwd 可能被 bun workspace 改过）
assertSingleKipphi(REPO_ROOT);

// 编译器是本地软链时，dist 太旧就等于没改（改了源码但不重新构建）
assertCompilerFresh(REPO_ROOT);

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
        // lucide 是在仓库根新装的依赖，且只在 `packages/canvas` 里被用到。
        // 不显式列进来的话，它是在"编辑器首次被加载"时才被 Vite 发现并预打包的；
        // 那一刻模块图是旧的，会报出很误导的错误（比如 index.ts 缺某个导出）。
        optimizeDeps: {
            include: ['lucide']
        },
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
