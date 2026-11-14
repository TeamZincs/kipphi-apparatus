/**
 * 批量编辑里那段表达式怎么求值。
 *
 * 和 kipphi 自己的表达式求值器（`ExpressionEvaluatorContext`）用**同一套**
 * 注入：`NoteType`、`TC`、`easingFns` / `easingArray` / `rpeEasingArray` /
 * `easingMap`。额外多给两个：`val`（当前值）和 `note`（对象本身）。
 *
 * 注入方式按用户建议走"函数体里解构"：
 *
 * ```js
 * const { NoteType, TC, … } = __ctx;
 * return (val + 1);
 * ```
 *
 * 这样只传一个上下文对象，加字段不用改调用签名。
 */
import { getExpressionEvaluatorContext } from "kipphi";

/** 注入的名字，必须和 `ExpressionEvaluatorContext` 的字段一一对应 */
const SCOPE_KEYS = [
    "NoteType",
    "TC",
    "easingFns",
    "easingArray",
    "rpeEasingArray",
    "easingMap"
] as const;

export type ExpressionEvaluator = (value: any, target: any) => any;

/** 拿不到上下文（库还没初始化）时退化成空表，表达式里这些名字就是 undefined */
function readContext(): Record<string, unknown> {
    try {
        return getExpressionEvaluatorContext() as unknown as Record<
            string,
            unknown
        >;
    } catch {
        return {};
    }
}

/**
 * 把一段表达式编译成 `(value, target) => any`。
 *
 * 语法错误会直接抛（调用方决定是整批失败还是跳过这一条）。
 */
export function compileExpression(code: string): ExpressionEvaluator {
    const context = readContext();

    const fn = new Function(
        "__ctx",
        "val",
        "note",
        `const { ${SCOPE_KEYS.join(", ")} } = __ctx;
return (${code});`,
    ) as (ctx: Record<string, unknown>, value: any, target: any) => any;

    return (value, target) => fn(context, value, target);
}

/** 提示文案里列一下可用名字，别在面板里各写一遍 */
export const EXPRESSION_HELP =
    "`val` 是当前值，`note` 是对象本身；还可用 `TC`（时间换算）、" +
    "`NoteType`、`easingFns` / `easingMap` / `easingArray`。";
