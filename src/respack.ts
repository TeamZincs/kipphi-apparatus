import { Respack } from "kipphi-player";

export let respack: Respack = await Respack.loadFromPhira(
    async (filename) => {
        const res = await fetch(`/default/${filename}`);
        return res.blob();
    }
);