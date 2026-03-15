import { Respack } from "kipphi-player";
import { unzip } from "./uncompress";
import { getFileInRespack } from "./background";
import { KPASettings } from "./settings.svelte";
import { writable, type Writable } from "svelte/store";

export let respack: Respack;
export let respackId: Writable<string> = writable("Default");
export async function useDefaultRespack() {
    respackId.set("Default")
    respack = await Respack.loadFromPhira(
        async (filename) => {
            if (filename.endsWith(".ogg")) {
                return null;
            }
            const res = await fetch(`/default/${filename}`);
            if (!res.ok) {
                return null;
            }
            return res.blob();
        }
    );
    KPASettings.respack = "Default";
}

export async function useUserRespack(respackName: string) {
    respackId.set(respackName);
    respack = await Respack.loadFromPhira(
        async (filename) => {
            return await getFileInRespack(respackName, filename);
        }
    )
    KPASettings.respack = respackName
}

export async function useRespack(respackName: string) {
    if (respackName === "Default") {
        return await useDefaultRespack(); 
    }
    return await useUserRespack(respackName);
}

let prom = useRespack(KPASettings.respack);

export async function waitRespack() {
    await prom;
}
