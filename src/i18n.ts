import { register, init, getLocaleFromNavigator, format } from "svelte-i18n";
import type {I18nMapping} from "./i18n-types";

// 以下内容复制自svelte-i18n的源代码，旨在提供模块增强
// The following type annotations are copied from the source code of svelte-i18n,
// aiming to provide module augmentation
// 按照MIT协议授权。
// Licensed under the MIT License.
/**
 * @license MIT
 * 
 * @copyright 2017 Christian Kaisermann <christian@kaisermann.me>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { type Readable } from 'svelte/store';
import { type FormatXMLElementFn } from 'intl-messageformat';



type InterpolationValues<T extends keyof I18nMapping> = Record<I18nMapping[T], string | number | boolean | Date | FormatXMLElementFn<unknown> | null | undefined> | undefined;
interface MessageObject<T extends keyof I18nMapping> {
    id: T;
    locale?: string;
    format?: string;
    default?: string;
    values?: I18nMapping[T] extends never ? never : InterpolationValues<T>;
}
type MessageFormatter = <T extends keyof I18nMapping>(id: T | MessageObject<T>, options?: Omit<MessageObject<T>, 'id'>) => string;

// 以上复制的代码到此结束。
// The copied code ends here.




// register("en", () => import("./locales/en.json"));
register("zh-Hans", () => import("./locales/zh-Hans.json"));

init({
    fallbackLocale: "zh-Hans",
    initialLocale: getLocaleFromNavigator()
});

const myFormat = format as Readable<MessageFormatter>;

export { myFormat as _ }
