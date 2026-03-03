# 贡献指南

本项目使用Tauri+Svelte开发，未使用第三方组件库。

原则上，本项目不会添加Rust后端代码。对文件系统的访问通过`@tauri-apps/plugin-fs`（本质上仍然用了Rust代码但是不用自己写）实现。解压缩文件的功能在前端WebWorker中使用`jszip`实现。

## 安装和构建
0. 安装Git，克隆项目到本地。建议先点击右上角的`Fork`按钮创建一个复刻版本，然后克隆自己的复刻仓库到本地：`git clone https://github.com/<你的用户名>/kipphi-apparatus`。

1. 安装Bun（不建议使用`npm install bun -g`，推荐在[https://bun.sh]上选择自己电脑对应的安装命令并输入到命令行）。建议使用VSCode开发。Node.js和NPM亦可，但不确定是否能使用全部功能。

2. 安装Rust等工具链：参考[Tauri官方文档](https://tauri.app/start/prerequisites/)。

3. 安装全部依赖
  - `bun install` 或 `npm install`。
  - 由于作者直接将 `kipphi` 和 `kipphi-player` 本地链接到此项目，因此需要单独安装 `kipphi` 和 `kipphi-player`。运行：`bun add kipphi` 和 `bun add kipphi-player`。
  - 如果你也有意开发 `kipphi` 和 `kipphi-player`：
    - 请克隆这两个仓库，导航到它们的目录。
    - 运行 `bun link` 或 `npm link`。
    - 导航到本项目的目录，运行 `bun link kipphi` 和 `bun link kipphi-player`。
    - （可能还需要到 `kipphi-player` 里去链接 `kipphi`）

4. 测试构建：`bun tauri dev` 或 `npm run tauri dev`，若无异常可进行下一步开发。

## 开发
### 国际化
启动一个终端，运行 `bun watchLocales` 或 `npm run watchLocales`。脚本会监听 `src/locales` 目录下的文件并自动生成 `src/i18n-types.d.ts` 文件。如果你不需要更新本地化文件，则无需运行此脚本。

基本上只做中文简体，繁体和英文的翻译用AI完成，再进入制谱器稍微看一下，有的时候翻译得太长了组件撑破，可以稍微删掉一些不需要的词。

本项目欢迎小语种翻译的贡献。

### 组件范式
由于本项目使用Svelte，但是 `kipphi` 和 `kipphi-canvas-editor` 是原生JS，需要一些方式来保证正确的状态管理。

对于一个谱面内的对象，不要直接引用它的属性，这样无法产生响应式。而是应当创建一个 `values` 响应式变量，然后使用 `kipphi` 的 `operationList.addEventListener()` 来监听谱面编辑，然后更新 `values` 变量。

同时，为了保证 `target` 更新时（即切换了目标，但并不是编辑，因此无法用谱面编辑监听），`values` 正常更新，需要适当使用 `$effect`。

尽量不要使用过于复杂的 `$effect`，因为有循环依赖的风险。


## 一些点，我写在这里
- Svelte 和 Tauri 有一个共同点：都有多个大版本，而且AI了解这两个大版本。如果使用AI编程，跟它说话一定要讲清楚是Tauri 2和Svelte 5，免得它产生幻觉，用Tauri 1和Svelte 4的东西乱说。
- `src-tauri/capabilities/default.json` 直接改就行，奇谱发生器不需要多个权限配置。
  - 权限配置中，`$APPDATA` 指的是奇谱发生器的应用数据目录，而不是用户应用数据目录。
- 有的时候会遇到 `$effect` 第一次运行时某些条件没有满足导致无法正确追踪变量，此时可以在头部裸奔一个变量来保证建立引用。