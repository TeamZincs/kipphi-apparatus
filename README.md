# Kipphi Apparatus 2
[Click here](https://pgrfm.miraheze.org/wiki/奇谱发生器)

本项目为KPA的2.x版本，基于Tauri+Svelte开发。其谱面内核代码和谱面播放器代码作为NPM包分别单独发布。您可在本组织（TeamZincs）的其他GitHub仓库中找到。

`/public`下的图片和音频文件均由本人手制，质量不佳。如果您有更好的原创打击特效、音效、音符纹理且愿意将其作为本软件的默认资源包，欢迎贡献。

`/public/cmdysj.ttf`为字体文件，直接来自于Re:PhiEdit。

## 参与开发
请参考[贡献指南](./contributing.md)

## 与KPA 1.x的差距
当前只迁移了一部分KPA 1内容。另外由于架构的变化，模组机制可能会难以实现。

本制谱器不会计划支持着色器。


|      功能     | KPA1 | KPA2 |
|--------------|------|------|
| 扩展事件层     |   Y   |   Y   |
| 父线          |   Y   |   Y   |
| 多事件/音符编辑 |   Y   |   N   |
| 用户脚本       |   Y   |   N   |
| 版本控制       |   Y   |   Y   |
| 宏            |   N   |   N   |
| 模组          |   Y   |   N   |
