# 贡献指南

奇谱发生器（Kipphi Apparatus）用 **Tauri + Grain** 开发，没有引入第三方组件库，样式和交互都是自己写的。

除 Tauri 初始化的骨架外，本项目**不写 Rust**：文件系统走 `@tauri-apps/plugin-fs`（底层是 Rust，但不用自己写），压缩包在前端 Worker 里用 `jszip` 解。

## 仓库结构

这是一个 bun workspaces + monorepo：

```
apps/desktop     桌面端（Tauri 1 时代的配置，Electron 备用），谱面编辑器主体
apps/mobile      移动端（Tauri 2），竖屏编辑器
packages/shared  @kpa/shared —— 桌面端与 Tauri 打交道的唯一入口（fs / 解压 / mime / 后台命令）
packages/canvas  @kpa/canvas —— 两块画布编辑器的内核（音符 / 事件曲线），两端共用
static/          两端共享的资源：phigros 字体、打击音效、锚点图、web-demuxer.wasm
scripts/         仓库级脚本（fix-bom 等）
```

依赖方向是单向的：`apps/*` 可以依赖 `packages/*`，反过来不行。

两条约定：

- 桌面端**不要**在页面里直接 `import '@tauri-apps/plugin-fs'`，走 `@kpa/shared`。移动端的命令集不一样，它有自己的一层 `apps/mobile/src/tauri.ts`。
- 只有在**多处复用**的组件才配进共享目录（`packages/`）；只在一个页面用的，就放在那个路由目录旁边，别为了"拆得细"而拆。

## 环境准备

1. 安装 Git，克隆仓库。建议先 `Fork` 再克隆自己的复刻：`git clone https://github.com/<你的用户名>/kipphi-apparatus`。
2. 安装 [Bun](https://bun.sh)（不要用 `npm install bun -g`，按官网给的方式装）。建议用 VSCode。npm 也能跑，但不保证全部脚本可用；**不建议 pnpm**（虽然 Grain 自己用它）。
3. 安装 Rust 工具链：参考 [Tauri 官方文档](https://tauri.app/start/prerequisites/)。
4. 安装依赖：

   ```sh
   bun install
   ```

   注意 `kipphi`、`kipphi-player`、`@graints/*` 都是 `link:` 依赖（作者本地链接的），`bun install` 之后如果解析不到，说明这几个仓库没克隆到同级目录。
5. 试构建：`bun run dev`（桌面端）或 `bun run dev:mobile`（移动端）。

### 如果你也要改 `kipphi` / `kipphi-player` / `grain`

```sh
# 在那些仓库里
bun install
# 回到本项目
bun install
```

`package.json` 里已经是 `link:kipphi` / `link:kipphi-player` / `link:@graints/runtime` 的形式，改完源码重启一下 vite 即可（runtime 有 HMR；**编译器改动见下面**）。

## 常用命令

根目录：

| 命令 | 作用 |
|---|---|
| `bun run dev` | 桌面端 Vite dev |
| `bun run dev:mobile` | 移动端（竖屏）`tauri dev` |
| `bun run tauri` | 桌面端 `tauri dev` |
| `bun run build` | 桌面端构建 |
| `bun run typecheck` | 桌面端类型检查 |
| `bun run locales` / `watchLocales` | 生成 / 监听 i18n 类型 |
| `bun run fix:bom` | 清掉源码里的 UTF-8 BOM（见下） |

移动端没有从根目录代理 `typecheck`，需要自己进目录：

```sh
cd apps/mobile && bun run typecheck
```

### 改了 Grain 编译器怎么办

Grain 的编译器是通过 `@graints/vite-plugin` 注入的，而**插件在 dev server 启动时就加载好了**。所以：

```sh
cd ../grain && bun run packages:build   # 重新打包 runtime + vite-plugin
# 然后重启本项目 dev server
```

只改 `.grain` 文件不用管这条，HMR 会处理。

## 写 Grain 的几个约定

这些坑的共同点是：**不报错，只是行为不对**，所以写在这里。

- `$node({ listen })` 里的 `listen` **必须写成内联箭头函数**：

  ```ts
  // 对：编译器认这个形状
  const rows = $node({ get: () => ..., listen: (update) => store.subscribe(update) });

  // 错：被抽成常量之后会被静默丢掉，数据永远不刷新
  const listen = (update) => store.subscribe(update);
  const rows = $node({ get: () => ..., listen });
  ```

- 别在组件顶层声明 `children` / `props`：它们是编译器生成函数的参数名（已经加了 `__` 前缀，但别赌）。
- `{#if}` 切分支时会**销毁**旧分支（跟 Svelte 一致）。要保留状态就在分支内容的直接子节点上写 `grain:keepalive`。
- 结构变了（增删判定线）走 `needsreflow → reflowAll`；只有数值在变（播放时的 x / y / θ / α）走 `refreshAll`。两者分开，别把所有刷新都塞进 `reflowAll`。
- 子类重声明**没有初始化器**的字段要用 `declare`：`tsconfig` 是 `target: ES2022`，`useDefineForClassFields` 开着，普通声明会把基类构造函数赋的值覆盖成 `undefined`。
- `.grain` 文件不要带 BOM。虽然编译器现在会剥掉，但历史坑是它被当成文本节点渲染出来，凭空顶出一行。改完跑一次 `bun run fix:bom`。

## 渲染与性能约定

已经踩过一轮，别改回去：

- **画布编辑器只在播放器的 `drawn` 回调里画**，不要自己开 `requestAnimationFrame` 循环追着播放器画。
- 播放进度条 / 时间文字**直接写 DOM**（`progressEl.value = ...`），不要每帧 `store.set()` —— 那会触发整块模板的槽位重算。
- 编辑器画布的**位图尺寸 = 显示尺寸**（1:1），不要"大位图 + CSS 缩放"，会发虚，事件编辑器还会错位。
- 移动端三个标签页用 `visibility` 常驻，不用 `{#if}` 切换（画布实例不能反复销毁重建）。

## 移动端和桌面端的刻意差异

| | 桌面端 | 移动端 |
|---|---|---|
| 布局 | 侧边栏 + 播放器 | 播放器在上、tabs 居中、内容在下，整页不滚动 |
| 圆角/内边距 | 有 | 全部去掉，贴边 |
| 时间 | 播放器与编辑器各自的滚动逻辑 | 播放器是唯一时间源，编辑器跟着 `drawn` |
| 手势 | 滚轮 / 拖拽 | 拖动才暂停、双击播放暂停、控制条 5s 自动收起 |

改移动端之前先看看桌面端是怎么做的，**行为尽量对齐，布局按屏幕适配**。

## 国际化

- 文案在 `apps/desktop/src/locales/{zh-Hans,zh-Hant,en}.json`；
- 改了文案要重新生成类型：`bun run locales`；开发时常驻 `bun run watchLocales`；
- 基本只做简体中文，繁体和英文由 AI 翻译后再进制谱器扫一眼 —— 翻译有时会过长把组件撑破，删掉不必要的词即可；
- 欢迎小语种贡献。移动端暂时没有 i18n。

## 数据与资源

- 谱面存在应用数据目录里（由 Tauri 命令写入），导入压缩包时**除 `info.txt` / `metadata.json` / 谱面本身 / 音频 / 曲绘之外的文件会原样带进去**（视频、着色器、纹理都在这一类）；
- `static/` 是两端共享的：字体（`cmdysj.ttf`）、打击音效（`Tap/Drag/Flick.wav`）、锚点图（`Anchor/Below/selectNote/...`）、`web-demuxer.wasm`。加资源时两边都能用上。

## 提交

- 提交信息用 `type(scope): 中文摘要`，正文说**为什么**；
- 把手写改动和工具/格式化改动**分开提交**，别让一次提交里混着"改逻辑"和"清 BOM"；
- 不要 `git add -A <某个目录>` —— 很容易把别人（或别的会话）没提交的改动卷进来；
- 注释写"为什么这么做"，不要写"把 x 设成 y"（代码本身已经说了）。

## 一些点，我写在这里

- `apps/desktop/src-tauri/capabilities/default.json` 直接改就行，奇谱发生器不需要多套权限配置。
  - 权限里的 `$APPDATA` 指的是**本应用**的数据目录，不是用户的通用应用数据目录。
- grain 用 `$node({ get, listen })` 表达派生值 + 订阅，没有 `$effect`。如果遇到"依赖没被追踪"，先检查 `listen` 是不是内联箭头（见上）。
- 扩展/编译器的调试：VSCode 里 `Grain: Restart analysis (clear caches)` 可以清掉分析缓存重来，比重启窗口快。
