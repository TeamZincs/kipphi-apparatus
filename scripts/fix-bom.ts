/**
 * 去掉源文件里的 UTF-8 BOM。
 *
 * 为什么需要它：`.grain` 的模板会被编译成 DOM，文件开头的 BOM 会变成一个
 * 文本节点（页面上就是 `&#xFEFF;`），在 flex 布局里凭空顶出一条空白。
 * 而且不少编辑器 / 脚本在保存时会自动加回去，所以留个可重复执行的清理命令。
 *
 * 用法：`bun run fix:bom`（默认扫 apps/ 和 packages/）
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dir, '..');

const targets = ['apps', 'packages'];
const extensions = ['.grain', '.ts', '.mts', '.css', '.html', '.json', '.md'];
const skipped = new Set(['node_modules', 'dist', 'build', '.git', 'target', 'gen', 'release', '.svelte-kit']);

const found: string[] = [];

function walk(directory: string): void {
    for (const name of readdirSync(directory)) {
        if (skipped.has(name)) continue;

        const full = join(directory, name);

        if (statSync(full).isDirectory()) {
            walk(full);
            continue;
        }

        if (!extensions.some((extension) => name.endsWith(extension))) continue;

        const bytes = readFileSync(full);

        if (bytes.length < 3 || bytes[0] !== 0xef || bytes[1] !== 0xbb || bytes[2] !== 0xbf) continue;

        // 只去掉开头三个字节，其余字节原样保留（不重新编码，避免连换行一起改掉）
        writeFileSync(full, bytes.subarray(3));
        found.push(relative(root, full));
    }
}

for (const target of targets) walk(join(root, target));

if (found.length === 0) {
    console.log('fix-bom: 干净，没有 BOM');
} else {
    console.log(`fix-bom: 清掉 ${found.length} 个文件的 BOM`);
    for (const file of found) console.log(`  ${file}`);
}
