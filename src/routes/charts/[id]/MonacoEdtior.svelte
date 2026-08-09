<script lang="ts">
    import * as MNC from "monaco-editor";
    const M = MNC as typeof import("monaco-editor");
    import { onDestroy, onMount } from "svelte";
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import Portal from "svelte-portal";
    import TYPES from "./defs.d.ts?raw";
    import KIPPHI_TYPES from "kipphi/index.d.ts?raw";
    

    // import DarkPlus from "./dark_plus.json"
    // const rules = DarkPlus.tokenColors.flatMap(rule => {
    //         return Array.isArray(rule.scope)
    //             ? rule.scope.map(scope => ({ token: scope, ...rule.settings }))
    //             : [{ token: rule.scope, ...rule.settings }];
    //     })
    // M.editor.defineTheme('dark-plus', {
    //     base: 'vs-dark',
    //     inherit: true,
    //     colors: DarkPlus.semanticTokenColors,
    //     rules
    // });
    // console.log(rules)

    
    import { Note, EventNode, EventStartNode, type EventValueESType, Chart, JudgeLine, Op } from "kipphi"; 
    import * as KP from "kipphi";
    import { eventsType, notesEditor, operationList, selectedLineNumber, selectedNode, selectedNodes, selectedNote, selectedNotes } from "./store.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import DestructiveButton from "#/components/buttons/DestructiveButton.svelte";
    import { _ } from "#/i18n";

    interface ScriptingContext {
        selectedNote: Note;
        selectedNotes: Set<Note>;
        selectedNode: EventNode<EventValueESType>;
        selectedNodes: Set<EventNode<EventValueESType>>;
        selectedLine: JudgeLine;
        chart: Chart;
        operationList: Op.OperationList;
        op(fn: (o: Op.ez.ToOperable) => void): void;
    }

    let messages = $state([] as { text: string; type: "error" | "info" }[]);

    function logError(error: Error) {
        messages.push({ text: error.name + ": " + error.message, type: "error" });
    }
    function logInfo(info: string) {
        messages.push({ text: info, type: "info" });
    }

    function execute(code: string) {
        let result;
        try {
            
            const fn = new Function( "KP", "context",
`
const Op = KP.Op;
const { useToOperable, operate, op } = Op.ez;
const { Operation, ComplexOperation } = Op;
const ctx = context;
return ${code}
`
            )
            result = fn(KP, {
                selectedLine: operationList.chart.judgeLines[$selectedLineNumber],
                selectedNode: $selectedNode,
                selectedNote: $selectedNote,
                selectedNodes: $selectedNodes,
                selectedNotes: $selectedNotes,
                operationList: operationList,
                chart: operationList.chart,
                op(fn) {
                    const operation = new Op.ComplexOperation(...KP.Op.ez.operate(operationList.chart, fn))
                    operation.updatesEditor = true;
                    operation.comboDelta = NaN;
                    operationList.do(operation);
                }
            } satisfies ScriptingContext);
        } catch (e) {
            logError(e as Error);
            return;
        }
        if (typeof result === "function") {
            const name = result.name
            if (name) {
                window[name] = result;
                logInfo(result.toString())
            }
            if (typeof result.main === "function") {
                try {
                    result.main();
                } catch (e) {
                    logError(e as Error);
                }
            }
        }
    }


    let editorContainer: HTMLElement;
    let hidden = $state(true);
    const defaultVal = 'ctx.op(o => {\n    \n})';

    self.MonacoEnvironment = {
        getWorker: () => {
            return new tsWorker();
        }
    };

    const TYPES_TEMPLATE = TYPES.slice(1).replace("__GLOBAL__", "global");
    const getTypes = (eventsType: keyof typeof KP.EventType) => {
        return TYPES_TEMPLATE.replace(
            "__ENS_T__",
            eventsType === "text"
                ? "string"
            : eventsType === "color"
                ? "RGB"
            : "number"
        ).replace("__NNLIST_SPECIFIED__", notesEditor?.targetNNList ? "true" : "false")
    }
    $effect(() => {
        if (!hidden) {
            M.typescript.javascriptDefaults.addExtraLib(getTypes($eventsType), "file:///index.d.ts");
        }
    })
    
    const model = M.editor.createModel(defaultVal, "javascript", M.Uri.parse("file:///tmp.js"));
    onMount(() => {
        
        M.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });
        const editor = M.editor.create(editorContainer, {
            model,
            language: 'javascript',
            fontFamily: "Consolas, 'Courier New', monospace",
            wordWrap: 'on',
            automaticLayout: true,
            inlayHints: {
                enabled: 'on'
            },
            theme: 'vs-dark',
            "semanticHighlighting.enabled": true
        });
        
        
        M.typescript.javascriptDefaults.addExtraLib(KIPPHI_TYPES, "file:///kipphi.d.ts");
        M.typescript.javascriptDefaults.addExtraLib(getTypes($eventsType), "file:///index.d.ts");
        
        (M as typeof import("monaco-editor")).typescript.javascriptDefaults.setCompilerOptions({
            target: M.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: M.typescript.ModuleResolutionKind.NodeJs,
            module: M.typescript.ModuleKind.CommonJS,
            noEmit: true,
            allowJs: true,
            checkJs: true,
            strict: true,
            lib: ["es2020", "dom"]
        });
        
    });

    onDestroy(() => {
        model.dispose();
    })
</script>
<svelte:head>
    <!-- <link rel="stylesheet" href="https://esm.sh/monaco-editor@0.55.0/min/vs/editor/editor.main.css"> -->
    <link rel="stylesheet" href="https://esm.sh/monaco-editor@0.55.1?css">
</svelte:head>
<Button onclick={() => { hidden = false }}>{$_("main.script.open")}</Button>
<div class="messages">
    {#each messages as message, i}
        <div class="message {message.type}">
            {message.text}
        </div>
    {/each}
</div>
<Portal target="body">
<div class="wrapper" class:hidden={hidden}>
<div class="editor" bind:this={editorContainer}></div>
<div class="button-container">
<Button onclick={() => execute(model.getValue())}>{$_("main.script.run")}</Button>
<DestructiveButton onclick={() => { hidden = true }}>{$_("main.script.close")}</DestructiveButton>
</div>
</div>
</Portal>
<style scoped lang="less">
    .wrapper {
        padding: 2vh;
        border: 1px solid #ccc;
        height: 80vh;
        width: 60vw;
        position: fixed;
        z-index: 1145;
        top: 10vh;
        right: 50vh;
        border-radius: 0.5vh;
        background-color: #ccc;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        &.hidden {
            display: none;
        }
    }
    .editor {
        width: 100%;
        flex: 1;
    }
    .button-container {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }
    .messages {
        display: flex;
        width: 100%;
        flex-direction: column;
        row-gap: 0.2vh;
        background-color: #ddd;
        color: #1a1b1c;
        .message {
            white-space: pre-wrap;
            padding: 0.3vh;
            border-left: 2px solid;
            &.error {
                border-left-color: red;
            }
            &.info {
                border-left-color: blue;
            }
        }
    }
</style>
