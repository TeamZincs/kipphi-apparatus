# Kipphi-Canvas-editor

此项目是[奇谱发生器](https://github.com/TeamZincs/kipphi-apparatus)的音符列表及事件序列编辑器。由于这两个编辑器使用HTML5 Canvas 2D绘制，使用框架并不能带来明显的开发便利，故与播放器一样被提出主项目，意图是使得此编辑器能够适配其他任何框架，而不仅仅是奇谱发生器所用的Svelte。

相比于奇谱发生器1.x版本的Canvas编辑器，由于追求纯粹的Canvas，编辑器剔除了音符列表编辑器的顶栏和事件曲线编辑器的底栏，所有对编辑器的配置都通过响应式框架的绑定来实现。另外，此项目还将Canvas的创建任务交给了外部，需要使用者自行创建Canvas元素，并将Canvas元素的引用传递给编辑器。

如果要参与开发，并且也要参与 `kipphi` 和 `kipphi-player` 开发，请把它们克隆到本地，然后移除本项目的 `package.json` 中对它们的依赖，改用链接（`bun link`）以获得更好的开发体验。
