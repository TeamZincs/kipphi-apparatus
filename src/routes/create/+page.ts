
import { queryCharts, queryMeta } from "../../background";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    console.log("?")
    return {
        chartInfos: await queryCharts(),
        meta: await queryMeta()
    };
    
};