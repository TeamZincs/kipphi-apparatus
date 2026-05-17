
import { queryCharts } from "#/background";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    console.log("?")
    const chartInfos = await queryCharts()
    console.log(chartInfos);
    return {
        chartInfos
    };
    
};
//*/
