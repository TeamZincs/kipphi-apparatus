import { Mime } from "mime";

import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';

const mime = new Mime(standardTypes, otherTypes);

mime.define({
    "audio/mpeg": ["mp3"] // RPE不认识.mpga
}, true)

export default mime;
