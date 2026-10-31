import { Mime } from 'mime';

import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';

/**
 * 统一的 Mime 实例。
 *
 * 直接用 `mime.getType()` 会漏掉一些 RPE/Phira 里常见的扩展名，
 * 而且 `.mp3` 会被识别成 `audio/mpga`（RPE 不认）。
 */
const mime = new Mime(standardTypes, otherTypes);

mime.define({ 'audio/mpeg': ['mp3'] }, true);

export default mime;
