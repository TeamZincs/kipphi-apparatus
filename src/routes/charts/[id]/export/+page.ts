import type { PageLoad } from "./$types";
import { queryCharts, readChart, queryMeta } from "#/background";

export const load: PageLoad = async (event) => {
    const id = event.params.id;
    return {
        id
    }
    
};