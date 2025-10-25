
import { queryCharts } from "#/queryCharts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    console.log("?")
    return {
        chartInfos: await queryCharts()
    };
    
};
//*/
