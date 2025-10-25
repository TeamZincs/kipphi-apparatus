
import { queryCharts, queryMeta } from "../../queryCharts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    console.log("?")
    return {
        chartInfos: await queryCharts(),
        meta: await queryMeta()
    };
    
};