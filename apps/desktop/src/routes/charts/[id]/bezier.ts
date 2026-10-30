import { BezierEditor } from 'kipphi-canvas-editor';

/**
 * 贝塞尔曲线编辑器的单例。
 *
 * 原先它挂在 `BezierEditor.svelte` 的 `<script module>` 里（跨实例共享）。
 * 抽成独立模块之后，数值输入框那侧也能直接推值进画布。
 */
export const canvasEditor = new BezierEditor();
