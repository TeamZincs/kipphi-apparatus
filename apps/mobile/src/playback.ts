/**
 * 播放器的纯逻辑：从"当前拍数 + 拖动增量"算出该 seek 到哪里。
 *
 * 抽出来是为了能测 —— 这段以前埋在页面的 `onTimeScroll` 里，线上踩过一个坑：
 * 播放器还没画出第一帧时 `renderingBeats` 是 `NaN`，直接拿它去加会把
 * `audio.currentTime` 写成 `NaN`，于是要等到下一次正常渲染才跟上
 *（表现："进度条第二次才跟随拖动"）。
 */

/** `null` 表示"这一次不该 seek" */
export function resolveSeekTarget(
    baseBeats: number,
    deltaBeats: number
): number | null {
    // 第一帧还没画出来：基数不是有限数，算出来的目标也一定是坏的
    if (!Number.isFinite(baseBeats)) return null;

    // 没有位移就别动 —— `renderingBeats` 的 setter 会写 `audio.currentTime`，
    // 无谓地写一次会打断播放中的平滑推进
    if (!Number.isFinite(deltaBeats) || deltaBeats === 0) return null;

    // 不夹到 0：零前时间是合法的（音符画布能滚到负数），事件画布同理
    return baseBeats + deltaBeats;
}
