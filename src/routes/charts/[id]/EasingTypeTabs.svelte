<script lang="ts">
    import { SelectionManager } from "kipphi-canvas-editor";
    import type { LTWH } from "kipphi-canvas-editor/notesEditor";
    import { identity, type Matrix33 } from "kipphi-player";
    import { getCanvasCoordFromEvent, on } from "kipphi-canvas-editor/util";
    import {
        Easing,
        EasingType,
        NormalEasing,
        TemplateEasing,
        SegmentedEasing,
        BezierEasing,
        easingArray,
    } from "kipphi";

    import RadioTabs from "#/components/RadioTabs.svelte";
    import EasingBox from "./EasingBox.svelte";
    import SuggestionInput from "#/components/Inputs/SuggestionInput.svelte";
    import BezierEditor from "./BezierEditor.svelte";
    import Button from "#/components/buttons/Button.svelte";
    import { _ } from "#/i18n";
    import { operationList } from "./store.svelte";
    import { rpeEasingArray } from "kipphi";

    type Points = [number, number, number, number];

    const NORMAL = EasingType.normal;
    const BEZIER = EasingType.bezier;
    const TEMPLATE = EasingType.template;

    // ============================================================
    //  EasingCanvas — 缓动曲线绘制 / 区间拖拽交互
    // ============================================================
    class EasingCanvas extends EventTarget {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        rect: LTWH;
        padding: number;
        selectionManager: SelectionManager<"left" | "right"> = new SelectionManager();
        elementMatrix: Matrix33;
        elementMatrixInverted: Matrix33;
        holding: "left" | "right" | null = null;
        nodeSize: number = 32;

        constructor(canvas: HTMLCanvasElement, rect: LTWH) {
            super();
            this.canvas = canvas;
            this.context = this.canvas.getContext("2d")!;
            this.context.font = "30px phigros";
            this.context.textBaseline = "top";
            this.rect = rect;
            this.padding = 10;

            const resize = () => {
                const r = this.canvas.getBoundingClientRect();
                this.elementMatrix = identity.scale(r.width / canvas.width, r.height / canvas.height);
                this.elementMatrixInverted = this.elementMatrix.invert();
            };
            const observer = new ResizeObserver(resize);
            observer.observe(canvas);
            resize();

            on(["mousedown", "touchstart"], this.canvas, (e) => {
                const offset = getCanvasCoordFromEvent(e, this.canvas, this.elementMatrixInverted, identity);
                const selection = this.selectionManager.click(offset);
                if (selection && !this.holding) {
                    this.holding = selection.target;
                }
                this.draw(this.lastEasing);
            });
            on(["mousemove", "touchmove"], this.canvas, (e) => {
                if (!this.holding) return;
                const offset = getCanvasCoordFromEvent(e, this.canvas, this.elementMatrixInverted, identity);
                let arg = (offset.x - this.padding) / (this.rect[2] - this.padding * 2);
                arg = Math.min(Math.max(arg, 0), 1);
                if (this.holding === "left") {
                    this.redrawWithNewBounds(arg, null);
                } else {
                    this.redrawWithNewBounds(null, arg);
                }
            });
            on(["mouseup", "touchend", "mouseleave"], this.canvas, () => {
                if (!this.holding) return;
                this.holding = null;
                this.dispatchEvent(new CustomEvent("change", { detail: this.lastEasing }));
            });
        }

        // @ts-expect-error
        override addEventListener(type: "change", callback: (e: CustomEvent<Easing>) => void): void {
            return super.addEventListener(type, callback as any);
        }

        lastEasing: TemplateEasing | NormalEasing | SegmentedEasing;

        draw(easing: TemplateEasing | NormalEasing | SegmentedEasing) {
            this.selectionManager.refresh();
            this.lastEasing = easing;
            const width = this.rect[2], pad = this.padding;
            const w = this.rect[2] - this.padding * 2, h = this.rect[3];
            const isSegmented = easing instanceof SegmentedEasing;
            const easingLeft = isSegmented ? easing.left : 0;
            const easingRight = isSegmented ? easing.right : 1;
            const context = this.context;
            const inner = isSegmented ? easing.easing : easing;

            context.clearRect(0, 0, width, h);
            context.fillStyle = "#222";
            context.fillRect(0, 0, width, h);
            context.fillStyle = "#fff3";
            context.fillText(easingLeft.toFixed(6), 10, 10);
            context.fillText(easingRight.toFixed(6), 10, 50);
            context.fillText(this.holding + "", 200, 50);
            context.fillStyle = "#2f93";
            context.fillRect(pad, h * 0.5, w, h / 3);

            const bgPath = new Path2D();
            const path1 = new Path2D();
            const path2 = new Path2D();
            const path3 = new Path2D();

            const forbidden = this.holding === "left"
                ? inner.getValue(easingRight)
                : inner.getValue(easingLeft);
            let lastPoint: number | null = null;
            const checkForbidden = !this.holding
                ? (): void => undefined
                : () => {
                      if (value === forbidden) {
                          if (!lastPoint) {
                              lastPoint = i + pad;
                          }
                      } else {
                          if (lastPoint) {
                              bgPath.rect(lastPoint, h / 6, i + pad - lastPoint, h / 3);
                              lastPoint = null;
                          }
                      }
                  };

            path1.moveTo(pad, h * 0.5);
            let i = 0;
            let value: number | undefined;
            let y = h * 0.5;
            for (; i < w * easingLeft; i += 2) {
                value = inner.getValue(i / w);
                checkForbidden();
                y = (h / 3) * (1 - value) + h / 6;
                path1.lineTo(i + pad, y);
            }

            path2.moveTo(i + pad, y);
            const leftTop = [i + pad, y] as const;
            for (; i < w * easingRight; i += 2) {
                value = inner.getValue(i / w);
                checkForbidden();
                y = (h / 3) * (1 - value) + h / 6;
                path2.lineTo(i + pad, y);
            }

            path3.moveTo(i + pad, y);
            const rightBottom = easingRight === 1
                ? ([w + pad, h / 6] as const)
                : ([i + pad, y] as const);

            for (; i <= w; i += 2) {
                value = inner.getValue(i / w);
                checkForbidden();
                y = (h / 3) * (1 - value) + h / 6;
                path3.lineTo(i + pad, y);
            }
            value = undefined;
            checkForbidden();

            if (this.holding) {
                context.fillStyle = "#f006";
                context.fill(bgPath);
            }
            context.lineWidth = 3;
            context.strokeStyle = "#fff";
            context.stroke(path1);
            context.strokeStyle = "#df6";
            context.stroke(path2);
            context.strokeStyle = "#fff";
            context.stroke(path3);

            if (isSegmented) {
                context.fillStyle = "#df63";
                context.fillRect(leftTop[0], leftTop[1], rightBottom[0] - leftTop[0], rightBottom[1] - leftTop[1]);
                context.strokeStyle = "#2f7a";
                context.beginPath();
                context.moveTo(pad, (h * 5) / 6);
                for (let i = 0; i <= w; i += 2) {
                    value = easing.getValue(i / w);
                    y = (h / 3) * (1 - value) + h / 2;
                    context.lineTo(i + pad, y);
                }
                context.stroke();
            }

            const ns = this.nodeSize;
            const half = ns / 2;
            context.fillStyle = "#5cfc";
            context.fillRect(pad + easingLeft * w - 2, 0, 4, h / 2);
            context.fillRect(pad + easingLeft * w - half, h / 2, ns, ns);
            this.selectionManager.add({
                target: "left",
                left: pad + easingLeft * w - half,
                top: h / 2 - half,
                width: ns,
                height: ns,
                priority: 1,
            });
            context.fillStyle = "#f20c";
            context.fillRect(pad + easingRight * w - 2, 0, 4, h / 2);
            context.fillRect(pad + easingRight * w - half, h / 2, ns, ns);
            this.selectionManager.add({
                target: "right",
                left: pad + easingRight * w - half,
                top: h / 2 - half,
                width: ns,
                height: ns,
                priority: easingRight < 0.5 ? 2 : 1,
            });
        }

        redrawWithNewBounds(left: number | null, right: number | null) {
            try {
                const newEasing = EasingCanvas.getNewEasing(this.lastEasing, left, right);
                this.draw(newEasing as any);
            } catch (_e) {}
        }

        static getNewEasing(easing: Easing, left: number | null, right: number | null) {
            const isSegmented = easing instanceof SegmentedEasing;
            const inner = isSegmented ? easing.easing : easing;
            const easingLeft = isSegmented ? easing.left : 0;
            const easingRight = isSegmented ? easing.right : 1;
            left ??= easingLeft;
            right ??= easingRight;
            if (right < left) {
                throw new Error("invalid bounds");
            }
            return left === 0 && right === 1 ? inner : new SegmentedEasing(inner, left, right);
        }
    }

    // ============================================================
    //  Props / 组件逻辑
    // ============================================================
    interface Props {
        easingType: EasingType;
        easing: Easing;
        ongototemplate?: () => void;
    }

    let {
        easingType = $bindable(EasingType.normal),
        easing = $bindable(easingArray[1]),
        ongototemplate,
    }: Props = $props();

    // ---- canvas ----
    let canvas: HTMLCanvasElement = $state(null);
    let easingCanvas: EasingCanvas | null = $state(null);

    $effect(() => {
        if (!canvas) return;
        const ecvs = new EasingCanvas(canvas, [0, 0, 300, 600]);
        ecvs.addEventListener("change", (e) => {
            easing = e.detail;
        });
        easingCanvas = ecvs;
    });

    $effect(() => {
        if (easing && easingCanvas) {
            easingCanvas.draw(easing as any);
        }
    });

    // ---- easing 辅助访问器 ----
    function getEasingId(): number {
        const inner = easing instanceof SegmentedEasing ? easing.easing : easing;
        console.log("!11")
        return inner instanceof NormalEasing ? inner.rpeId : 1;
    }
    function setEasingId(v: number) {
        const newInner = rpeEasingArray[v];
        easing = easing instanceof SegmentedEasing
            ? new SegmentedEasing(newInner, easing.left, easing.right)
            : newInner;
    }

    function getBezierPoints(): Points {
        const inner = easing instanceof SegmentedEasing ? easing.easing : easing;
        if (inner instanceof BezierEasing) {
            return [...inner.cp1, ...inner.cp2] as Points;
        }
        return [0, 0, 1, 1];
    }
    function setBezierPoints(v: Points) {
        const newInner = new BezierEasing([v[0], v[1]], [v[2], v[3]]);
        easing = easing instanceof SegmentedEasing
            ? new SegmentedEasing(newInner, easing.left, easing.right)
            : newInner;
    }
    let templateName = $state('');
    $effect(() => {
        if (easing instanceof TemplateEasing) {
            templateName = easing.name;
        }
    })
    function setTemplateName(v: string) {
        const t = operationList.chart.templateEasingLib.get(v);
        templateName = v;
        if (!t) return;
        easing = easing instanceof SegmentedEasing
            ? new SegmentedEasing(t, easing.left, easing.right)
            : t;
    }

    // ---- segment bounds ----
    const segmentLeft = $derived(
        easing instanceof SegmentedEasing ? easing.left : 0,
    );
    const segmentRight = $derived(
        easing instanceof SegmentedEasing ? easing.right : 1,
    );

    function updateSegmentBounds(left: number, right: number) {
        const inner = easing instanceof SegmentedEasing ? easing.easing : easing;
        easing = left === 0 && right === 1
            ? inner
            : new SegmentedEasing(inner, left, right);
    }

    // ---- template suggestions ----
    async function getSuggestions(input: string): Promise<string[]> {
        return operationList.chart.templateEasingLib.easings.keys().toArray().filter(k => k.startsWith(input));
    }
</script>

<RadioTabs
    name="easing"
    options={[NORMAL, BEZIER, TEMPLATE]}
    displayTexts={[
        $_("main.event.easings.normal"),
        $_("main.event.easings.bezier"),
        $_("main.event.easings.template"),
    ]}
    bind:currentOption={easingType}
>
    {#snippet page(option)}
        {#if option === NORMAL}
            <EasingBox
                bind:value={() => getEasingId(), (v) => setEasingId(v)}
            ></EasingBox>
        {:else if option === BEZIER}
            <input
                type="text"
                value={getBezierPoints().map((n) => n.toFixed(2)).join(" ")}
                onchange={(e) => {
                    const that = e.target as HTMLInputElement;
                    const arr = that.value.trim().split(/\s+/);
                    if (arr.length === 4) {
                        setBezierPoints(arr.map(parseFloat) as Points);
                    }
                }}
            />
            <BezierEditor
                bind:value={() => getBezierPoints(), (v) => setBezierPoints(v)}
            ></BezierEditor>
        {:else if option === TEMPLATE}
            <SuggestionInput
                bind:value={() => templateName, (v) => setTemplateName(v)}
                getSuggestions={getSuggestions}
            ></SuggestionInput>
            <Button onclick={() => ongototemplate?.()}>
                {$_("main.event.goto")}
            </Button>
        {/if}
        <input
            style:display={option === BEZIER ? "none" : ""}
            type="text"
            value={[segmentLeft, segmentRight].map((n) => n.toFixed(6)).join(" ")}
            onchange={(e) => {
                const that = e.target as HTMLInputElement;
                const arr = that.value.trim().split(/\s+/);
                if (arr.length === 2) {
                    const left = parseFloat(arr[0]);
                    const right = parseFloat(arr[1]);
                    if (
                        left < 0 || left > 1 ||
                        right < 0 || right > 1 ||
                        isNaN(left) || isNaN(right) ||
                        right < left
                    ) {
                        return;
                    }
                    updateSegmentBounds(left, right);
                }
            }}
        />
        <canvas
            style:display={option === BEZIER ? "none" : ""}
            bind:this={canvas}
            width="300"
            height="600"
        ></canvas>
    {/snippet}
</RadioTabs>
