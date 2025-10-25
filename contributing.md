# 贡献指南

本项目使用Tauri+Svelte开发，未使用第三方组件库。

原则上，本项目不会添加Rust后端代码。对文件系统的访问通过`@tauri-apps/plugin-fs`（本质上仍然用了Rust代码但是不用自己写）实现。解压缩文件的功能在前端WebWorker中使用`jszip`实现。

## 安装和构建
0. 安装Git，克隆项目到本地。建议先点击右上角的`Fork`按钮创建一个复刻版本，然后克隆自己的复刻仓库到本地：`git clone https://github.com/<你的用户名>/kipphi-apparatus`。

1. 安装Bun（不建议使用`npm install bun -g`，推荐在[https://bun.sh]上选择自己电脑对应的安装命令并输入到命令行）。建议使用VSCode开发。Node.js和NPM亦可，但不确定是否能使用全部功能。

2. 安装Rust等工具链：参考[Tauri官方文档](https://tauri.app/start/prerequisites/)。

3. 安装全部依赖
  - `bun install`或`npm install`。
  - 由于作者直接将`kipphi`和`kipphi-player`本地链接到此项目，因此需要单独安装`kipphi`和`kipphi-player`。运行：`bun add kipphi`和`bun add kipphi-player`。
  - 如果你也有意开发`kipphi`和`kipphi-player`：
    - 请克隆这两个仓库，导航到它们的目录。
    - 运行`bun link`或`npm link`。
    - 导航到本项目的目录，运行`bun link kipphi`和`bun link kipphi-player`。
    - （可能还需要到`kipphi-player`里去链接`kipphi`）

4. 测试构建：`bun tauri dev`或`npm run tauri dev`，若无异常可进行下一步开发。

## 开发
### 国际化
启动一个终端，运行`bun watchLocales`或`npm run watchLocales`。脚本会监听`src/locales`目录下的文件并自动生成`src/i18n-types.d.ts`文件。如果你不需要更新本地化文件，则无需运行此脚本。


