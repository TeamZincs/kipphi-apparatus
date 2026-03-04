

import * as KP from "kipphi";
import { TC, type Note, type EventNode } from "kipphi";
import { operationList } from "./store.svelte";


// Helper function for fillCurve
function processTimeArg(time: any): number {
    if (typeof time === "string") {
        try {
            const match = time.match(/^(\d+):(\d+)\/(\d+)$/);
            if (!match) throw new Error(`Invalid time format: ${time}`);
            return processTimeArg(
                match.map((s) => parseInt(s)) as [number, number, number],
            );
        } catch (e) {
            throw new Error(`Invalid time format: ${time}`);
        }
    } else if (typeof time === "number") {
        return time;
    } else {
        time = [...time];
        TC.validateIp(time);
        return TC.toBeats(time);
    }
}

export function fillCurve(note: Note | EventNode, easingFunc: any, start: [KP.TimeT, number], end: [KP.TimeT, number]): number {
    if (typeof easingFunc === "function") {
        // Already a function
    } else if (easingFunc && typeof easingFunc.getValue === "function") {
        const fn = easingFunc.getValue.bind(easingFunc);
        easingFunc = fn;
    }

    const startBeats = processTimeArg(start[0]);
    const endBeats = processTimeArg(end[0]);
    const timeDelta = endBeats - startBeats;
    const valueDelta = end[1] - start[1];

    const noteTime = "startTime" in note ? note.startTime : note.time;
    const noteBeats = TC.toBeats(noteTime);

    return easingFunc((noteBeats - startBeats) / timeDelta) * valueDelta + start[1];
};

const DESTRUCT = `const { easingFns, TC } = KP;
const { ${Object.keys(KP.easingFns).join(', ')} } = easingFns;`;

export function createFunction<T extends "note" | "node">(code: string, objName: T) {
    type Obj = T extends "note" ? Note : EventNode
    const fn = new Function(
        "val",
        objName,
        "fillCurve",
        "KP",
        DESTRUCT + "return " + code,
    ) as (val: Obj[keyof Obj], noteOrNode: Obj, fc: typeof fillCurve, kp: typeof KP, chart: KP.Chart) => any;
    return (val: Obj[keyof Obj], noteOrNode: Obj) => fn(val, noteOrNode, fillCurve, KP, operationList.chart);
}

export const ROKP = new Proxy(
    KP,
    {
        get(target, prop, receiver) {
            // @ts-expect-error 忽略此处类型安全
            return target[prop];
        },
        set(_1, _2, _3, _4) {
            throw new Error("KP is read-only");
        }
    }
)