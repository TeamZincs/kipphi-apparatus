<script module lang="ts">
    import {
        EventMacroTime,
        EventMacroValue,
        MacroEvaluator,
        NoteMacro,
        Op,
    } from "kipphi";
    import type { AnyMacro } from "./store.svelte";

    /** 宏的种类，仅用于显示 */
    export type MacroKind = "note" | "value" | "time" | "evaluator";

    /** 取得宏的表达式。宏求值器的字段名为expression，其余宏为macro */
    export function getMacroExpression(macro: AnyMacro): string {
        return macro instanceof MacroEvaluator ? macro.expression : macro.macro;
    }

    /** 判断宏的种类，用于显示 */
    export function getMacroKind(macro: AnyMacro): MacroKind {
        if (macro instanceof NoteMacro) return "note";
        if (macro instanceof EventMacroTime) return "time";
        if (macro instanceof EventMacroValue) return "value";
        return "evaluator";
    }
</script>

<script lang="ts">
    import { _ } from "#/i18n";
    import { notify } from "#/notify.svelte";
    import Label from "#/components/Label.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import { operationList, selectedMacro } from "./store.svelte";

    let target = $derived<AnyMacro | null>($selectedMacro);
    let expression = $state("");
    let syntaxError = $state("");

    $effect(() => {
        const macro = target;
        expression = macro ? getMacroExpression(macro) : "";
        syntaxError = "";
    });

    const kindText = (macro: AnyMacro) =>
        $_(`main.macro.kind.${getMacroKind(macro)}`);

    function checkSyntax(macro: AnyMacro) {
        if (macro instanceof MacroEvaluator) {
            syntaxError = "";
            return;
        }
        const error = macro.checkSyntax();
        syntaxError = error ? error.message : "";
    }

    function updateExpression() {
        const macro = target;
        if (!macro || getMacroExpression(macro) === expression) {
            return;
        }
        operationList.do(new Op.MacroExpressionChangeOperation(macro, expression));
        checkSyntax(macro);
    }

    function applyMacro() {
        const macro = target;
        if (!macro) {
            return;
        }
        const chart = operationList.chart;
        const count = macro.consumers.size;
        if (macro instanceof NoteMacro) {
            operationList.do(new Op.NoteMacroReevaluateOperation(macro, chart));
        } else if (macro instanceof EventMacroTime) {
            operationList.do(new Op.MacroTimeReevaluateOperation(macro, chart));
        } else if (macro instanceof EventMacroValue) {
            operationList.do(new Op.MacroValueReevaluateOperation(macro, chart));
        } else {
            operationList.do(
                new Op.MacroEvaluatorReevaluateOperation(macro, chart),
            );
        }
        notify($_("main.macro.applied", { values: { count } }), "info");
    }
</script>

{#if !target}
    <div class="hint">{$_("main.macro.noMacro")}</div>
{:else}
    <Label>{kindText(target)}</Label>
    <div class="grid">
        <Label small>{$_("main.macro.id")}</Label>
        <span class="value">{target.id}</span>
        <Label small>{$_("main.macro.consumers")}</Label>
        <span class="value">{target.consumers.size}</span>
        {#if !(target instanceof MacroEvaluator)}
            <Label small>{$_("main.macro.protos")}</Label>
            <span class="value">{target.protoNodes.length}</span>
            <Label small>{$_("main.macro.parametric")}</Label>
            <span class="value">{target.parametric ? "Y" : "N"}</span>
        {/if}
    </div>
    <Label small>{$_("main.macro.expression")}</Label>
    <textarea
        rows="4"
        spellcheck="false"
        bind:value={expression}
        onchange={updateExpression}
    ></textarea>
    {#if syntaxError}
        <span class="error">{syntaxError}</span>
    {:else}
        <span class="hint">{$_("main.macro.expressionDesc")}</span>
    {/if}
    <Button onclick={applyMacro}>{$_("main.macro.apply")}</Button>
    <span class="hint">{$_("main.macro.applyDesc")}</span>
{/if}

<style lang="less" scoped>
    @import "#/components/mixin.less";

    .grid {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 4px;
        width: 100%;
        box-sizing: border-box;
    }

    .value {
        color: var(--color-foreground);
        font-size: var(--font-size-small);
        font-family: "Consolas", monospace;
        overflow-wrap: anywhere;
    }

    .hint {
        color: var(--color-foreground);
        font-size: var(--font-size-small);
        opacity: 0.75;
    }

    .error {
        color: #ff6b6b;
        font-size: var(--font-size-small);
        overflow-wrap: anywhere;
    }

    textarea {
        .input();
        width: 100%;
        box-sizing: border-box;
        resize: vertical;
        font-size: var(--font-size-small);
        color: var(--color-foreground);
        background-color: transparent;
    }
</style>
